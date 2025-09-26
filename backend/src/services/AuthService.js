const { prisma } = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { logger } = require('../utils/logger');
const bcrypt = require('bcryptjs');

class AuthService {
  async register(userData) {
    logger.info(`Attempting to register user: ${userData.email}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token
    const token = generateToken(user);

    logger.info(`User registered successfully: ${user.email}`);
    
    return { user, token };
  }

  async login(credentials) {
    logger.info(`Login attempt for email: ${credentials.email}`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user);

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    logger.info(`User logged in successfully: ${user.email}`);

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUserProfile(userId, updateData) {
    logger.info(`Updating profile for user: ${userId}`);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Profile updated successfully for user: ${userId}`);
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      logger.info(`Password changed for user ${userId}`);
    } catch (error) {
      logger.error(`Failed to change password for user ${userId}: ${error}`);
      throw error;
    }
  }
}

const authService = new AuthService();

module.exports = {
  AuthService,
  authService,
};