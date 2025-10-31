const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. Invalid authorization header.' 
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error.' 
      });
    }

    // Verify token with additional checks
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'], // Explicitly specify allowed algorithms
      maxAge: '24h' // Enforce maximum token age
    });

    // Validate decoded token structure
    if (!decoded.id || !decoded.email || !decoded.role) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token structure.' 
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired. Please login again.' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token.' 
      });
    }
    logger.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed.' 
    });
  }
};

// Role-based authorization middleware with proper enforcement
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. Please authenticate.' 
      });
    }

    // If no roles specified, just check authentication
    if (!allowedRoles.length) {
      return next();
    }

    // Check if user has required role
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!rolesArray.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.email} (${req.user.role}) to endpoint requiring ${rolesArray.join(', ')}`);
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

// Role-specific middleware with proper enforcement
const adminOnly = authorize(['ADMIN']);
const doctorOnly = authorize(['DOCTOR']);
const patientOnly = authorize(['PATIENT']);
const receptionistOnly = authorize(['RECEPTIONIST']);
const doctorOrAdmin = authorize(['DOCTOR', 'ADMIN']);
const authenticatedUser = authorize(); // Just check authentication

module.exports = {
  auth,
  authorize,
  adminOnly,
  doctorOnly,
  patientOnly,
  doctorOrAdmin,
  authenticatedUser,
};