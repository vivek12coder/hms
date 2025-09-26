const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Simplified auth - no role restrictions, anyone authenticated can access
const authorize = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. Please authenticate.' });
    }
    // No role checking - anyone logged in can access
    next();
  };
};

// Simplified exports - no role restrictions
const adminOnly = authorize();
const doctorOnly = authorize();
const patientOnly = authorize();
const doctorOrAdmin = authorize();
const authenticatedUser = authorize();

module.exports = {
  auth,
  authorize,
  adminOnly,
  doctorOnly,
  patientOnly,
  doctorOrAdmin,
  authenticatedUser,
};