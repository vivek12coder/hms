import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';
import { z } from 'zod';

// Validation schemas
const createAppointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  appointmentDate: z.string(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  appointmentDate: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

export const getAllAppointments = asyncHandler(async (req: Request, res: Response) => {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
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
    orderBy: {
      appointmentDate: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    data: appointments,
    count: appointments.length,
  });
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
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
      billings: true,
    },
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createAppointmentSchema.parse(req.body);
  const { patientId, doctorId, appointmentDate, notes } = validatedData;

  // Check if patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  // Check if doctor exists
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  // Check for scheduling conflicts
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      appointmentDate: new Date(appointmentDate),
      status: {
        notIn: ['CANCELLED'],
      },
    },
  });

  if (existingAppointment) {
    return res.status(400).json({
      success: false,
      message: 'Doctor is not available at this time',
    });
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      notes,
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
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
  });

  res.status(201).json({
    success: true,
    data: appointment,
    message: 'Appointment created successfully',
  });
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updateAppointmentSchema.parse(req.body);

  const { appointmentDate, status, notes } = validatedData;

  // Check if appointment exists
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Update appointment
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
      ...(status && { status }),
      ...(notes && { notes }),
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
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
  });

  res.status(200).json({
    success: true,
    data: appointment,
    message: 'Appointment updated successfully',
  });
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if appointment exists
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Delete appointment
  await prisma.appointment.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Appointment deleted successfully',
  });
});

export const getPatientAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;

  const appointments = await prisma.appointment.findMany({
    where: { patientId },
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
    orderBy: {
      appointmentDate: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: appointments,
    count: appointments.length,
  });
});

export const getDoctorAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = req.params;

  const appointments = await prisma.appointment.findMany({
    where: { doctorId },
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
    orderBy: {
      appointmentDate: 'asc',
    },
  });

  res.status(200).json({
    success: true,
    data: appointments,
    count: appointments.length,
  });
});

export const confirmAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if appointment exists
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Update appointment status to SCHEDULED (confirmed)
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
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
  });

  res.status(200).json({
    success: true,
    data: appointment,
    message: 'Appointment confirmed successfully',
  });
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if appointment exists
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found',
    });
  }

  // Update appointment status to CANCELLED
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: 'CANCELLED',
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
  });

  res.status(200).json({
    success: true,
    data: appointment,
    message: 'Appointment cancelled successfully',
  });
});