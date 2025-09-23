import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword, logout } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/logout', auth, logout);

export default router;