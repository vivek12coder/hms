const { asyncHandler } = require('../middleware/error');
const { authService } = require('../services/AuthService');
const { auditLogger } = require('../services/AuditService');
const { z } = require('zod');

// Validation schemas with enhanced security
const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').trim(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').trim(),
  // Role is NOT accepted from user input - always set to PATIENT for security
  // Only admins can create other roles through admin panel
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const register = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  // SECURITY: Force role to PATIENT - prevent privilege escalation
  // Only admins can create users with other roles
  const userData = {
    ...validatedData,
    role: 'PATIENT' // Always set to PATIENT regardless of input
  };

  try {
    const result = await authService.register(userData);

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