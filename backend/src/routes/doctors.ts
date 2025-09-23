import { Router } from 'express';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAvailability,
  updateDoctorAvailability,
  getDoctorsBySpecialization
} from '../controllers/doctorController';
import { auth, adminOnly, doctorOrAdmin, authenticatedUser } from '../middleware/auth';

const router = Router();

// Public routes (can be accessed without authentication for patient booking)
router.get('/', getAllDoctors);
router.get('/specialization', getDoctorsBySpecialization);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

// Protected routes
router.use(auth);

// Admin only routes
router.post('/', adminOnly, createDoctor);
router.delete('/:id', adminOnly, deleteDoctor);

// Doctor or admin routes
router.put('/:id', doctorOrAdmin, updateDoctor);
router.put('/:id/availability', doctorOrAdmin, updateDoctorAvailability);

export default router;