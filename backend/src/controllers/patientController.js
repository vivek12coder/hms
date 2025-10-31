const { asyncHandler } = require('../middleware/error');
const { patientService } = require('../services/PatientService');
const { z } = require('zod');

// Enhanced validation schemas with better security
const createPatientSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  dateOfBirth: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .refine((date) => {
      const dob = new Date(date);
      const age = (new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 0 && age <= 150; // Reasonable age range
    }, 'Invalid age')
    .transform((str) => new Date(str)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number too long')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address too long'),
  emergencyContact: z.string()
    .min(10, 'Emergency contact must be at least 10 characters')
    .max(100, 'Emergency contact too long'),
  medicalHistory: z.string().max(5000, 'Medical history too long').optional(),
});

const updatePatientSchema = z.object({
  dateOfBirth: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .refine((date) => {
      const dob = new Date(date);
      const age = (new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 0 && age <= 150;
    }, 'Invalid age')
    .transform((str) => new Date(str))
    .optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phoneNumber: z.string()
    .min(10)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
  address: z.string().min(5).max(500).optional(),
  emergencyContact: z.string().min(10).max(100).optional(),
  medicalHistory: z.string().max(5000).optional(),
});

const queryParamsSchema = z.object({
  search: z.string().max(100).optional(), // Limit search length
  page: z.string().optional().transform((val) => Math.max(1, parseInt(val) || 1)),
  limit: z.string().optional().transform((val) => Math.min(Math.max(1, parseInt(val) || 10), 50)), // Max 50 per page
});

const idParamSchema = z.string().min(1, 'ID is required').max(100, 'Invalid ID format');

const getAllPatients = asyncHandler(async (req, res) => {
  const { search, page, limit } = queryParamsSchema.parse(req.query);

  const patients = await patientService.getAllPatients({ search, page, limit });

  res.status(200).json({
    success: true,
    data: patients,
  });
});

const getPatientById = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);

  const patient = await patientService.getPatientById(id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    data: patient,
  });
});

const createPatient = asyncHandler(async (req, res) => {
  const validatedData = createPatientSchema.parse(req.body);

  try {
    const patient = await patientService.createPatient(validatedData);

    res.status(201).json({
      success: true,
      data: patient,
      message: 'Patient created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const updatePatient = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const validatedData = updatePatientSchema.parse(req.body);

  try {
    const patient = await patientService.updatePatient(id, validatedData);

    res.status(200).json({
      success: true,
      data: patient,
      message: 'Patient updated successfully',
    });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await patientService.deletePatient(id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};