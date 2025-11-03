/**
 * Application-wide Constants
 * Central location for all constant values used across the backend
 */

// User Roles
const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST'
};

// Appointment Status
const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

// Billing Status
const BILLING_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

// Prescription Status
const PRESCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFILL_REQUESTED: 'REFILL_REQUESTED'
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  INSURANCE: 'INSURANCE',
  ONLINE: 'ONLINE'
};

// Gender Options
const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY'
};

// Blood Groups
const BLOOD_GROUPS = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-'
};

// Doctor Specializations
const SPECIALIZATIONS = {
  GENERAL_PHYSICIAN: 'General Physician',
  CARDIOLOGIST: 'Cardiologist',
  DERMATOLOGIST: 'Dermatologist',
  PEDIATRICIAN: 'Pediatrician',
  ORTHOPEDIC: 'Orthopedic',
  NEUROLOGIST: 'Neurologist',
  GYNECOLOGIST: 'Gynecologist',
  PSYCHIATRIST: 'Psychiatrist',
  OPHTHALMOLOGIST: 'Ophthalmologist',
  ENT_SPECIALIST: 'ENT Specialist',
  DENTIST: 'Dentist',
  SURGEON: 'Surgeon'
};

// Audit Actions
const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  PRINT: 'PRINT'
};

// API Response Messages
const RESPONSE_MESSAGES = {
  // Success
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token',
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  
  // Validation
  VALIDATION_ERROR: 'Validation failed',
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  
  // Errors
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  
  // Specific entities
  USER_NOT_FOUND: 'User not found',
  PATIENT_NOT_FOUND: 'Patient not found',
  DOCTOR_NOT_FOUND: 'Doctor not found',
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  PRESCRIPTION_NOT_FOUND: 'Prescription not found',
  BILLING_NOT_FOUND: 'Billing record not found'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Rate Limiting
const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  }
};

// JWT Configuration
const JWT_CONFIG = {
  DEFAULT_EXPIRY: '7d',
  ALGORITHM: 'HS256',
  ISSUER: 'hms-backend'
};

// Date/Time Formats
const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm'
};

// File Upload Limits
const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  PROFILE_IMAGE_MAX_SIZE: 2 * 1024 * 1024 // 2MB
};

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// Error Codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// HIPAA Compliance Settings
const HIPAA_SETTINGS = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_SPECIAL: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_UPPERCASE: true,
  AUDIT_LOG_RETENTION_DAYS: 2555, // 7 years
  AUTO_LOGOUT_ON_INACTIVITY: true
};

module.exports = {
  USER_ROLES,
  APPOINTMENT_STATUS,
  BILLING_STATUS,
  PRESCRIPTION_STATUS,
  PAYMENT_METHODS,
  GENDER,
  BLOOD_GROUPS,
  SPECIALIZATIONS,
  AUDIT_ACTIONS,
  RESPONSE_MESSAGES,
  PAGINATION,
  RATE_LIMITS,
  JWT_CONFIG,
  DATE_FORMATS,
  FILE_LIMITS,
  CACHE_TTL,
  ERROR_CODES,
  HIPAA_SETTINGS
};
