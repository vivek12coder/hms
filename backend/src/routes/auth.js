const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/security');
const { authenticateToken } = require('../middleware/rbac');
const { AuditService } = require('../services/AuditService');

// Authentication routes (publicly accessible)
// Apply stricter auth rate limiter to registration and login to mitigate brute force
router.post('/register', authRateLimiter, AuditService.createMiddleware('AUTH', 'REGISTER'), register);
router.post('/login', authRateLimiter, AuditService.createMiddleware('AUTH', 'LOGIN'), login);

// Protected user routes
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, AuditService.createMiddleware('AUTH', 'PROFILE_UPDATE'), updateProfile);
router.put('/change-password', authenticateToken, AuditService.createMiddleware('AUTH', 'PASSWORD_CHANGE'), changePassword);
router.post('/logout', authenticateToken, AuditService.createMiddleware('AUTH', 'LOGOUT'), logout);

module.exports = router;