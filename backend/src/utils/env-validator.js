/**
 * Environment Variable Validator
 * Validates required environment variables on application startup
 */

const { logger } = require('./logger');

const requiredEnvVars = {
  // Server
  NODE_ENV: {
    required: true,
    values: ['development', 'production', 'test'],
    default: 'development'
  },
  PORT: {
    required: false,
    default: '3001'
  },
  
  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL connection string with connection pooling'
  },
  DIRECT_URL: {
    required: true,
    description: 'PostgreSQL direct connection string for migrations'
  },
  
  // JWT
  JWT_SECRET: {
    required: true,
    minLength: 32,
    description: 'Secret key for JWT signing (minimum 32 characters)'
  },
  JWT_EXPIRES_IN: {
    required: false,
    default: '7d',
    description: 'JWT token expiration time'
  },
  
  // CORS
  CORS_ORIGIN: {
    required: true,
    description: 'Allowed frontend origin(s) for CORS'
  },
  
  // Logging
  LOG_LEVEL: {
    required: false,
    values: ['debug', 'info', 'warn', 'error'],
    default: 'info'
  }
};

/**
 * Validate environment variables
 * @throws {Error} If required variables are missing or invalid
 */
function validateEnv() {
  const errors = [];
  const warnings = [];

  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = process.env[key];

    // Check if required variable is missing
    if (config.required && !value) {
      errors.push({
        variable: key,
        message: `Missing required environment variable: ${key}`,
        description: config.description || 'No description available'
      });
      return;
    }

    // Set default if not provided
    if (!value && config.default) {
      process.env[key] = config.default;
      warnings.push(`Using default value for ${key}: ${config.default}`);
      return;
    }

    // Validate against allowed values
    if (value && config.values && !config.values.includes(value)) {
      errors.push({
        variable: key,
        message: `Invalid value for ${key}: "${value}"`,
        description: `Must be one of: ${config.values.join(', ')}`
      });
    }

    // Validate minimum length
    if (value && config.minLength && value.length < config.minLength) {
      errors.push({
        variable: key,
        message: `${key} is too short`,
        description: `Minimum length: ${config.minLength} characters, got: ${value.length}`
      });
    }
  });

  // Log warnings
  warnings.forEach(warning => logger.warn(warning));

  // If there are errors, log them and throw
  if (errors.length > 0) {
    logger.error('Environment variable validation failed:');
    errors.forEach(error => {
      logger.error(`  ❌ ${error.variable}: ${error.message}`);
      if (error.description) {
        logger.error(`     ${error.description}`);
      }
    });
    
    throw new Error(
      `Environment validation failed. Missing or invalid: ${errors.map(e => e.variable).join(', ')}`
    );
  }

  // Success
  logger.info('✅ Environment variables validated successfully');
  
  // Log configuration (mask sensitive values)
  logger.info('Configuration:');
  logger.info(`  NODE_ENV: ${process.env.NODE_ENV}`);
  logger.info(`  PORT: ${process.env.PORT}`);
  logger.info(`  DATABASE_URL: ${maskConnectionString(process.env.DATABASE_URL)}`);
  logger.info(`  JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`);
  logger.info(`  CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
  logger.info(`  LOG_LEVEL: ${process.env.LOG_LEVEL}`);
}

/**
 * Mask sensitive parts of connection strings
 */
function maskConnectionString(str) {
  if (!str) return 'Not set';
  return str.replace(/:[^:@]+@/, ':****@');
}

/**
 * Check if running in production
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
function isTest() {
  return process.env.NODE_ENV === 'test';
}

module.exports = {
  validateEnv,
  isProduction,
  isDevelopment,
  isTest
};
