/**
 * Enhanced Logger for Production
 * Provides structured logging with different levels and timestamps
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LEVEL_NAMES = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR'
};

const LEVEL_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m'  // Red
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  constructor() {
    // Get log level from environment or default to INFO
    const envLevel = (process.env.LOG_LEVEL || 'info').toUpperCase();
    this.level = LOG_LEVELS[envLevel] || LOG_LEVELS.INFO;
    this.enableColors = process.env.NODE_ENV !== 'production';
  }

  /**
   * Format log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const levelName = LEVEL_NAMES[level];
    
    // Base message
    let formatted = `[${timestamp}] [${levelName}]`;
    
    // Add colors in development
    if (this.enableColors) {
      const color = LEVEL_COLORS[levelName];
      formatted = `${color}${formatted}${RESET_COLOR}`;
    }
    
    formatted += ` ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      formatted += `\n  ${JSON.stringify(meta, null, 2)}`;
    }
    
    return formatted;
  }

  /**
   * Log at specific level
   */
  log(level, message, meta = {}) {
    if (level >= this.level) {
      const formatted = this.formatMessage(level, message, meta);
      
      if (level >= LOG_LEVELS.ERROR) {
        console.error(formatted);
      } else if (level >= LOG_LEVELS.WARN) {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  /**
   * Debug level logging
   */
  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  /**
   * Info level logging
   */
  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  /**
   * Warning level logging
   */
  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  /**
   * Error level logging
   */
  error(message, meta = {}) {
    // If message is an Error object, extract useful info
    if (message instanceof Error) {
      meta = {
        ...meta,
        stack: message.stack,
        name: message.name
      };
      message = message.message;
    }
    
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  /**
   * Log HTTP request
   */
  http(req, res, duration) {
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
    const meta = {
      method,
      url: originalUrl,
      statusCode,
      ip,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent')
    };
    
    // Log as warning for 4xx/5xx status codes
    if (statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  /**
   * Log database query
   */
  database(query, duration, error = null) {
    if (error) {
      this.error('Database query failed', {
        query,
        duration: `${duration}ms`,
        error: error.message
      });
    } else {
      this.debug('Database query executed', {
        query,
        duration: `${duration}ms`
      });
    }
  }

  /**
   * Log authentication event
   */
  auth(event, user, success = true, meta = {}) {
    const message = `Authentication: ${event} - ${success ? 'Success' : 'Failed'}`;
    const logMeta = {
      event,
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      success,
      ...meta
    };
    
    if (success) {
      this.info(message, logMeta);
    } else {
      this.warn(message, logMeta);
    }
  }

  /**
   * Log audit event (for compliance)
   */
  audit(action, user, resource, meta = {}) {
    const message = `AUDIT: ${action} on ${resource}`;
    const logMeta = {
      action,
      resource,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      timestamp: new Date().toISOString(),
      ...meta
    };
    
    // Audit logs always logged at INFO level, regardless of LOG_LEVEL
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, logMeta));
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = { logger, Logger };
