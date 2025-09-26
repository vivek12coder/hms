const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Audit Logging Service
 * HIPAA-compliant audit trail for all healthcare operations
 */

class AuditLogger {
  constructor() {
    this.previousHash = null;
  }

  /**
   * Create tamper-proof hash chain for audit trail integrity
   * @param {string} currentData - Current audit log data
   * @returns {string} Hash chain value
   */
  createHashChain(currentData) {
    const dataToHash = this.previousHash ? 
      `${this.previousHash}${currentData}` : currentData;
    
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    this.previousHash = hash;
    return hash;
  }

  /**
   * Determine risk level based on action and resource
   * @param {string} action - Action performed
   * @param {string} resource - Resource accessed
   * @returns {string} Risk level
   */
  determineRiskLevel(action, resource) {
    // High-risk operations
    if (['DELETE', 'BULK_DELETE'].includes(action)) return 'HIGH';
    if (resource === 'USER' && ['CREATE', 'UPDATE', 'ROLE_CHANGE'].includes(action)) return 'HIGH';
    if (resource === 'PATIENT' && action === 'ACCESS_PHI') return 'MEDIUM';
    if (resource === 'BILLING' && ['CREATE', 'UPDATE', 'DELETE'].includes(action)) return 'MEDIUM';
    
    // Medium-risk operations
    if (['CREATE', 'UPDATE'].includes(action)) return 'MEDIUM';
    if (['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE'].includes(action)) return 'MEDIUM';
    
    // Low-risk operations
    return 'LOW';
  }

  /**
   * Log audit trail entry
   * @param {Object} params - Audit parameters
   * @returns {Promise<Object>} Created audit log entry
   */
  async log({
    userId,
    userRole,
    action,
    resource,
    resourceId = null,
    patientId = null,
    details = null,
    ipAddress,
    userAgent,
    outcome = 'SUCCESS',
    reason = null
  }) {
    try {
      const riskLevel = this.determineRiskLevel(action, resource);
      
      // Prepare data for hash chain
      const auditData = JSON.stringify({
        userId,
        action,
        resource,
        resourceId,
        timestamp: new Date().toISOString(),
        outcome
      });

      const hashChain = this.createHashChain(auditData);

      // Create audit log entry
      const auditLog = await prisma.auditLog.create({
        data: {
          userId,
          userRole,
          action,
          resource,
          resourceId,
          patientId,
          details: details ? JSON.stringify(details) : null,
          ipAddress,
          userAgent,
          outcome,
          riskLevel,
          reason,
          hashChain
        }
      });

      // Log high-risk activities to console for immediate monitoring
      if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
        console.warn('HIGH-RISK AUDIT LOG:', {
          id: auditLog.id,
          userId,
          userRole,
          action,
          resource,
          riskLevel,
          timestamp: auditLog.createdAt
        });
      }

      return auditLog;
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw error to avoid breaking main operations
      // But ensure critical audit failures are logged
      console.error('CRITICAL: Audit logging failure for:', {
        userId,
        action,
        resource,
        error: error.message
      });
    }
  }

  /**
   * Create audit middleware for Express routes
   * @param {string} resource - Resource being accessed
   * @param {string} action - Action being performed
   */
  createMiddleware(resource, action) {
    return async (req, res, next) => {
      // Store audit context for use after operation
      req.auditContext = {
        resource,
        action,
        startTime: Date.now()
      };

      // Override res.json to capture outcome
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // Log the audit after response is sent
        setImmediate(async () => {
          try {
            const outcome = res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS';
            const details = {
              statusCode: res.statusCode,
              duration: Date.now() - req.auditContext.startTime,
              method: req.method,
              endpoint: req.path
            };

            await this.log({
              userId: req.user?.id || 'anonymous',
              userRole: req.user?.role || 'unknown',
              action: req.auditContext.action,
              resource: req.auditContext.resource,
              resourceId: req.params.id || req.params.patientId || req.params.appointmentId,
              patientId: this.extractPatientId(req),
              details,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent') || 'unknown',
              outcome,
              reason: outcome === 'FAILURE' ? data.message : null
            });
          } catch (auditError) {
            console.error('Post-response audit logging failed:', auditError);
          }
        });

        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Extract patient ID from request context
   * @param {Object} req - Express request object
   * @returns {string|null} Patient ID
   */
  extractPatientId(req) {
    // Direct patient ID parameter
    if (req.params.patientId) return req.params.patientId;
    
    // If user is a patient, use their patient ID
    if (req.user?.role === 'PATIENT' && req.user.patient?.id) {
      return req.user.patient.id;
    }
    
    // Extract from request body if creating/updating patient data
    if (req.body?.patientId) return req.body.patientId;
    
    return null;
  }

  /**
   * Log authentication events
   */
  async logAuth(userId, userRole, action, ipAddress, userAgent, outcome = 'SUCCESS', reason = null) {
    return this.log({
      userId,
      userRole,
      action,
      resource: 'AUTH',
      ipAddress,
      userAgent,
      outcome,
      reason
    });
  }

  /**
   * Log patient data access (for HIPAA compliance)
   */
  async logPatientAccess(userId, userRole, patientId, accessType, ipAddress, userAgent) {
    return this.log({
      userId,
      userRole,
      action: accessType,
      resource: 'PATIENT_PHI',
      patientId,
      ipAddress,
      userAgent,
      details: { accessType }
    });
  }

  /**
   * Log activity with simplified interface for routes
   */
  async logActivity({
    userId,
    action,
    resourceType,
    resourceId,
    details = {},
    ipAddress = null,
    userAgent = null
  }) {
    return this.log({
      userId,
      userRole: 'USER', // Default role if not provided
      action,
      resource: resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent
    });
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

module.exports = {
  AuditService: auditLogger,
  AuditLogger,
  auditLogger
};