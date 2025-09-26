const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const options = { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateRefreshToken = (userId) => {
  const payload = { userId };
  const options = { 
    expiresIn: '7d' 
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  generateRefreshToken,
  verifyToken,
};