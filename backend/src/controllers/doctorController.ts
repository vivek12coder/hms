import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schemas
const createDoctorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  specialization: z.string().min(1),
  licenseNumber: z.string().min(1),
  availability: z.record(z.string(), z.any()).optional(),
});

const updateDoctorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  specialization: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  availability: z.record(z.string(), z.any()).optional(),
});

export const getAllDoctors = asyncHandler(async (req: Request, res: Response) => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      appointments: {
        where: {
          appointmentDate: {
            gte: new Date(),
          },
        },
        include: {
          patient: {
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
      _count: {
        select: {
          appointments: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: doctors,
    count: doctors.length,
  });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const doctor = await prisma.doctor.findUnique({
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
          patient: {
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
    },
  });

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

export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createDoctorSchema.parse(req.body);
  
  const { firstName, lastName, email, password, specialization, licenseNumber, availability } = validatedData;

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

  // Check if license number already exists
  const existingDoctor = await prisma.doctor.findUnique({
    where: { licenseNumber },
  });

  if (existingDoctor) {
    return res.status(400).json({
      success: false,
      message: 'Doctor with this license number already exists',
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user and doctor in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create user first
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'DOCTOR',
      },
    });

    // Create doctor
    const doctor = await tx.doctor.create({
      data: {
        userId: user.id,
        specialization,
        licenseNumber,
        availability,
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

    return doctor;
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Doctor created successfully',
  });
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updateDoctorSchema.parse(req.body);

  const { firstName, lastName, specialization, licenseNumber, availability } = validatedData;

  // Check if doctor exists
  const existingDoctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingDoctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  // Update user and doctor in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Update user if user fields are provided
    if (firstName || lastName) {
      await tx.user.update({
        where: { id: existingDoctor.userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
        },
      });
    }

    // Update doctor
    const updatedDoctor = await tx.doctor.update({
      where: { id },
      data: {
        ...(specialization && { specialization }),
        ...(licenseNumber && { licenseNumber }),
        ...(availability && { availability }),
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

    return updatedDoctor;
  });

  res.status(200).json({
    success: true,
    data: result,
    message: 'Doctor updated successfully',
  });
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if doctor exists
  const existingDoctor = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!existingDoctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  // Delete doctor (user will be cascaded)
  await prisma.doctor.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
  });
});

export const getDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    select: {
      id: true,
      availability: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

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

export const updateDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (!availability) {
    return res.status(400).json({
      success: false,
      message: 'Availability is required',
    });
  }

  const doctor = await prisma.doctor.update({
    where: { id },
    data: {
      availability,
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
    data: doctor,
    message: 'Doctor availability updated successfully',
  });
});

export const getDoctorsBySpecialization = asyncHandler(async (req: Request, res: Response) => {
  const { specialization } = req.query;

  const doctors = await prisma.doctor.findMany({
    where: specialization ? {
      specialization: {
        contains: specialization as string,
        mode: 'insensitive',
      },
    } : {},
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: {
          appointments: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: doctors,
    count: doctors.length,
  });
});