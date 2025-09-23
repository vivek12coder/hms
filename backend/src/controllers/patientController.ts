import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schemas
const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  dateOfBirth: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z.string(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
});

const updatePatientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export const getAllPatients = asyncHandler(async (req: Request, res: Response) => {
  const patients = await prisma.patient.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      appointments: {
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      billings: true,
    },
  });

  res.status(200).json({
    success: true,
    data: patients,
    count: patients.length,
  });
});

export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      appointments: {
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      billings: true,
    },
  });

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

export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createPatientSchema.parse(req.body);
  
  const { firstName, lastName, email, password, phone, dateOfBirth, gender, address, emergencyContactName, emergencyContactPhone, medicalHistory } = validatedData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user and patient in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create user first
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'PATIENT',
      },
    });

    // Create patient
    const patient = await tx.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        address,
        emergencyContact: emergencyContactName && emergencyContactPhone ? {
          name: emergencyContactName,
          phone: emergencyContactPhone,
        } : null,
        medicalHistory: medicalHistory ? { history: medicalHistory } : null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return patient;
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Patient created successfully',
  });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updatePatientSchema.parse(req.body);

  const { firstName, lastName, phone, dateOfBirth, gender, address, emergencyContactName, emergencyContactPhone, medicalHistory } = validatedData;

  // Check if patient exists
  const existingPatient = await prisma.patient.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingPatient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  // Update user and patient in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Update user if user fields are provided
    if (firstName || lastName) {
      await tx.user.update({
        where: { id: existingPatient.userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
        },
      });
    }

    // Update patient
    const updatedPatient = await tx.patient.update({
      where: { id },
      data: {
        ...(phone && { phone }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(address && { address }),
        ...(emergencyContactName && emergencyContactPhone && {
          emergencyContact: {
            name: emergencyContactName,
            phone: emergencyContactPhone,
          }
        }),
        ...(medicalHistory && { medicalHistory: { history: medicalHistory } }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedPatient;
  });

  res.status(200).json({
    success: true,
    data: result,
    message: 'Patient updated successfully',
  });
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if patient exists
  const existingPatient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!existingPatient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  // Delete patient (user will be cascaded)
  await prisma.patient.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully',
  });
});

export const getPatientMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      medicalHistory: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

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

export const updatePatientMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { medicalHistory } = req.body;

  if (!medicalHistory) {
    return res.status(400).json({
      success: false,
      message: 'Medical history is required',
    });
  }

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      medicalHistory: { history: medicalHistory },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: patient,
    message: 'Medical history updated successfully',
  });
});