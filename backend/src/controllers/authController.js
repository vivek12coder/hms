const { asyncHandler } = require('../middleware/error');
const { authService } = require('../services/AuthService');
const { auditLogger } = require('../services/AuditService');
const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST']).default('PATIENT'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const register = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  try {
    const result = await authService.register(validatedData);

    // Log successful registration
    await auditLogger.logAuth(
      result.user.id,
      result.user.role,
      'REGISTER',
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      'SUCCESS'
    );

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error) {
    // Log failed registration
    await auditLogger.logAuth(
      'anonymous',
      'unknown',
      'REGISTER',
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      'FAILURE',
      error.message
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  try {
    const result = await authService.login(validatedData);

    // Log successful login
    await auditLogger.logAuth(
      result.user.id,
      result.user.role,
      'LOGIN',
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      'SUCCESS'
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    // Log failed login attempt
    await auditLogger.logAuth(
      'anonymous',
      'unknown',
      'LOGIN',
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      'FAILURE',
      error.message
    );

    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const user = await authService.getUserById(userId);

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

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const validatedData = updateProfileSchema.parse(req.body);

  try {
    const user = await authService.updateUserProfile(userId, validatedData);

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const validatedData = changePasswordSchema.parse(req.body);

  try {
    await authService.changePassword(userId, validatedData.currentPassword, validatedData.newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const logout = asyncHandler(async (req, res) => {
  // Log logout event
  if (req.user) {
    await auditLogger.logAuth(
      req.user.id,
      req.user.role,
      'LOGOUT',
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      'SUCCESS'
    );
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};