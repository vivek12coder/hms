const { asyncHandler } = require('../middleware/error');
const { patientService } = require('../services/PatientService');
const { z } = require('zod');

// Validation schemas
const createPatientSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').transform((str) => new Date(str)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  emergencyContact: z.string().min(10, 'Emergency contact must be at least 10 characters'),
  medicalHistory: z.string().optional(),
});

const updatePatientSchema = z.object({
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').transform((str) => new Date(str)).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phoneNumber: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  emergencyContact: z.string().min(10).optional(),
  medicalHistory: z.string().optional(),
});

const queryParamsSchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform((val) => parseInt(val) || 1),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val) || 10, 50)), // Max 50 per page
});

const getAllPatients = asyncHandler(async (req, res) => {
  const { search, page, limit } = queryParamsSchema.parse(req.query);

  const patients = await patientService.getAllPatients({ search, page, limit });

  res.status(200).json({
    success: true,
    data: patients,
  });
});

const getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

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
  const { id } = req.params;
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