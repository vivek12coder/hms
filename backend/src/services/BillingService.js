const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

class BillingService {
  async getAllBillingRecords() {
    logger.info('Fetching all billing records');
    
    const billingRecords = await prisma.billing.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return billingRecords;
  }

  async getBillingRecordById(id) {
    logger.info(`Fetching billing record with ID: ${id}`);
    
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
      },
    });

    return billingRecord;
  }

  async getBillingRecordsByPatientId(patientId) {
    logger.info(`Fetching billing records for patient: ${patientId}`);
    
    const billingRecords = await prisma.billing.findMany({
      where: { patientId },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return billingRecords;
  }

  async createBillingRecord(billingData) {
    logger.info(`Creating billing record for patient: ${billingData.patientId}`);

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: billingData.patientId },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Set default dates if not provided
    const issueDate = billingData.issueDate || new Date();
    const dueDate = billingData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const billingRecord = await prisma.billing.create({
      data: {
        ...billingData,
        issueDate,
        dueDate,
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
      },
    });

    logger.info(`Billing record created successfully with ID: ${billingRecord.id}`);
    return billingRecord;
  }

  async updateBillingRecord(id, updateData) {
    logger.info(`Updating billing record with ID: ${id}`);

    const billingRecord = await prisma.billing.update({
      where: { id },
      data: updateData,
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
      },
    });

    logger.info(`Billing record updated successfully: ${id}`);
    return billingRecord;
  }

  async deleteBillingRecord(id) {
    logger.info(`Deleting billing record with ID: ${id}`);

    await prisma.billing.delete({
      where: { id },
    });

    logger.info(`Billing record deleted successfully: ${id}`);
  }

  async getBillingRecordsByStatus(status) {
    logger.info(`Fetching billing records with status: ${status}`);
    
    const billingRecords = await prisma.billing.findMany({
      where: { status },
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
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return billingRecords;
  }

  async getOverdueBillingRecords() {
    logger.info('Fetching overdue billing records');
    
    const billingRecords = await prisma.billing.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
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
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return billingRecords;
  }

  async markAsPaid(id) {
    logger.info(`Marking billing record as paid: ${id}`);

    return this.updateBillingRecord(id, { status: 'PAID' });
  }

  async markAsOverdue(id) {
    logger.info(`Marking billing record as overdue: ${id}`);

    return this.updateBillingRecord(id, { status: 'OVERDUE' });
  }
}

const billingService = new BillingService();

module.exports = {
  BillingService,
  billingService,
};