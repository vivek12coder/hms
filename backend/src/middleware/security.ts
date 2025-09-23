import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AuditLogger } from '../utils/auditLogger';
import SecurityUtils from '../utils/security';

const auditLogger = AuditLogger.getInstance();

/**
 * HIPAA Compliance Middleware
 * Ensures all patient data access is logged and authorized
 */
export const hipaaComplianceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // Check if this is a patient data access request
  const isPatientDataRequest = req.path.includes('/patients') || 
                               req.path.includes('/appointments') || 
                               req.path.includes('/billing');
  
  if (isPatientDataRequest && user) {
    // Extract patient ID from URL parameters or request body
    const patientId = req.params.id || req.params.patientId || req.body.patientId;
    
    // Validate minimum necessary access
    const hasPermission = SecurityUtils.validatePHIAccess(user.role, getResourceType(req.path));
    
    if (!hasPermission) {
      await auditLogger.logPatientAccess(req, patientId || 'unknown', 'ACCESS_DENIED', 'FAILURE', 'Insufficient permissions');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Insufficient permissions for PHI access' 
      });
    }
    
    // Log the access attempt
    if (patientId) {
      await auditLogger.logPatientAccess(req, patientId, getActionType(req.method), 'SUCCESS');
    }
  }
  
  next();
};

/**
 * Input sanitization middleware
 */
export const inputSanitationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeObject(req.query);
    // Replace individual properties instead of the entire query object
    Object.keys(req.query).forEach(key => {
      if (sanitizedQuery[key] !== undefined) {
        (req.query as any)[key] = sanitizedQuery[key];
      }
    });
  }
  
  next();
};

/**
 * Session security middleware
 */
export const sessionSecurityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = getClientIP(req);
  
  if (token) {
    const isValidSession = SecurityUtils.validateSession(token, userAgent, ipAddress);
    
    if (!isValidSession) {
      await auditLogger.logAuthentication(req, 'unknown', 'FAILED_LOGIN', 'FAILURE', 'Invalid session token');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }
  }
  
  next();
};

/**
 * Rate limiting for API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req: Request, res: Response) => {
    await auditLogger.logSystemEvent(
      'RATE_LIMIT_EXCEEDED',
      { 
        ip: getClientIP(req), 
        userAgent: req.get('User-Agent'),
        endpoint: req.path 
      },
      'HIGH',
      'WARNING'
    );
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later'
    });
  }
});

/**
 * Authentication rate limiting (stricter)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  skipSuccessfulRequests: true,
  handler: async (req: Request, res: Response) => {
    await auditLogger.logSystemEvent(
      'AUTH_RATE_LIMIT_EXCEEDED',
      { 
        ip: getClientIP(req), 
        userAgent: req.get('User-Agent'),
        email: req.body?.email 
      },
      'CRITICAL',
      'WARNING'
    );
    
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later'
    });
  }
});

/**
 * Security headers middleware using helmet
 */
export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Data export logging middleware
 */
export const dataExportMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Override res.json to log data exports
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Check if this looks like a data export response
    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      auditLogger.logDataExport(
        req,
        getResourceType(req.path),
        data.data.length,
        'JSON'
      );
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Error handling middleware with security logging
 */
export const securityErrorHandler = async (error: any, req: Request, res: Response, next: NextFunction) => {
  // Log security-relevant errors
  if (error.status === 401 || error.status === 403) {
    await auditLogger.logSystemEvent(
      'SECURITY_ERROR',
      {
        error: error.message,
        endpoint: req.path,
        method: req.method,
        ip: getClientIP(req),
        userAgent: req.get('User-Agent')
      },
      'HIGH',
      'FAILURE'
    );
  }
  
  // Don't expose internal errors to clients
  if (process.env.NODE_ENV === 'production') {
    res.status(error.status || 500).json({
      success: false,
      message: error.status < 500 ? error.message : 'Internal server error'
    });
  } else {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

// Helper functions
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? SecurityUtils.sanitizeInput(obj) : obj;
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeObject(item));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      sanitized[key] = SecurityUtils.sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function getResourceType(path: string): string {
  if (path.includes('/patients')) return 'patients';
  if (path.includes('/doctors')) return 'doctors';
  if (path.includes('/appointments')) return 'appointments';
  if (path.includes('/billing')) return 'billing';
  if (path.includes('/auth')) return 'authentication';
  return 'unknown';
}

function getActionType(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET': return 'READ';
    case 'POST': return 'CREATE';
    case 'PUT': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'UNKNOWN';
  }
}

function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.headers['x-real-ip'] as string ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         'unknown';
}

// All exports are already declared above with export keyword