export const APP_NAME = 'Hospital Management System';
export const APP_VERSION = '1.0.0';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const BILLING_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Family Medicine',
  'Gastroenterology',
  'Internal Medicine',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology',
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export const API_ENDPOINTS = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
};

export type BillingStatus = typeof BILLING_STATUS[keyof typeof BILLING_STATUS];