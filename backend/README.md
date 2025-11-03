# 🏥 HMS Backend API

Hospital Management System - Production-Ready Backend API

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Production Deployment](#production-deployment)

---

## 🌟 Overview

Robust and secure backend API for Hospital Management System built with Node.js, Express, and PostgreSQL. Features include JWT authentication, role-based access control, audit logging, and HIPAA-compliant security measures.

### Key Features

- ✅ **RESTful API** - Clean, well-structured endpoints
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **RBAC** - Role-Based Access Control (Admin, Doctor, Patient, Receptionist)
- ✅ **Audit Logging** - HIPAA-compliant activity tracking
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Input Validation** - Zod schema validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Database ORM** - Prisma with PostgreSQL
- ✅ **Security Headers** - Helmet.js integration
- ✅ **CORS Protection** - Configurable origin whitelisting

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | 5.1.0 | Web framework |
| PostgreSQL | 14+ | Database |
| Prisma | 6.16.2 | ORM |
| JWT | 9.0.2 | Authentication |
| Bcrypt | 3.0.2 | Password hashing |
| Helmet | 8.1.0 | Security headers |
| Zod | 3.22.4 | Schema validation |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.js      # Database connection
│   ├── constants/           # Application constants
│   │   └── index.js         # Central constants file
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   └── billingController.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── rbac.js          # Role-based access control
│   │   ├── security.js      # Security middleware
│   │   └── error.js         # Error handling
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   ├── billing.js
│   │   ├── prescriptions.js
│   │   └── dashboard.js
│   ├── services/            # Business logic
│   │   ├── AuthService.js
│   │   ├── PatientService.js
│   │   ├── DoctorService.js
│   │   ├── BillingService.js
│   │   ├── DashboardService.js
│   │   └── AuditService.js
│   ├── utils/               # Helper utilities
│   │   ├── logger-enhanced.js    # Production logger
│   │   ├── env-validator.js      # Environment validation
│   │   ├── response-handler.js   # Standard responses
│   │   └── auth.js               # Auth utilities
│   └── server.js            # Application entry point
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example env file
├── .env.production.template # Production env template
├── schema.prisma            # Prisma schema
├── seed.js                  # Database seeding
├── package.json             # Dependencies
├── Dockerfile               # Docker configuration
└── render.yaml              # Render deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed (or Supabase account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vivek12coder/hms.git
   cd hms/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed database with test data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Server will start on `http://localhost:3001`

---

## 🔐 Environment Variables

### Required Variables

```bash
# Server
NODE_ENV=development
PORT=3001

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:6543/db?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/db

# JWT Authentication
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Environment Validation

The application validates all required environment variables on startup. Missing or invalid variables will prevent the server from starting with clear error messages.

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-backend.onrender.com/api`

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/auth/login` | POST | ❌ | - | User login |
| `/auth/register` | POST | ❌ | - | User registration |
| `/auth/me` | GET | ✅ | All | Get current user |
| `/patients` | GET | ✅ | Admin, Doctor | List patients |
| `/patients/:id` | GET | ✅ | Admin, Doctor, Patient | Get patient details |
| `/doctors` | GET | ✅ | All | List doctors |
| `/appointments` | GET | ✅ | All | List appointments |
| `/appointments` | POST | ✅ | Admin, Receptionist | Create appointment |
| `/billing` | GET | ✅ | Admin, Doctor | List bills |
| `/dashboard/stats` | GET | ✅ | Admin, Doctor | Dashboard statistics |
| `/prescriptions` | GET | ✅ | All | List prescriptions |

For complete API documentation, see [API-DOCUMENTATION.md](../../docs/API-DOCUMENTATION.md)

---

## 🔒 Security Features

### Implemented Security Measures

1. **Authentication & Authorization**
   - JWT tokens with HS256 algorithm
   - Password hashing with bcrypt (10 rounds)
   - Role-based access control (RBAC)
   - Token expiration (7 days default)

2. **API Security**
   - Rate limiting (100 requests/15 min per IP)
   - Auth rate limiting (5 attempts/15 min per IP)
   - CORS with origin whitelisting
   - Security headers (Helmet.js)
   - Input sanitization
   - Request body size limits (10MB)

3. **Data Protection**
   - SQL injection prevention (Prisma ORM)
   - XSS protection
   - CSRF protection
   - Secure session management

4. **HIPAA Compliance**
   - Audit logging for all sensitive operations
   - Data encryption in transit (HTTPS)
   - Secure password requirements
   - Session timeout
   - Access control logging

5. **Error Handling**
   - No sensitive data in error messages
   - Centralized error handling
   - Structured error responses
   - Stack traces only in development

---

## 🚀 Production Deployment

### Deployment Options

1. **Render** (Recommended)
   - See [RENDER-DEPLOYMENT.md](../../RENDER-DEPLOYMENT.md)
   - One-click deployment from GitHub
   - Automatic SSL certificates
   - Managed PostgreSQL available

2. **Docker**
   ```bash
   docker build -t hms-backend .
   docker run -p 3001:3001 --env-file .env hms-backend
   ```

3. **Manual Deployment**
   ```bash
   npm install --omit=dev
   npx prisma generate
   npm start
   ```

### Pre-Deployment Checklist

- ✅ All environment variables set
- ✅ `NODE_ENV=production`
- ✅ Strong JWT_SECRET (64+ characters)
- ✅ Database connection tested
- ✅ CORS_ORIGIN set to frontend URL
- ✅ Rate limiting configured
- ✅ Health check endpoint working
- ✅ Logs configured properly

### Post-Deployment

1. **Test Health Endpoint**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

2. **Monitor Logs**
   - Check application logs in dashboard
   - Set up error alerts
   - Monitor response times

3. **Set Up Monitoring**
   - Use UptimeRobot or Pingdom
   - Configure alerting
   - Track API performance

---

## 📊 Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)

# Production
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (caution!)

# Code Quality
npm run lint             # Run ESLint
```

---

## 🧪 Testing

### Test Credentials

After running `npm run db:seed`:

- **Admin**: admin@hospital.com / password123
- **Doctor**: doctor@hospital.com / password123
- **Patient**: patient@hospital.com / password123

⚠️ **Change these in production!**

---

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
- Check DATABASE_URL is correct
- Verify Supabase project is active
- Ensure connection pooling URL uses port 6543

**JWT token errors**
- Verify JWT_SECRET is set and strong
- Check token hasn't expired
- Ensure Authorization header format: `Bearer <token>`

**Rate limit errors**
- Wait 15 minutes before retrying
- Check if your IP is being rate limited
- Verify rate limit configuration

---

## 📞 Support

- **Documentation**: [/docs](../../docs/)
- **Issues**: [GitHub Issues](https://github.com/vivek12coder/hms/issues)
- **Email**: vivek12coder@gmail.com

---

## 📄 License

MIT License - see LICENSE file for details

---

**Last Updated**: November 3, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
