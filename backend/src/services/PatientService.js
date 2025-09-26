const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// Shared user selection object for consistency
const USER_SELECT = {
  firstName: true,
  lastName: true,
  email: true,
};

class PatientService {
  async getAllPatients(filters = {}) {
    const { search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    
    logger.info(`Fetching ${limit} patients, page ${page}`);

    const where = search ? {
      user: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    } : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          billings: true,
        },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      patients,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    };
  }

  async getPatientById(id) {
    logger.info(`Fetching patient: ${id}`);
    
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: USER_SELECT },
        billings: true,
      },
    });

    return patient;
  }

  async createPatient(data) {
    logger.info(`Creating patient`);
    
    const patient = await prisma.patient.create({
      data,
      include: {
        user: { select: USER_SELECT },
      },
    });

    logger.info(`Patient created: ${patient.id}`);
    return patient;
  }

  async updatePatient(id, data) {
    logger.info(`Updating patient with ID: ${id}`);
    
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    const patient = await prisma.patient.update({
      where: { id },
      data,
      include: {
        user: { select: USER_SELECT },
        billings: true,
      },
    });

    logger.info(`Patient updated: ${id}`);
    return patient;
  }

  async deletePatient(id) {
    logger.info(`Deleting patient: ${id}`);
    
    await prisma.patient.delete({
      where: { id },
    });

    logger.info(`Patient deleted: ${id}`);
    return true;
  }

  async getPatientsByDoctorId(doctorId, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    logger.info(`Fetching patients for doctor ID: ${doctorId}`);

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: {
          appointments: {
            some: {
              doctorId,
            },
          },
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          billings: true,
        },
      }),
      prisma.patient.count({
        where: {
          appointments: {
            some: {
              doctorId,
            },
          },
        },
      }),
    ]);

    return {
      patients,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    };
  }

  async getPatientStats() {
    logger.info('Fetching patient statistics');

    const totalPatients = await prisma.patient.count();
    const patientsThisMonth = await prisma.patient.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return {
      total: totalPatients,
      thisMonth: patientsThisMonth,
    };
  }
}

const patientService = new PatientService();

module.exports = { patientService };