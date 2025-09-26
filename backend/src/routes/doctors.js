const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { authenticateToken, requireRole } = require('../middleware/rbac');
const { AuditService } = require('../services/AuditService');

// Get all doctors (accessible to all authenticated users)
router.get('/', authenticateToken, getAllDoctors);

// Get a specific doctor by ID
router.get('/:id', authenticateToken, AuditService.createMiddleware('DOCTOR', 'VIEW'), getDoctorById);

// Create a new doctor (Admin only)
router.post('/', authenticateToken, requireRole('ADMIN'), AuditService.createMiddleware('DOCTOR', 'CREATE'), createDoctor);

// Update doctor information (Admin, or doctor updating own profile)
router.put('/:id', authenticateToken, AuditService.createMiddleware('DOCTOR', 'UPDATE'), updateDoctor);

// Delete a doctor (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), AuditService.createMiddleware('DOCTOR', 'DELETE'), deleteDoctor);

module.exports = router;