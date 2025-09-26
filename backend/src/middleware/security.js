const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { logger } = require('../utils/logger');

// Security headers middleware
const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// API rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many API requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication rate limiter (stricter)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
const inputSanitationMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    try {
      // Validate that body can be serialized
      JSON.stringify(req.body);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body format',
      });
    }
  }
  next();
};

// Session security middleware
const sessionSecurityMiddleware = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

module.exports = {
  securityHeadersMiddleware,
  apiRateLimiter,
  authRateLimiter,
  inputSanitationMiddleware,
  sessionSecurityMiddleware,
};