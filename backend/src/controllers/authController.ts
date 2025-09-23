import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { prisma } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT']).default('PATIENT'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Helper function to generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return jwt.sign({ userId, email, role }, secret, { expiresIn: '24h' });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      ...validatedData,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
    message: 'User registered successfully',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    },
    message: 'Login successful',
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

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

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { firstName, lastName, email } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, email },
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

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully',
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { currentPassword, newPassword } = req.body;

  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});