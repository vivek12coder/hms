# Hospital Management System (HMS)

## Overview

A comprehensive, modern Hospital Management System built with Next.js, Express.js, and PostgreSQL. This system streamlines hospital operations with robust patient management, appointment scheduling, billing capabilities, and role-based access control with a focus on security and user experience.

![Hospital Management System Dashboard](https://placeholder-for-dashboard-screenshot.com/dashboard.png)

## Features

- **Patient Management**: Complete registration, medical history tracking, and profile management
- **Appointment Scheduling**: Interactive calendar-based booking system with doctor availability
- **Billing System**: Automated invoice generation, payment tracking, and financial reporting
- **User Management**: Role-based access control (Admin, Doctor, Patient, Receptionist)
- **Dashboard Analytics**: Real-time insights and key performance indicators
- **Security**: JWT authentication, data encryption, audit logging, and HIPAA compliance
- **Mobile Responsive**: Optimized for all device sizes from smartphones to large displays

## Tech Stack

### Frontend
- **Next.js 14+**: Modern React framework with App Router architecture
- **React 18**: For building interactive user interfaces
- **TypeScript**: For type safety and improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: High-quality, accessible UI components
- **Zod**: Type-safe form validation
- **Sonner**: Toast notifications
- **Lucide Icons**: Consistent, beautiful icon set
- **React Hook Form**: Performant, flexible forms

#### Dashboard Data Source
Dashboards first attempt to load real metrics from `GET /api/dashboard/stats` (requires auth token).
If the request fails or you want to force mock data, create `frontend/.env.local` and add:

```
NEXT_PUBLIC_USE_MOCK_DASHBOARD=true
```

When enabled (or on error), data falls back to curated mocks in `src/lib/dashboardData.ts` via the unified loader `src/lib/dashboardDataSource.ts`. This lets UI development continue while backend endpoints evolve.

### Backend
- **Express.js**: Fast, unopinionated web framework for Node.js
- **Prisma ORM**: Modern database toolkit for PostgreSQL
- **PostgreSQL**: Robust, scalable relational database
- **JWT Authentication**: Secure, stateless authentication
- **Bcrypt**: Secure password hashing
- **Winston**: Structured, flexible logging
- **Zod**: Runtime validation for API requests
- **Node.js 18+**: JavaScript runtime

## Project Structure

```
/hospital_management_system
├── /frontend                      # Next.js frontend application
│   ├── /public                    # Static assets
│   ├── /src
│   │   ├── /app                   # Next.js App Router pages
│   │   │   ├── /appointments      # Appointment management
│   │   │   ├── /auth              # Authentication (login/register)
│   │   │   ├── /billing           # Billing and payments
│   │   │   ├── /dashboard         # Role-based dashboards
│   │   │   ├── /doctors           # Doctor profiles and management
│   │   │   ├── /patients          # Patient management
│   │   │   ├── /prescriptions     # Prescription management
│   │   │   └── /settings          # User and system settings
│   │   ├── /components            # React components
│   │   │   ├── /auth              # Authentication components
│   │   │   ├── /dashboard         # Dashboard-specific components
│   │   │   ├── /forms             # Form components and validators
│   │   │   ├── /layout            # Layout components (navbar, sidebar)
│   │   │   └── /ui                # Reusable UI components
│   │   ├── /lib                   # Utilities and helpers
│   │   │   ├── api-client.ts      # API client with error handling
│   │   │   ├── auth.ts            # Authentication utilities
│   │   │   ├── constants.ts       # Application constants
│   │   │   ├── rbac.ts            # Role-based access control logic
│   │   │   └── utils.ts           # Utility functions
│   └── package.json               # Frontend dependencies
│
├── /backend                       # Express.js backend API
│   ├── /src
│   │   ├── /config                # Configuration settings
│   │   │   └── database.js        # Database configuration
│   │   ├── /controllers           # API controllers
│   │   │   ├── authController.js  # Authentication endpoints
│   │   │   ├── billingController.js # Billing endpoints
│   │   │   ├── doctorController.js  # Doctor management
│   │   │   └── patientController.js # Patient management
│   │   ├── /middleware            # Express middleware
│   │   │   ├── auth.js            # Authentication middleware
│   │   │   ├── error.js           # Error handling middleware
│   │   │   ├── rbac.js            # Role-based access control
│   │   │   └── security.js        # Security middleware
│   │   ├── /routes                # API routes
│   │   │   ├── appointments.js    # Appointment routes
│   │   │   ├── auth.js            # Authentication routes
│   │   │   ├── billing.js         # Billing routes
│   │   │   └── patients.js        # Patient routes
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