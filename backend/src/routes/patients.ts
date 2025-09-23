import { Router } from 'express';
import { 
  getAllPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  deletePatient,
  getPatientMedicalHistory,
  updatePatientMedicalHistory
} from '../controllers/patientController';
import { auth, doctorOrAdmin, authenticatedUser } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(auth);

// Get all patients (doctors and admins only)
router.get('/', doctorOrAdmin, getAllPatients);

// Create new patient (admins only, or patients can create their own profile)
router.post('/', createPatient);

// Get patient by ID
router.get('/:id', authenticatedUser, getPatientById);

// Update patient
router.put('/:id', authenticatedUser, updatePatient);

// Delete patient (admins only)
router.delete('/:id', doctorOrAdmin, deletePatient);

// Medical history endpoints
router.get('/:id/medical-history', doctorOrAdmin, getPatientMedicalHistory);
router.put('/:id/medical-history', doctorOrAdmin, updatePatientMedicalHistory);

export default router;