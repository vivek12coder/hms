const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/security');
const { authenticateToken, requireRole } = require('../middleware/rbac');
const { AuditService } = require('../services/AuditService');
const { prisma } = require('../config/database');

// Authentication routes (publicly accessible)
// Apply stricter auth rate limiter to registration and login to mitigate brute force
router.post('/register', authRateLimiter, AuditService.createMiddleware('AUTH', 'REGISTER'), register);
router.post('/login', authRateLimiter, AuditService.createMiddleware('AUTH', 'LOGIN'), login);

// Protected user routes
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, AuditService.createMiddleware('AUTH', 'PROFILE_UPDATE'), updateProfile);
router.put('/change-password', authenticateToken, AuditService.createMiddleware('AUTH', 'PASSWORD_CHANGE'), changePassword);
router.post('/logout', authenticateToken, AuditService.createMiddleware('AUTH', 'LOGOUT'), logout);

// Admin-only route to get all users
router.get('/users', authenticateToken, requireRole('ADMIN'), AuditService.createMiddleware('USER', 'VIEW_ALL'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            id: true,
            dateOfBirth: true,
            gender: true
          }
        },
        doctor: {
          select: {
            id: true,
            specialization: true,
            licenseNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ 
      success: true, 
      data: users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: 'ACTIVE', // Can be enhanced with actual status field
        createdAt: user.createdAt,
        lastLogin: user.updatedAt, // Using updatedAt as proxy for lastLogin
        additionalInfo: user.patient || user.doctor || null
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

module.exports = router;