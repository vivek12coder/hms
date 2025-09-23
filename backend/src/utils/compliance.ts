import cron from 'node-cron';
import database from '../config/database';
import { AuditLogger } from './auditLogger';
import SecurityUtils from './security';

const auditLogger = AuditLogger.getInstance();

export class ComplianceManager {
  private static instance: ComplianceManager;
  
  private constructor() {}
  
  public static getInstance(): ComplianceManager {
    if (!ComplianceManager.instance) {
      ComplianceManager.instance = new ComplianceManager();
    }
    return ComplianceManager.instance;
  }

  /**
   * Initialize compliance management with scheduled tasks
   */
  public initialize(): void {
    this.scheduleDataRetentionCleanup();
    this.scheduleComplianceReporting();
    this.scheduleAuditLogMaintenance();
    
    console.log('✅ Compliance Manager initialized with scheduled tasks');
  }

  /**
   * Schedule automatic data retention cleanup
   * Runs daily at 2 AM
   */
  private scheduleDataRetentionCleanup(): void {
    cron.schedule('0 2 * * *', async () => {
      try {
        await this.performDataRetentionCleanup();
        await auditLogger.logSystemEvent(
          'DATA_RETENTION_CLEANUP',
          { scheduledTask: true },
          'LOW',
          'SUCCESS'
        );
      } catch (error) {
        console.error('Data retention cleanup failed:', error);
        await auditLogger.logSystemEvent(
          'DATA_RETENTION_CLEANUP_FAILED',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'HIGH',
          'FAILURE'
        );
      }
    }, {
      timezone: 'UTC'
    });
  }

  /**
   * Schedule weekly compliance reports
   * Runs every Sunday at 6 AM
   */
  private scheduleComplianceReporting(): void {
    cron.schedule('0 6 * * 0', async () => {
      try {
        await this.generateWeeklyComplianceReport();
        await auditLogger.logSystemEvent(
          'COMPLIANCE_REPORT_GENERATED',
          { type: 'weekly', scheduledTask: true },
          'LOW',
          'SUCCESS'
        );
      } catch (error) {
        console.error('Compliance report generation failed:', error);
        await auditLogger.logSystemEvent(
          'COMPLIANCE_REPORT_FAILED',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'MEDIUM',
          'FAILURE'
        );
      }
    }, {
      timezone: 'UTC'
    });
  }

  /**
   * Schedule audit log maintenance
   * Runs monthly on the 1st at 3 AM
   */
  private scheduleAuditLogMaintenance(): void {
    cron.schedule('0 3 1 * *', async () => {
      try {
        await this.performAuditLogMaintenance();
        await auditLogger.logSystemEvent(
          'AUDIT_LOG_MAINTENANCE',
          { scheduledTask: true },
          'LOW',
          'SUCCESS'
        );
      } catch (error) {
        console.error('Audit log maintenance failed:', error);
        await auditLogger.logSystemEvent(
          'AUDIT_LOG_MAINTENANCE_FAILED',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'HIGH',
          'FAILURE'
        );
      }
    }, {
      timezone: 'UTC'
    });
  }

  /**
   * Perform data retention cleanup based on HIPAA requirements
   */
  private async performDataRetentionCleanup(): Promise<void> {
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);

    // Clean up old audit logs (keep for 6 years as per HIPAA)
    const deletedAuditLogs = await database.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: sixYearsAgo
        },
        // Keep critical and high-risk logs longer
        riskLevel: {
          notIn: ['CRITICAL', 'HIGH']
        }
      }
    });

    console.log(`🗑️ Cleaned up ${deletedAuditLogs.count} old audit log entries`);

    // Archive old patient data if marked for deletion
    const archivedPatients = await database.patient.updateMany({
      where: {
        updatedAt: {
          lt: sixYearsAgo
        },
        // Only archive if explicitly marked as inactive
        // In real implementation, you'd have a soft delete flag
      },
      data: {
        // Move to archived status or similar
        // This is a placeholder - actual implementation would depend on business rules
      }
    });
  }

  /**
   * Generate weekly compliance report
   */
  private async generateWeeklyComplianceReport(): Promise<void> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get audit statistics
    const auditStats = await database.auditLog.groupBy({
      by: ['action', 'riskLevel', 'outcome'],
      where: {
        createdAt: {
          gte: weekAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Get authentication attempts
    const authStats = await database.auditLog.groupBy({
      by: ['outcome'],
      where: {
        action: {
          in: ['LOGIN', 'FAILED_LOGIN', 'LOGOUT', 'PASSWORD_RESET']
        },
        createdAt: {
          gte: weekAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Get high-risk events
    const highRiskEvents = await database.auditLog.findMany({
      where: {
        riskLevel: {
          in: ['HIGH', 'CRITICAL']
        },
        createdAt: {
          gte: weekAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    // Get patient access patterns
    const patientAccessStats = await database.auditLog.groupBy({
      by: ['action'],
      where: {
        action: {
          in: ['PATIENT_VIEW', 'PATIENT_UPDATE', 'PATIENT_CREATE']
        },
        createdAt: {
          gte: weekAgo
        }
      },
      _count: {
        id: true
      }
    });

    const complianceReport = {
      reportDate: new Date().toISOString(),
      period: {
        from: weekAgo.toISOString(),
        to: new Date().toISOString()
      },
      statistics: {
        totalEvents: auditStats.reduce((sum: number, stat: any) => sum + stat._count.id, 0),
        byEventType: auditStats.reduce((acc: Record<string, number>, stat: any) => {
          acc[stat.action] = (acc[stat.action] || 0) + stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        byRiskLevel: auditStats.reduce((acc: Record<string, number>, stat: any) => {
          acc[stat.riskLevel] = (acc[stat.riskLevel] || 0) + stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        authenticationEvents: authStats,
        patientAccessEvents: patientAccessStats
      },
      highRiskEvents: highRiskEvents.length,
      complianceStatus: this.assessComplianceStatus(auditStats, highRiskEvents)
    };

    // Store the report (in real implementation, you might email it or store in a specific location)
    console.log('📊 Weekly Compliance Report Generated:', {
      totalEvents: complianceReport.statistics.totalEvents,
      highRiskEvents: complianceReport.highRiskEvents,
      complianceStatus: complianceReport.complianceStatus
    });

    // Log the report generation
    await auditLogger.logSystemEvent(
      'COMPLIANCE_REPORT',
      complianceReport,
      'LOW',
      'SUCCESS'
    );
  }

  /**
   * Perform audit log maintenance
   */
  private async performAuditLogMaintenance(): Promise<void> {
    // Verify hash chain integrity (placeholder - implementing simple check)
    let integrityCheck = { isValid: true, corruptedEntries: [], details: 'Hash chain integrity verified' };
    
    // In a real implementation, this would verify the actual hash chain
    const recentLogs = await database.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });
    
    // Simple integrity check - verify no gaps in timestamps
    for (let i = 1; i < recentLogs.length; i++) {
      const current = recentLogs[i];
      const previous = recentLogs[i - 1];
      
      // Check for suspicious gaps or tampering indicators
      if (current.createdAt > previous.createdAt) {
        // Potential chronological issue detected
        integrityCheck.isValid = false;
        integrityCheck.details = 'Chronological inconsistency detected';
        break;
      }
    }
    
    if (!integrityCheck.isValid) {
      await auditLogger.logSystemEvent(
        'AUDIT_INTEGRITY_VIOLATION',
        { 
          corruptedEntries: integrityCheck.corruptedEntries?.length || 0,
          details: integrityCheck.details 
        },
        'CRITICAL',
        'FAILURE'
      );
      
      // Alert administrators
      console.error('🚨 CRITICAL: Audit log integrity compromised!', integrityCheck);
    }

    // Compress old audit logs (placeholder - actual implementation would compress data)
    const oldLogs = await database.auditLog.count({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
        }
      }
    });

    console.log(`📦 Found ${oldLogs} audit logs eligible for compression`);
  }

  /**
   * Assess overall compliance status
   */
  private assessComplianceStatus(auditStats: any[], highRiskEvents: any[]): string {
    const totalEvents = auditStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const failureEvents = auditStats.filter(stat => stat.outcome === 'FAILURE')
                                   .reduce((sum, stat) => sum + stat._count.id, 0);
    
    const failureRate = totalEvents > 0 ? (failureEvents / totalEvents) * 100 : 0;
    const highRiskCount = highRiskEvents.length;

    if (highRiskCount > 10 || failureRate > 10) {
      return 'NEEDS_ATTENTION';
    } else if (highRiskCount > 5 || failureRate > 5) {
      return 'MONITORING_REQUIRED';
    } else {
      return 'COMPLIANT';
    }
  }

  /**
   * Generate on-demand compliance report
   */
  public async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const auditEvents = await database.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      reportDate: new Date().toISOString(),
      period: {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      },
      totalEvents: auditEvents.length,
      eventsByType: auditEvents.reduce((acc: Record<string, number>, event: any) => {
        acc[event.action] = (acc[event.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      eventsByRisk: auditEvents.reduce((acc: Record<string, number>, event: any) => {
        acc[event.riskLevel] = (acc[event.riskLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      failureRate: ((auditEvents.filter((e: any) => e.outcome === 'FAILURE').length / auditEvents.length) * 100).toFixed(2),
      highRiskEvents: auditEvents.filter((e: any) => ['HIGH', 'CRITICAL'].includes(e.riskLevel)).length
    };
  }

  /**
   * Perform immediate HIPAA compliance check
   */
  public async performHIPAAComplianceCheck(): Promise<any> {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Check for suspicious access patterns
    const suspiciousAccess = await database.auditLog.findMany({
      where: {
        action: 'PATIENT_VIEW',
        createdAt: {
          gte: last30Days
        }
      },
      select: {
        userId: true,
        patientId: true,
        ipAddress: true
      }
    });

    // Group by user to find potential violations
    interface UserAccessStats {
      patientAccesses: Set<string>;
      ipAddresses: Set<string>;
      totalAccesses: number;
    }
    
    const accessByUser = suspiciousAccess.reduce((acc: Record<string, UserAccessStats>, access: any) => {
      if (!acc[access.userId]) {
        acc[access.userId] = {
          patientAccesses: new Set(),
          ipAddresses: new Set(),
          totalAccesses: 0
        };
      }
      
      acc[access.userId].patientAccesses.add(access.patientId);
      acc[access.userId].ipAddresses.add(access.ipAddress);
      acc[access.userId].totalAccesses++;
      
      return acc;
    }, {} as Record<string, UserAccessStats>);

    // Find potential violations
    const potentialViolations = Object.entries(accessByUser).filter(([userId, stats]) => {
      const userStats = stats as UserAccessStats;
      return userStats.patientAccesses.size > 50 || // Accessing too many patients
             userStats.ipAddresses.size > 5 ||      // Accessing from too many locations
             userStats.totalAccesses > 200;         // Too many total accesses
    });

    return {
      checkDate: now.toISOString(),
      period: `Last 30 days (${last30Days.toISOString()} - ${now.toISOString()})`,
      totalUsers: Object.keys(accessByUser).length,
      potentialViolations: potentialViolations.length,
      violationDetails: potentialViolations.map(([userId, stats]) => {
        const userStats = stats as UserAccessStats;
        return {
          userId,
          uniquePatients: userStats.patientAccesses.size,
          uniqueIPs: userStats.ipAddresses.size,
          totalAccesses: userStats.totalAccesses
        };
      }),
      recommendedActions: potentialViolations.length > 0 ? [
        'Review user access patterns',
        'Verify legitimate business need for extensive patient access',
        'Consider implementing role-based access controls',
        'Monitor for data breach indicators'
      ] : ['No compliance issues detected']
    };
  }
}

export default ComplianceManager;