const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { logger } = require('../utils/logger');

// Enhanced security headers middleware with stricter CSP
const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in production
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
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  xssFilter: true,
});

// API rate limiter with enhanced configuration
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many API requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests (optional - removes from count)
  skipSuccessfulRequests: false,
  // Skip failed requests (optional)
  skipFailedRequests: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
  },
});

// Authentication rate limiter (stricter) to prevent brute force
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Email: ${req.body?.email || 'unknown'}`);
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});

// Enhanced input sanitization middleware with XSS protection
const inputSanitationMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    try {
      // Validate that body can be serialized
      JSON.stringify(req.body);
      
      // Recursively sanitize strings in request body
      const sanitizeObject = (obj) => {
        for (let key in obj) {
          if (typeof obj[key] === 'string') {
            // Remove potential XSS vectors
            obj[key] = obj[key]
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      };
      
      sanitizeObject(req.body);
    } catch (error) {
      logger.error('Input sanitization error:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid request body format',
      });
    }
  }
  next();
};

// Enhanced session security middleware
const sessionSecurityMiddleware = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server header to obscure technology stack
  res.removeHeader('X-Powered-By');
  
  next();
};

module.exports = {
  securityHeadersMiddleware,
  apiRateLimiter,
  authRateLimiter,
  inputSanitationMiddleware,
  sessionSecurityMiddleware,
};