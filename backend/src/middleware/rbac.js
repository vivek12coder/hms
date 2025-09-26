const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Role-Based Access Control (RBAC) Middleware
 * Validates JWT token and enforces role-based permissions
 */

/**
 * Middleware to verify JWT token and extract user information
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database to ensure role is current
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        patient: {
          select: { id: true }
        },
        doctor: {
          select: { id: true, specialization: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user information to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token authentication failed.'
    });
  }
};

/**
 * Middleware factory to check if user has required role(s)
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user can access patient data
 * Patients can only access their own data, doctors and admins can access any
 */
const requirePatientAccess = (req, res, next) => {
  const { role, patient } = req.user;
  const targetPatientId = req.params.patientId || req.params.id;

  // Admins and doctors have full access
  if (role === 'ADMIN' || role === 'DOCTOR') {
    return next();
  }

  // Patients can only access their own data
  if (role === 'PATIENT') {
    if (!patient) {
      return res.status(403).json({
        success: false,
        message: 'Patient profile not found.'
      });
    }

    if (patient.id !== targetPatientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data.'
      });
    }

    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied.'
  });
};

/**
 * Middleware to check if user can access appointment data
 * Patients can only see their appointments, doctors see appointments with them
 */
const requireAppointmentAccess = async (req, res, next) => {
  try {
    const { role, patient, doctor } = req.user;
    const appointmentId = req.params.appointmentId || req.params.id;

    // Admins have full access
    if (role === 'ADMIN') {
      return next();
    }

    // If no specific appointment ID, apply general role-based access
    if (!appointmentId) {
      if (role === 'DOCTOR' || role === 'PATIENT') {
        return next(); // They'll get filtered data in the controller
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Get appointment details to check access
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        patientId: true,
        doctorId: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Check role-specific access
    if (role === 'PATIENT' && patient && appointment.patientId === patient.id) {
      return next();
    }

    if (role === 'DOCTOR' && doctor && appointment.doctorId === doctor.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own appointments.'
    });

  } catch (error) {
    console.error('Appointment access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Access validation failed.'
    });
  }
};

/**
 * Middleware for admin-only operations
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Middleware for doctor and admin access
 */
const requireDoctorOrAdmin = requireRole(['DOCTOR', 'ADMIN']);

/**
 * Middleware for authenticated users (any role)
 */
const requireAuth = authenticateToken;

module.exports = {
  authenticateToken,
  requireRole,
  requirePatientAccess,
  requireAppointmentAccess,
  requireAdmin,
  requireDoctorOrAdmin,
  requireAuth
};