const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const options = { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: 'HS256' // Explicitly specify algorithm
  };

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const hashPassword = async (password) => {
  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Increase salt rounds for better security (12 is recommended over 10)
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    throw new Error('Password and hash are required for comparison');
  }
  return await bcrypt.compare(password, hashedPassword);
};

const generateRefreshToken = (userId) => {
  const payload = { userId };
  const options = { 
    expiresIn: '7d',
    algorithm: 'HS256'
  };

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'] // Prevent algorithm confusion attacks
  });
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  generateRefreshToken,
  verifyToken,
};