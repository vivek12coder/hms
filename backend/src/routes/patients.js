const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { authenticateToken, requireRole } = require('../middleware/rbac');
const { AuditService } = require('../services/AuditService');

// Get all patients (Admin, Doctor can see all; Patient sees only themselves)
router.get('/', authenticateToken, getAllPatients);

// Get a specific patient by ID
router.get('/:id', authenticateToken, AuditService.createMiddleware('PATIENT', 'VIEW'), getPatientById);

// Create a new patient (Admin, Doctor can create; Patient can create during registration)
router.post('/', authenticateToken, AuditService.createMiddleware('PATIENT', 'CREATE'), createPatient);

// Update patient information
router.put('/:id', authenticateToken, AuditService.createMiddleware('PATIENT', 'UPDATE'), updatePatient);

// Delete a patient (Admin only)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), AuditService.createMiddleware('PATIENT', 'DELETE'), deletePatient);

// Get patient medical history
router.get('/:id/medical-history', authenticateToken, AuditService.createMiddleware('PATIENT', 'VIEW_MEDICAL_HISTORY'), async (req, res) => {
  try {
    // Placeholder for medical history - would typically get from database
    res.json({ 
      message: 'Medical history would be here',
      patientId: req.params.id,
      history: []
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;