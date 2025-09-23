import { Router } from 'express';
import {
  getAllBillingRecords,
  getBillingRecordById,
  createBillingRecord,
  updateBillingRecord,
  deleteBillingRecord,
  getPatientBillingRecords,
  markAsPaid,
  getBillingSummary
} from '../controllers/billingController';
import { auth, adminOnly, authenticatedUser } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(auth);

// General billing routes
router.get('/', adminOnly, getAllBillingRecords);
router.post('/', adminOnly, createBillingRecord);
router.get('/:id', authenticatedUser, getBillingRecordById);
router.put('/:id', adminOnly, updateBillingRecord);
router.delete('/:id', adminOnly, deleteBillingRecord);

// Patient-specific billing
router.get('/patient/:patientId', authenticatedUser, getPatientBillingRecords);

// Status and summary operations
router.patch('/:id/pay', adminOnly, markAsPaid);
router.get('/summary', adminOnly, getBillingSummary);

export default router;