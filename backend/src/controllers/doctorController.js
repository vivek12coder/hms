const { asyncHandler } = require('../middleware/error');
const { doctorService } = require('../services/DoctorService');
const { z } = require('zod');

// Validation schemas
const createDoctorSchema = z.object({
  userId: z.string(),
  specialization: z.string(),
  licenseNumber: z.string(),
  yearsOfExperience: z.number().min(0),
  consultationFee: z.number().min(0),
  availability: z.object({
    monday: z.array(z.string()).optional(),
    tuesday: z.array(z.string()).optional(),
    wednesday: z.array(z.string()).optional(),
    thursday: z.array(z.string()).optional(),
    friday: z.array(z.string()).optional(),
    saturday: z.array(z.string()).optional(),
    sunday: z.array(z.string()).optional(),
  }).optional(),
});

const updateDoctorSchema = z.object({
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  availability: z.object({
    monday: z.array(z.string()).optional(),
    tuesday: z.array(z.string()).optional(),
    wednesday: z.array(z.string()).optional(),
    thursday: z.array(z.string()).optional(),
    friday: z.array(z.string()).optional(),
    saturday: z.array(z.string()).optional(),
    sunday: z.array(z.string()).optional(),
  }).optional(),
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const { search, specialization, page = '1', limit = '10' } = req.query;

  const doctors = await doctorService.getAllDoctors({
    search: search,
    specialization: specialization,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor = await doctorService.getDoctorById(id);

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

const createDoctor = asyncHandler(async (req, res) => {
  const validatedData = createDoctorSchema.parse(req.body);

  try {
    const doctor = await doctorService.createDoctor(validatedData);

    res.status(201).json({
      success: true,
      data: doctor,
      message: 'Doctor created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateDoctorSchema.parse(req.body);

  try {
    const doctor = await doctorService.updateDoctor(id, validatedData);

    res.status(200).json({
      success: true,
      data: doctor,
      message: 'Doctor updated successfully',
    });
  } catch (error) {
    if (error.message === 'Doctor not found') {
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

const updateDoctorAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  try {
    const doctor = await doctorService.updateDoctorAvailability(id, availability);

    res.status(200).json({
      success: true,
      data: doctor,
      message: 'Doctor availability updated successfully',
    });
  } catch (error) {
    if (error.message === 'Doctor not found') {
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

const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await doctorService.deleteDoctor(id);

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Doctor not found') {
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
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  updateDoctorAvailability,
  deleteDoctor,
};