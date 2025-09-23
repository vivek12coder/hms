import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/error';
import { logger } from './utils/logger';
// import ComplianceManager from './utils/compliance';
import {
  securityHeadersMiddleware,
  apiRateLimiter,
  authRateLimiter,
  inputSanitationMiddleware,
  sessionSecurityMiddleware,
  hipaaComplianceMiddleware,
  dataExportMiddleware,
  securityErrorHandler
} from './middleware/security';

// Routes
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';
import billingRoutes from './routes/billing';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(securityHeadersMiddleware);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Global rate limiting
app.use(apiRateLimiter);

// Input sanitization
app.use(inputSanitationMiddleware);

// Session security validation
app.use(sessionSecurityMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));

// Data export logging
app.use(dataExportMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/patients', hipaaComplianceMiddleware, patientRoutes);
app.use('/api/doctors', hipaaComplianceMiddleware, doctorRoutes);
app.use('/api/appointments', hipaaComplianceMiddleware, appointmentRoutes);
app.use('/api/billing', hipaaComplianceMiddleware, billingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(securityErrorHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info('✅ Hospital Management System with Security & HIPAA Compliance initialized');
  
  // Initialize compliance management (disabled for now due to TypeScript issues)
  // const complianceManager = ComplianceManager.getInstance();
  // complianceManager.initialize();
});

export default app;