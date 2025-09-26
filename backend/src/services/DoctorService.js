const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

class DoctorService {
  async getAllDoctors(filters = {}) {
    const { search, specialization, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    
    logger.info(`Fetching all doctors with filters: ${JSON.stringify(filters)}`);

    const where = {};

    if (search) {
      where.OR = [
        {
          user: {
            firstName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            lastName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          specialization: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (specialization) {
      where.specialization = {
        contains: specialization,
        mode: 'insensitive',
      };
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
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
        },
        orderBy: {
          user: {
            lastName: 'asc',
          },
        },
      }),
      prisma.doctor.count({ where }),
    ]);

    return {
      doctors,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    };
  }

  async getDoctorById(id) {
    logger.info(`Fetching doctor with ID: ${id}`);
    
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
      },
    });

    return doctor;
  }

  async getDoctorByUserId(userId) {
    logger.info(`Fetching doctor by user ID: ${userId}`);
    
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
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
  }

  async createDoctor(doctorData) {
    logger.info(`Creating doctor for user: ${doctorData.userId}`);

    // Check if user exists and doesn't already have a doctor record
    const user = await prisma.user.findUnique({
      where: { id: doctorData.userId },
      include: { doctor: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.doctor) {
      throw new Error('Doctor record already exists for this user');
    }

    // Check for duplicate license number
    const existingDoctor = await prisma.doctor.findUnique({
      where: { licenseNumber: doctorData.licenseNumber },
    });

    if (existingDoctor) {
      throw new Error('Doctor with this license number already exists');
    }

    const doctor = await prisma.doctor.create({
      data: doctorData,
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

    logger.info(`Doctor created successfully with ID: ${doctor.id}`);
    return doctor;
  }

  async updateDoctor(id, updateData) {
    logger.info(`Updating doctor with ID: ${id}`);

    // If license number is being updated, check for duplicates
    if (updateData.licenseNumber) {
      const existingDoctor = await prisma.doctor.findFirst({
        where: {
          licenseNumber: updateData.licenseNumber,
          id: { not: id },
        },
      });

      if (existingDoctor) {
        throw new Error('Doctor with this license number already exists');
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: updateData,
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

    logger.info(`Doctor updated successfully: ${id}`);
    return doctor;
  }

  async deleteDoctor(id) {
    logger.info(`Deleting doctor with ID: ${id}`);

    await prisma.doctor.delete({
      where: { id },
    });

    logger.info(`Doctor deleted successfully: ${id}`);
  }

  async getDoctorsBySpecialization(specialization) {
    logger.info(`Fetching doctors by specialization: ${specialization || 'all'}`);
    
    const where = specialization
      ? {
          specialization: {
            contains: specialization,
            mode: 'insensitive',
          },
        }
      : {};

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    });

    return doctors;
  }

  async updateDoctorAvailability(id, availability) {
    logger.info(`Updating availability for doctor: ${id}`);

    const doctor = await prisma.doctor.update({
      where: { id },
      data: { availability },
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

    logger.info(`Doctor availability updated successfully: ${id}`);
    return doctor;
  }
}

const doctorService = new DoctorService();

module.exports = {
  DoctorService,
  doctorService,
};