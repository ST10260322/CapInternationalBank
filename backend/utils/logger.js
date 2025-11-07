import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Security-specific format for console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');

// Security events logger 
const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Daily rotating file for security events
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      level: 'info'
    }),
    // Separate file for security errors/alerts
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-errors-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'warn'
    }),
    // Console output for development
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  ]
});

// Application logger (general logs)
const appLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Security event types
export const SecurityEvents = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  BRUTE_FORCE_BLOCKED: 'BRUTE_FORCE_BLOCKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CSRF_VALIDATION_FAILED: 'CSRF_VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  NOSQL_INJECTION_ATTEMPT: 'NOSQL_INJECTION_ATTEMPT',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_DESTROYED: 'SESSION_DESTROYED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY'
};

// Helper function to log security events
export const logSecurityEvent = (eventType, data = {}) => {
  const logData = {
    event: eventType,
    timestamp: new Date().toISOString(),
    ...data
  };

  // Determine log level based on event type
  if (eventType.includes('BLOCKED') || eventType.includes('FAILED') || eventType.includes('ATTEMPT')) {
    securityLogger.warn('Security Event', logData);
  } else {
    securityLogger.info('Security Event', logData);
  }
};

export { securityLogger, appLogger };