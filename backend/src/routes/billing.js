const express = require('express');
const router = express.Router();
const { 
	createBilling, 
	getAllBillings, 
	getBillingById, 
	updateBilling, 
	deleteBilling, 
	markBillingAsPaid 
} = require('../controllers/billingController');
const { authenticateToken, requireRole } = require('../middleware/rbac');
const { AuditService } = require('../services/AuditService');

// Create a new bill (Admin, Doctor)
router.post('/', authenticateToken, requireRole(['ADMIN','DOCTOR']), AuditService.createMiddleware('BILLING', 'CREATE'), createBilling);

// Get all bills (Admin can see all, others see their own)
router.get('/', authenticateToken, getAllBillings);

// Get a specific bill by ID
router.get('/:id', authenticateToken, AuditService.createMiddleware('BILLING', 'VIEW'), getBillingById);

// Update a bill (Admin, Doctor)
router.put('/:id', authenticateToken, requireRole(['ADMIN','DOCTOR']), AuditService.createMiddleware('BILLING', 'UPDATE'), updateBilling);

// Delete a bill (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), AuditService.createMiddleware('BILLING', 'DELETE'), deleteBilling);

// Pay a bill (Patient can pay their own bills)
router.post('/:id/pay', authenticateToken, AuditService.createMiddleware('BILLING', 'PAYMENT'), markBillingAsPaid);

module.exports = router;