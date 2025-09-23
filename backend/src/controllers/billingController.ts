import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';
import { z } from 'zod';

// Validation schemas
const createBillingRecordSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().optional(),
  amount: z.number().min(0),
  description: z.string().min(1),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).default('PENDING'),
});

const updateBillingRecordSchema = z.object({
  amount: z.number().min(0).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
});

export const getAllBillingRecords = asyncHandler(async (req: Request, res: Response) => {
  const { status, patientId, startDate, endDate } = req.query;

  let whereCondition: any = {};

  if (status) {
    whereCondition.status = status;
  }

  if (patientId) {
    whereCondition.patientId = patientId as string;
  }

  if (startDate && endDate) {
    whereCondition.createdAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const billingRecords = await prisma.billing.findMany({
    where: whereCondition,
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
      appointment: {
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    success: true,
    data: billingRecords,
    count: billingRecords.length,
  });
});

export const getBillingRecordById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const billingRecord = await prisma.billing.findUnique({
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
      appointment: {
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
    },
  });

  if (!billingRecord) {
    return res.status(404).json({
      success: false,
      message: 'Billing record not found',
    });
  }

  res.status(200).json({
    success: true,
    data: billingRecord,
  });
});

export const createBillingRecord = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createBillingRecordSchema.parse(req.body);
  const { patientId, appointmentId, amount, description, status } = validatedData;

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

  // Check if appointment exists (if provided)
  if (appointmentId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }
  }

  // Create billing record
  const billingRecord = await prisma.billing.create({
    data: {
      patientId,
      appointmentId,
      amount,
      description,
      status,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
      appointment: appointmentId ? {
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
      } : undefined,
    },
  });

  res.status(201).json({
    success: true,
    data: billingRecord,
    message: 'Billing record created successfully',
  });
});

export const updateBillingRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updateBillingRecordSchema.parse(req.body);

  const { amount, description, status } = validatedData;

  // Check if billing record exists
  const existingBillingRecord = await prisma.billing.findUnique({
    where: { id },
  });

  if (!existingBillingRecord) {
    return res.status(404).json({
      success: false,
      message: 'Billing record not found',
    });
  }

  // Update billing record
  const billingRecord = await prisma.billing.update({
    where: { id },
    data: {
      ...(amount && { amount }),
      ...(description && { description }),
      ...(status && { status }),
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
      appointment: {
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
    },
  });

  res.status(200).json({
    success: true,
    data: billingRecord,
    message: 'Billing record updated successfully',
  });
});

export const deleteBillingRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if billing record exists
  const existingBillingRecord = await prisma.billing.findUnique({
    where: { id },
  });

  if (!existingBillingRecord) {
    return res.status(404).json({
      success: false,
      message: 'Billing record not found',
    });
  }

  // Delete billing record
  await prisma.billing.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Billing record deleted successfully',
  });
});

export const getPatientBillingRecords = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;

  const billingRecords = await prisma.billing.findMany({
    where: { patientId },
    include: {
      appointment: {
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate totals
  const totalAmount = billingRecords.reduce((sum: number, record: any) => sum + record.amount, 0);
  const paidAmount = billingRecords
    .filter((record: any) => record.status === 'PAID')
    .reduce((sum: number, record: any) => sum + record.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  res.status(200).json({
    success: true,
    data: {
      billingRecords,
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
        totalRecords: billingRecords.length,
      },
    },
  });
});

export const markAsPaid = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if billing record exists
  const existingBillingRecord = await prisma.billing.findUnique({
    where: { id },
  });

  if (!existingBillingRecord) {
    return res.status(404).json({
      success: false,
      message: 'Billing record not found',
    });
  }

  // Update billing record status to PAID
  const billingRecord = await prisma.billing.update({
    where: { id },
    data: {
      status: 'PAID',
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
  });

  res.status(200).json({
    success: true,
    data: billingRecord,
    message: 'Billing record marked as paid successfully',
  });
});

export const getBillingSummary = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  let whereCondition: any = {};

  if (startDate && endDate) {
    whereCondition.createdAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  // Get total amounts by status
  const totalRevenue = await prisma.billing.aggregate({
    where: { ...whereCondition, status: 'PAID' },
    _sum: { amount: true },
    _count: true,
  });

  const pendingRevenue = await prisma.billing.aggregate({
    where: { ...whereCondition, status: 'PENDING' },
    _sum: { amount: true },
    _count: true,
  });

  const overdueRevenue = await prisma.billing.aggregate({
    where: { ...whereCondition, status: 'OVERDUE' },
    _sum: { amount: true },
    _count: true,
  });

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: {
        amount: totalRevenue._sum.amount || 0,
        count: totalRevenue._count,
      },
      pendingRevenue: {
        amount: pendingRevenue._sum.amount || 0,
        count: pendingRevenue._count,
      },
      overdueRevenue: {
        amount: overdueRevenue._sum.amount || 0,
        count: overdueRevenue._count,
      },
    },
  });
});