/**
 * Production-ready logging utility
 * - Sanitizes sensitive data before logging
 * - Only logs in development mode by default
 * - Provides structured logging for error tracking
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

const isProduction = process.env.NODE_ENV === 'production';

// Patterns to sanitize from logs
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /token/i,
  /password/i,
  /secret/i,
  /credential/i,
  /authorization/i,
];

/**
 * Sanitize potentially sensitive data from log entries
 */
const sanitize = (data: unknown): unknown => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Truncate very long strings (like base64 images)
    if (data.length > 500) {
      return `${data.substring(0, 100)}... [truncated ${data.length - 100} chars]`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      // Check if key contains sensitive patterns
      const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  }

  return data;
};

/**
 * Format log entry for output
 */
const formatLogEntry = (entry: LogEntry): string => {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  if (entry.data) {
    return `${prefix} ${entry.message} ${JSON.stringify(entry.data)}`;
  }
  return `${prefix} ${entry.message}`;
};

/**
 * Create a log entry
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): LogEntry => ({
  level,
  message,
  timestamp: new Date().toISOString(),
  data: data ? (sanitize(data) as Record<string, unknown>) : undefined,
});

/**
 * Logger object with level-specific methods
 */
export const logger = {
  /**
   * Debug level - only in development
   */
  debug: (message: string, data?: Record<string, unknown>): void => {
    if (!isProduction) {
      const entry = createLogEntry('debug', message, data);
      console.debug(formatLogEntry(entry));
    }
  },

  /**
   * Info level - only in development
   */
  info: (message: string, data?: Record<string, unknown>): void => {
    if (!isProduction) {
      const entry = createLogEntry('info', message, data);
      console.info(formatLogEntry(entry));
    }
  },

  /**
   * Warning level - logs in both dev and production
   */
  warn: (message: string, data?: Record<string, unknown>): void => {
    const entry = createLogEntry('warn', message, data);
    console.warn(formatLogEntry(entry));
  },

  /**
   * Error level - always logs, sanitized in production
   */
  error: (message: string, error?: Error, data?: Record<string, unknown>): void => {
    const entry = createLogEntry('error', message, {
      ...data,
      errorMessage: error?.message,
      errorStack: isProduction ? undefined : error?.stack,
    });

    console.error(formatLogEntry(entry));

    // In production, you would send this to a monitoring service
    if (isProduction && typeof window !== 'undefined') {
      // Example: Send to monitoring endpoint
      // fetch('/api/log', { method: 'POST', body: JSON.stringify(entry) });
    }
  },
};

/**
 * Log user actions for analytics (sanitized)
 */
export const logUserAction = (action: string, details?: Record<string, unknown>): void => {
  if (!isProduction) {
    logger.debug(`User Action: ${action}`, details);
  }
};

/**
 * Log API calls (without sensitive data)
 */
export const logApiCall = (
  endpoint: string,
  method: string,
  success: boolean,
  duration?: number
): void => {
  const data = { endpoint, method, success, duration };

  if (success) {
    logger.debug(`API Call: ${method} ${endpoint}`, data);
  } else {
    logger.warn(`API Call Failed: ${method} ${endpoint}`, data);
  }
};

export default logger;
