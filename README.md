<div align="center">

# 🏥 Hospital Management System (HMS)

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)

### *Revolutionizing Healthcare Management with Modern Technology*

**A comprehensive, HIPAA-compliant Hospital Management System built with cutting-edge web technologies, featuring AI-powered insights, real-time analytics, and seamless user experience.**

[🚀 **Live Demo**](https://hms-demo.vercel.app) • [📖 **Documentation**](https://docs.hms.com) • [🐛 **Report Bug**](https://github.com/vivek12coder/hms/issues) • [💡 **Request Feature**](https://github.com/vivek12coder/hms/issues)

---

</div>

## 🌟 Overview

The **Hospital Management System (HMS)** is a next-generation healthcare platform designed to streamline hospital operations, enhance patient care, and ensure regulatory compliance. Built with a modern tech stack, it offers a comprehensive solution for managing patients, appointments, billing, and administrative tasks with enterprise-level security and scalability.

### 🎯 **Key Highlights**
- 🔐 **HIPAA Compliant** - Full healthcare data protection standards
- 🎨 **Modern UI/UX** - Intuitive design with accessibility in mind
- ⚡ **Real-time Updates** - Live notifications and data synchronization
- 📱 **Responsive Design** - Optimized for all devices and screen sizes
- 🔒 **Enterprise Security** - Multi-layer authentication and authorization
- 📊 **Advanced Analytics** - AI-powered insights and reporting
- 🌐 **Multi-tenant Ready** - Support for multiple healthcare facilities

---

## ✨ Features & Capabilities

<table>
<tr>
<td width="50%">

### 👥 **Patient Management**
- Complete patient registration & profiles
- Medical history tracking with timeline
- Insurance management & verification
- Emergency contact management
- Document & report storage
- Allergies & medication tracking

### 📅 **Smart Scheduling**
- Interactive calendar-based booking
- Doctor availability management
- Automated appointment reminders
- Conflict resolution & rescheduling
- Waitlist management
- Multi-location support

### 💰 **Billing & Finance**
- Automated invoice generation
- Insurance claim processing
- Payment gateway integration
- Financial reporting & analytics
- Outstanding balance tracking
- Multi-currency support

</td>
<td width="50%">

### 👨‍⚕️ **Staff Management**
- Role-based access control (RBAC)
- Doctor scheduling & shifts
- Staff performance analytics
- Department management
- Credential tracking
- Communication tools

### 📋 **Medical Records**
- Electronic Health Records (EHR)
- Prescription management
- Lab results integration
- Diagnostic imaging support
- Treatment plan tracking
- Audit trail maintenance

### 📊 **Analytics & Reports**
- Real-time dashboard metrics
- Custom report generation
- Patient flow analytics
- Revenue optimization
- Compliance reporting
- Predictive insights

</td>
</tr>
</table>

---

## 🏗️ Architecture & Tech Stack

<div align="center">

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App Router]
        B[React 19 + TypeScript]
        C[Tailwind CSS + shadcn/ui]
        D[React Hook Form + Zod]
    end
    
    subgraph "API Layer"
        E[Express.js REST API]
        F[JWT Authentication]
        G[Rate Limiting + Security]
        H[Input Validation]
    end
    
    subgraph "Database Layer"
        I[PostgreSQL Database]
        J[Prisma ORM]
        K[Connection Pooling]
        L[Audit Logging]
    end
    
    subgraph "Security & Compliance"
        M[HIPAA Compliance]
        N[Data Encryption]
        O[RBAC Authorization]
        P[Audit Trail]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J
    J --> K
    K --> L
    M --> N
    N --> O
    O --> P
```

</div>

### 🎯 **Frontend Technologies**

| Technology | Version | Purpose | Benefits |
|------------|---------|---------|----------|
| **Next.js** | `15.5.3` | React Framework | Server-side rendering, routing, optimization |
| **React** | `19.1.0` | UI Library | Component-based architecture, hooks |
| **TypeScript** | `5+` | Language | Type safety, better developer experience |
| **Tailwind CSS** | `4.x` | Styling | Utility-first, responsive design |
| **shadcn/ui** | Latest | UI Components | High-quality, accessible components |
| **React Hook Form** | `7.63.0` | Forms | Performance-optimized form handling |
| **Zod** | `4.1.11` | Validation | Type-safe schema validation |
| **Sonner** | `2.0.7` | Notifications | Toast notifications |
| **Lucide React** | `0.544.0` | Icons | Beautiful, consistent icons |

### ⚙️ **Backend Technologies**

| Technology | Version | Purpose | Benefits |
|------------|---------|---------|----------|
| **Node.js** | `18+` | Runtime | Fast, scalable JavaScript runtime |
| **Express.js** | `5.1.0` | Web Framework | Lightweight, flexible API framework |
| **Prisma** | `6.16.2` | Database ORM | Type-safe database operations |
| **PostgreSQL** | `14+` | Database | Robust, scalable relational database |
| **JWT** | `9.0.2` | Authentication | Secure, stateless authentication |
| **bcryptjs** | `3.0.2` | Password Hashing | Secure password storage |
| **Helmet** | `8.1.0` | Security | HTTP security headers |
| **CORS** | `2.8.5` | Cross-Origin | Secure cross-origin requests |

---

## 🚀 Quick Start Guide

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** `18.0.0` or higher ([Download](https://nodejs.org/))
- **PostgreSQL** `14.0` or higher ([Download](https://postgresql.org/download/))
- **Git** for version control ([Download](https://git-scm.com/))
- **npm** or **yarn** package manager

### 🔧 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vivek12coder/hms.git
   cd hms
   ```

2. **Install Dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**

   **Backend Environment** (`backend/.env`):
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:1234@localhost:5432/hospital_management?schema=public"
   DIRECT_URL="postgresql://postgres:1234@localhost:5432/hospital_management?schema=public"
   
   # Authentication
   JWT_SECRET="your-super-secure-jwt-secret-key-change-this-in-production-64-chars-minimum"
   JWT_EXPIRES_IN="24h"
   
   # Server Configuration
   NODE_ENV="development"
   PORT="3001"
   CORS_ORIGIN="http://localhost:3000"
   
   # Security & Logging
   LOG_LEVEL="info"
   ENABLE_AUDIT_LOGGING="true"
   API_RATE_LIMIT="100"
   AUTH_RATE_LIMIT="5"
   ```

   **Frontend Environment** (`frontend/.env.local`):
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   NEXT_PUBLIC_HOSPITAL_NAME="City General Hospital"
   NEXT_PUBLIC_APP_ENV="development"
   NEXT_PUBLIC_DEBUG_MODE="true"
   
   # Authentication
   NEXT_PUBLIC_LOGIN_REDIRECT_URL="/dashboard"
   NEXT_PUBLIC_LOGOUT_REDIRECT_URL="/auth/login"
   NEXT_PUBLIC_SESSION_TIMEOUT="1440"
   
   # UI Configuration
   NEXT_PUBLIC_DEFAULT_THEME="light"
   NEXT_PUBLIC_ENABLE_APPOINTMENTS="true"
   NEXT_PUBLIC_ENABLE_BILLING="true"
   ```

4. **Database Setup**
   ```bash
   cd backend
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed with sample data
   npx prisma db seed
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend API
   cd backend
   npm run dev
   
   # Terminal 2: Frontend App
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)

### 👤 **Test Credentials**

| Role | Email | Password | Capabilities |
|------|-------|----------|-------------|
| **Admin** | `admin@hospital.com` | `password123` | Full system access, user management |
| **Doctor** | `doctor@hospital.com` | `password123` | Patient records, appointments, prescriptions |
| **Patient** | `patient@hospital.com` | `password123` | Personal data, appointments, billing |
| **Receptionist** | `reception@hospital.com` | `password123` | Check-ins, scheduling, basic admin |

---

## 🏗️ Project Structure

```
hospital-management-system/
├── 📁 frontend/                    # Next.js Frontend Application
│   ├── 📁 public/                  # Static assets and files
│   ├── 📁 src/
│   │   ├── 📁 app/                 # Next.js App Router pages
│   │   │   ├── 📁 appointments/    # Appointment management pages
│   │   │   ├── 📁 auth/            # Authentication (login/register)
│   │   │   ├── 📁 billing/         # Billing and payment pages
│   │   │   ├── 📁 dashboard/       # Role-based dashboard views
│   │   │   ├── 📁 doctors/         # Doctor management pages
│   │   │   ├── 📁 patients/        # Patient management pages
│   │   │   ├── 📁 prescriptions/   # Prescription management
│   │   │   └── 📁 settings/        # System and user settings
│   │   ├── 📁 components/          # Reusable React components
│   │   │   ├── 📁 auth/            # Authentication components
│   │   │   ├── 📁 dashboard/       # Dashboard-specific components
│   │   │   ├── 📁 forms/           # Form components and validators
│   │   │   ├── 📁 layout/          # Layout components (navbar, sidebar)
│   │   │   └── 📁 ui/              # Base UI components (shadcn/ui)
│   │   └── 📁 lib/                 # Utilities and helper functions
│   │       ├── 📄 api-client.ts    # API client with error handling
│   │       ├── 📄 auth.ts          # Authentication utilities
│   │       ├── 📄 constants.ts     # Application constants
│   │       ├── 📄 rbac.ts          # Role-based access control
│   │       └── 📄 utils.ts         # General utility functions
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 📄 next.config.ts           # Next.js configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS configuration
│   └── 📄 tsconfig.json            # TypeScript configuration
│
├── 📁 backend/                     # Express.js Backend API
│   ├── 📁 src/
│   │   ├── 📁 config/              # Configuration files
│   │   │   └── 📄 database.js      # Database connection setup
│   │   ├── 📁 controllers/         # Request handlers and business logic
│   │   │   ├── 📄 authController.js      # Authentication endpoints
│   │   │   ├── 📄 billingController.js   # Billing management
│   │   │   ├── 📄 doctorController.js    # Doctor management
│   │   │   └── 📄 patientController.js   # Patient management
│   │   ├── 📁 middleware/          # Express middleware functions
│   │   │   ├── 📄 auth.js          # JWT authentication middleware
│   │   │   ├── 📄 error.js         # Global error handling
│   │   │   ├── 📄 rbac.js          # Role-based access control
│   │   │   └── 📄 security.js      # Security headers and validation
│   │   ├── 📁 routes/              # API route definitions
│   │   │   ├── 📄 appointments.js  # Appointment management routes
│   │   │   ├── 📄 auth.js          # Authentication routes
│   │   │   ├── 📄 billing.js       # Billing and payment routes
│   │   │   ├── 📄 dashboard.js     # Dashboard analytics routes
│   │   │   ├── 📄 doctors.js       # Doctor management routes
│   │   │   ├── 📄 patients.js      # Patient management routes
│   │   │   └── 📄 prescriptions.js # Prescription management routes
│   │   ├── 📁 services/            # Business logic services
│   │   │   ├── 📄 AuditService.js        # Audit logging service
│   │   │   ├── 📄 AuthService.js         # Authentication service
│   │   │   ├── 📄 BillingService.js      # Billing logic service
│   │   │   ├── 📄 DashboardService.js    # Dashboard analytics
│   │   │   ├── 📄 DoctorService.js       # Doctor management service
│   │   │   └── 📄 PatientService.js      # Patient management service
│   │   ├── 📁 utils/               # Helper utilities
│   │   │   ├── 📄 auth.js          # Authentication utilities
│   │   │   └── 📄 logger.js        # Logging configuration
│   │   └── 📄 server.js            # Express server initialization
│   ├── 📄 schema.prisma            # Database schema definition
│   ├── 📄 seed.js                  # Database seeding script
│   ├── 📄 package.json             # Backend dependencies
│   └── 📄 .env                     # Environment variables (not in git)
│
├── 📄 README.md                    # Project documentation (this file)
├── 📄 DEPLOYMENT.md                # Deployment instructions
├── 📄 package.json                 # Root package.json for scripts
└── 📄 .gitignore                   # Git ignore configuration
```

---
│   │   ├── /services              # Business logic services
│   │   │   ├── AuditService.js    # Audit logging service
│   │   │   ├── AuthService.js     # Authentication service
│   │   │   └── PatientService.js  # Patient management service
│   │   ├── /utils                 # Helper utilities
│   │   │   ├── auth.js            # Auth utilities
│   │   │   └── logger.js          # Logging configuration
│   │   └── server.js              # Express server setup
│   ├── schema.prisma              # Prisma database schema
│   └── package.json               # Backend dependencies
│
├── README.md                      # Project documentation
├── .gitignore                     # Git ignore file
└── package.json                   # Root package.json for monorepo
```

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+ database
- npm or yarn package manager
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hospital_management_system
```

2. Install dependencies for both frontend and backend
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables

**Backend (.env)**
```
# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/hospital_db
DIRECT_URL=postgresql://username:password@localhost:5432/hospital_db

# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=1d

# Server configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Logging and security
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_USE_MOCK_DASHBOARD=false
```

4. Set up the database
```bash
# Create the database (if not using existing)
# psql -c "CREATE DATABASE hospital_db;"

# Run migrations
cd backend
npx prisma migrate dev --name init

# Seed with sample data (optional)
npx prisma db seed
```

5. Run the development servers
```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

6. Access the application
   - Open your browser and navigate to `http://localhost:3000`
   - Log in with sample credentials:
     - Admin: admin@hospital.com / password123
     - Doctor: doctor@hospital.com / password123
     - Patient: patient@hospital.com / password123
     - Receptionist: reception@hospital.com / password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  - Body: `{ firstName, lastName, email, password, role }`
  - Response: `{ id, email, role, token }`

- `POST /api/auth/login` - User login
  - Body: `{ email, password }`
  - Response: `{ id, email, role, token }`

- `GET /api/auth/me` - Get current user profile
  - Header: `Authorization: Bearer {token}`
  - Response: `{ id, email, firstName, lastName, role, ... }`

- `PUT /api/auth/me` - Update current user profile
  - Header: `Authorization: Bearer {token}`
  - Body: `{ firstName, lastName, email, ... }`

### Patients
- `GET /api/patients` - List patients (paginated)
  - Query: `?page=1&limit=20&search=smith`
  - Response: `{ data: [...patients], total, page, limit }`

- `POST /api/patients` - Create new patient
  - Body: `{ firstName, lastName, email, dateOfBirth, gender, ... }`
  - Response: `{ id, firstName, lastName, ... }`

- `GET /api/patients/:id` - Get patient details
  - Response: `{ id, firstName, lastName, medicalHistory, ... }`

- `PUT /api/patients/:id` - Update patient
  - Body: `{ firstName, lastName, ... }`
  - Response: `{ id, firstName, lastName, ... }`

### Appointments
- `GET /api/appointments` - List appointments
  - Query: `?date=2023-12-01&doctorId=123`
  - Response: `{ data: [...appointments], total }`

- `POST /api/appointments` - Create appointment
  - Body: `{ patientId, doctorId, date, time, notes, ... }`
  - Response: `{ id, patientName, doctorName, date, ... }`

- `PUT /api/appointments/:id` - Update appointment
  - Response: `{ id, status, ... }`

- `DELETE /api/appointments/:id` - Cancel appointment

### Billing
- `GET /api/billing` - List billing records
  - Query: `?status=paid&patientId=123`
  - Response: `{ data: [...bills], total }`

- `POST /api/billing` - Create new bill
  - Body: `{ patientId, appointmentId, items: [...], total, ... }`
  - Response: `{ id, invoiceNumber, total, ... }`

- `GET /api/billing/:id` - Get bill details
  - Response: `{ id, details, status, payments, ... }`

### Dashboard
- `GET /api/dashboard/stats` - Get role-based dashboard statistics
  - Response: `{ patients, appointments, revenue, ... }`

## User Roles & Permissions

### Admin
- Full system access
- Manage all users (create, update, disable)
- View analytics and reporting
- Configure system settings
- Access all patient records and billing information

### Doctor
- View and update assigned patient records
- Manage appointments and scheduling
- Create and manage prescriptions
- View patient medical history
- Access billing related to their patients

### Patient
- View and update own profile
- Book and manage appointments
- View own medical records and history
- View and pay personal bills
- Request prescription refills

### Receptionist
- Register new patients
- Manage check-ins and appointments
- Process basic administrative tasks
- Generate billing records
- Handle patient scheduling and wait times

## Security & Compliance

- **JWT Authentication**: Secure, expiring tokens with refresh capability
- **Role-Based Access Control**: Granular permissions based on user role
- **Data Encryption**: Sensitive data encryption at rest and in transit
- **Input Validation**: Comprehensive validation with Zod to prevent injection attacks
- **Rate Limiting**: Protection against brute force and DoS attacks
- **Audit Logging**: Comprehensive logging for security events and compliance
- **HIPAA Compliance**: Following healthcare data protection standards
- **CORS Protection**: Configured to prevent cross-site request forgery

## Deployment

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository to Vercel/Netlify
2. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Output directory: `frontend/.next`
3. Set required environment variables
4. Deploy and monitor build logs

### Backend Deployment (Railway/Render)
1. Create a new web service
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `cd backend && npm install && npx prisma generate`
   - Start command: `cd backend && npm start`
4. Set all required environment variables
5. Deploy and verify API access

### Database (Supabase/Neon)
1. Create a PostgreSQL database
2. Set up connection pooling if needed
3. Update your `DATABASE_URL` in environment variables
4. Run migrations: `npx prisma migrate deploy`
5. Configure database backup strategy

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code follows our style guidelines and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.