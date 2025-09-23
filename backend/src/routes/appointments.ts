import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  confirmAppointment,
  cancelAppointment
} from '../controllers/appointmentController';
import { auth, doctorOrAdmin, authenticatedUser } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(auth);

// General appointment routes
router.get('/', doctorOrAdmin, getAllAppointments);
router.post('/', authenticatedUser, createAppointment);
router.get('/:id', authenticatedUser, getAppointmentById);
router.put('/:id', authenticatedUser, updateAppointment);
router.delete('/:id', authenticatedUser, deleteAppointment);

// Specific query routes
router.get('/patient/:patientId', authenticatedUser, getPatientAppointments);
router.get('/doctor/:doctorId', doctorOrAdmin, getDoctorAppointments);

// Status update (doctors and admins)
router.patch('/:id/confirm', doctorOrAdmin, confirmAppointment);
router.patch('/:id/cancel', authenticatedUser, cancelAppointment);

export default router;