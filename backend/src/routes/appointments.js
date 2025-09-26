const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/rbac');
const { AuditService } = require('../services/AuditService');

// Book a new appointment
router.post('/', authenticateToken, AuditService.createMiddleware('APPOINTMENT', 'BOOK'), async (req, res) => {
  try {
    const { doctorName, specialization, appointmentDateTime, serviceType, symptoms, notes } = req.body;
    
    // This is a placeholder - you would typically save to database
    const appointment = {
      id: Date.now(),
      patientId: req.user.id,
      doctorName,
      specialization,
      appointmentDateTime,
      serviceType,
      status: 'scheduled',
      symptoms,
      notes,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      appointment 
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get appointments for a user
router.get('/', authenticateToken, AuditService.createMiddleware('APPOINTMENT', 'VIEW_LIST'), async (req, res) => {
  try {
    // This would typically get appointments from database
    const mockAppointments = [
      {
        id: 1,
        patientId: req.user.id,
        doctorName: 'Dr. Johnson',
        specialization: 'General Medicine',
        appointmentDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'General Consultation',
        status: 'scheduled',
        symptoms: 'Regular checkup',
        notes: 'Annual health screening'
      },
      {
        id: 2,
        patientId: req.user.id,
        doctorName: 'Dr. Smith',
        specialization: 'Cardiology',
        appointmentDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Specialist Consultation',
        status: 'scheduled',
        symptoms: 'Heart check',
        notes: 'Follow-up appointment'
      }
    ];

    res.json(mockAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, AuditService.createMiddleware('APPOINTMENT', 'VIEW'), async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    // This would typically get appointment by ID from database
    const mockAppointment = {
      id: appointmentId,
      patientId: req.user.id,
      doctorName: 'Dr. Johnson',
      specialization: 'General Medicine',
      appointmentDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      serviceType: 'General Consultation',
      status: 'scheduled',
      symptoms: 'Regular checkup',
      notes: 'Annual health screening'
    };

    res.json(mockAppointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateToken, AuditService.createMiddleware('APPOINTMENT', 'CANCEL'), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // This would typically update appointment status in database
    res.json({ message: 'Appointment cancelled successfully', appointmentId });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;