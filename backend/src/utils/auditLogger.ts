import { Request } from 'express';
import prisma from '../config/database';
import SecurityUtils from './security';

// Using imported prisma instance from database config

export interface AuditLogEntry {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  patientId?: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason?: string;
  timestamp: Date;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logQueue: AuditLogEntry[] = [];
  private isProcessing = false;

  private constructor() {
    // Start processing queue
    this.processQueue();
    
    // Process queue every 5 seconds
    setInterval(() => {
      this.processQueue();
    }, 5000);
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log HIPAA-compliant audit event
   */
  async logEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    // Add to queue for batch processing
    this.logQueue.push(auditEntry);

    // If high-risk event, process immediately
    if (entry.riskLevel === 'CRITICAL' || entry.riskLevel === 'HIGH') {
      await this.processQueue();
    }
  }

  /**
   * Log patient data access (HIPAA requirement)
   */
  async logPatientAccess(req: Request, patientId: string, action: string, outcome: 'SUCCESS' | 'FAILURE' | 'WARNING' = 'SUCCESS', reason?: string): Promise<void> {
    const user = (req as any).user;
    
    await this.logEvent({
      userId: user?.id || 'anonymous',
      userRole: user?.role || 'UNKNOWN',
      action: `PATIENT_${action}`,
      resource: 'patient_data',
      resourceId: patientId,
      patientId: patientId,
      details: {
        endpoint: req.path,
        method: req.method,
        query: req.query,
        // Don't log sensitive request body data
        hasBody: !!req.body && Object.keys(req.body).length > 0
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      outcome,
      riskLevel: this.calculateRiskLevel(action, outcome, user?.role),
      reason
    });
  }

  /**
   * Log authentication events
   */
  async logAuthentication(req: Request, userId: string, action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PASSWORD_CHANGE', outcome: 'SUCCESS' | 'FAILURE' | 'WARNING', reason?: string): Promise<void> {
    await this.logEvent({
      userId: userId || 'anonymous',
      userRole: 'UNKNOWN',
      action: `AUTH_${action}`,
      resource: 'authentication',
      details: {
        endpoint: req.path,
        method: req.method
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      outcome,
      riskLevel: outcome === 'FAILURE' ? 'HIGH' : 'MEDIUM',
      reason
    });
  }

  /**
   * Log system events
   */
  async logSystemEvent(action: string, details: any, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW', outcome: 'SUCCESS' | 'FAILURE' | 'WARNING' = 'SUCCESS'): Promise<void> {
    await this.logEvent({
      userId: 'system',
      userRole: 'SYSTEM',
      action: `SYSTEM_${action}`,
      resource: 'system',
      details,
      ipAddress: 'localhost',
      userAgent: 'system',
      outcome,
      riskLevel
    });
  }

  /**
   * Log data export events (HIPAA requires tracking)
   */
  async logDataExport(req: Request, dataType: string, recordCount: number, exportFormat: string): Promise<void> {
    const user = (req as any).user;
    
    await this.logEvent({
      userId: user?.id || 'anonymous',
      userRole: user?.role || 'UNKNOWN',
      action: 'DATA_EXPORT',
      resource: dataType,
      details: {
        recordCount,
        exportFormat,
        endpoint: req.path
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      outcome: 'SUCCESS',
      riskLevel: recordCount > 100 ? 'HIGH' : 'MEDIUM'
    });
  }

  /**
   * Process the audit log queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batch = this.logQueue.splice(0, 50); // Process in batches of 50

    try {
      for (const entry of batch) {
        await this.persistAuditLog(entry);
      }
    } catch (error) {
      console.error('Failed to process audit log batch:', error);
      // Re-add failed entries to queue for retry
      this.logQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Persist audit log to database with tamper-proof hash
   */
  private async persistAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      // Get the last audit log hash for chain integrity
      const lastLog = await prisma.auditLog.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { hashChain: true }
      });

      const previousHash = lastLog?.hashChain || '0';
      const currentHash = SecurityUtils.generateAuditHash(previousHash, entry);

      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          userRole: entry.userRole,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          patientId: entry.patientId,
          details: entry.details ? JSON.stringify(entry.details) : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          outcome: entry.outcome,
          riskLevel: entry.riskLevel,
          reason: entry.reason,
          hashChain: currentHash
        }
      });

      // Check for suspicious patterns
      await this.detectSuspiciousActivity(entry);

    } catch (error) {
      console.error('Failed to persist audit log:', error);
      throw error;
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  private async detectSuspiciousActivity(entry: AuditLogEntry): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      // Check for multiple failed login attempts
      if (entry.action === 'AUTH_FAILED_LOGIN') {
        const recentFailures = await prisma.auditLog.count({
          where: {
            userId: entry.userId,
            action: 'AUTH_FAILED_LOGIN',
            createdAt: {
              gte: oneHourAgo
            }
          }
        });

        if (recentFailures >= 5) {
          await this.logSystemEvent(
            'SUSPICIOUS_LOGIN_ATTEMPTS',
            { userId: entry.userId, failureCount: recentFailures, ipAddress: entry.ipAddress },
            'CRITICAL',
            'WARNING'
          );
        }
      }

      // Check for unusual patient access patterns
      if (entry.patientId && entry.action.includes('PATIENT_')) {
        const recentAccess = await prisma.auditLog.count({
          where: {
            userId: entry.userId,
            patientId: entry.patientId,
            createdAt: {
              gte: oneHourAgo
            }
          }
        });

        if (recentAccess >= 20) {
          await this.logSystemEvent(
            'UNUSUAL_PATIENT_ACCESS_PATTERN',
            { userId: entry.userId, patientId: entry.patientId, accessCount: recentAccess },
            'HIGH',
            'WARNING'
          );
        }
      }

      // Check for access from multiple IPs
      const recentIPs = await prisma.auditLog.findMany({
        where: {
          userId: entry.userId,
          createdAt: {
            gte: oneHourAgo
          }
        },
        select: {
          ipAddress: true
        },
        distinct: ['ipAddress']
      });

      if (recentIPs.length >= 3) {
        await this.logSystemEvent(
          'MULTIPLE_IP_ACCESS',
          { userId: entry.userId, ipAddresses: recentIPs.map((r: any) => r.ipAddress) },
          'HIGH',
          'WARNING'
        );
      }

    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
    }
  }

  /**
   * Calculate risk level based on action and context
   */
  private calculateRiskLevel(action: string, outcome: string, userRole?: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (outcome === 'FAILURE') {
      return 'HIGH';
    }

    if (action.includes('DELETE') || action.includes('EXPORT')) {
      return 'HIGH';
    }

    if (action.includes('UPDATE') || action.includes('CREATE')) {
      return 'MEDIUM';
    }

    if (userRole === 'ADMIN' || userRole === 'SYSTEM') {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Get client IP address from request
   */
  private getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const totalEvents = await prisma.auditLog.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const eventsByRisk = await prisma.auditLog.groupBy({
        by: ['riskLevel'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      });

      const eventsByOutcome = await prisma.auditLog.groupBy({
        by: ['outcome'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      });

      const patientAccessEvents = await prisma.auditLog.count({
        where: {
          action: {
            contains: 'PATIENT_'
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      return {
        reportPeriod: {
          start: startDate,
          end: endDate
        },
        summary: {
          totalEvents,
          patientAccessEvents,
          riskDistribution: eventsByRisk,
          outcomeDistribution: eventsByOutcome
        },
        generatedAt: new Date(),
        version: '1.0'
      };

    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }
}

export default AuditLogger;