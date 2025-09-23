# Hospital Management System (HMS)

A comprehensive Hospital Management System built with Next.js (frontend) and Express.js (backend), featuring patient management, appointment scheduling, and billing capabilities.

## Features

- **Patient Management**: Registration, profile management, and medical history
- **Appointment Scheduling**: Calendar-based booking system with doctor availability
- **Billing System**: Invoice generation and payment tracking
- **User Management**: Role-based access control (Admin, Doctor, Patient)
- **Security**: JWT authentication, data encryption, and HIPAA compliance

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- Tailwind CSS
- shadcn/ui components
- TypeScript

### Backend
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Node.js

## Project Structure

```
├── /frontend          # Next.js frontend application
├── /backend           # Express.js backend API
├── README.md          # Project documentation
├── .gitignore         # Git ignore file
└── package.json       # Root package.json for monorepo management
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hospital_management_system
```

2. Install dependencies for both frontend and backend
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env` in both frontend and backend directories
- Configure your database connection and other environment variables

4. Set up the database
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Run the development servers
```bash
# Run backend (from backend directory)
npm run dev

# Run frontend (from frontend directory, in a new terminal)
npm run dev
```

## Development Workflow

1. **Patient Registration**: Patients can sign up and enter their details
2. **Appointment Scheduling**: Patients can book appointments with available doctors
3. **Billing**: System generates bills post-appointment with payment tracking
4. **Admin Tasks**: Admins can manage users, doctors, and view analytics

## Security & Compliance

- JWT-based authentication
- Role-based access control
- Data encryption for sensitive information
- Audit logging
- HIPAA compliance measures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.