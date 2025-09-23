import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('ADMIN', 'DOCTOR', 'PATIENT').default('PATIENT'),
  // Doctor specific fields
  specialization: Joi.when('role', {
    is: 'DOCTOR',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  licenseNumber: Joi.when('role', {
    is: 'DOCTOR',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  // Patient specific fields
  dateOfBirth: Joi.when('role', {
    is: 'PATIENT',
    then: Joi.date().optional(),
    otherwise: Joi.optional()
  }),
  gender: Joi.when('role', {
    is: 'PATIENT',
    then: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
    otherwise: Joi.optional()
  }),
  phone: Joi.when('role', {
    is: 'PATIENT',
    then: Joi.string().optional(),
    otherwise: Joi.optional()
  }),
  address: Joi.when('role', {
    is: 'PATIENT',
    then: Joi.string().optional(),
    otherwise: Joi.optional()
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const patientSchema = Joi.object({
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  emergencyContact: Joi.object().optional(),
  medicalHistory: Joi.object().optional()
});

export const appointmentSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
  appointmentDate: Joi.date().iso().required(),
  notes: Joi.string().optional()
});

export const billingSchema = Joi.object({
  patientId: Joi.string().required(),
  appointmentId: Joi.string().optional(),
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().required(),
  issueDate: Joi.date().iso().optional(),
  dueDate: Joi.date().iso().optional()
});