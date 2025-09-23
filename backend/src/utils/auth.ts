import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  } as SignOptions;

  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateRefreshToken = (userId: string): string => {
  const payload = { userId };
  const options: SignOptions = { 
    expiresIn: '7d' 
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};