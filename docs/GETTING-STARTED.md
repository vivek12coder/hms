# 🚀 Getting Started Guide - Hospital Management System

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [First Login](#first-login)
- [Common Issues](#common-issues)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### **Required Software**

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   
2. **PostgreSQL** (v14.0 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`
   
3. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **Code Editor** (recommended)
   - Visual Studio Code: https://code.visualstudio.com/

### **System Requirements**

**Minimum:**
- CPU: Dual-core processor
- RAM: 4GB
- Storage: 10GB available space
- OS: Windows 10, macOS 10.15+, or Linux

**Recommended:**
- CPU: Quad-core processor
- RAM: 8GB or more
- Storage: 20GB SSD
- OS: Latest version of Windows, macOS, or Linux

---

## 🔧 Installation Steps

### **Step 1: Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/vivek12coder/hms.git

# Navigate to project directory
cd hms
```

### **Step 2: Install Backend Dependencies**

```bash
# Navigate to backend folder
cd backend

# Install Node.js dependencies
npm install

# Expected output: "added X packages" with no errors
```

### **Step 3: Install Frontend Dependencies**

```bash
# Navigate to frontend folder (from project root)
cd ../frontend

# Install Node.js dependencies
npm install

# Expected output: "added X packages" with no errors
```

### **Step 4: Set Up PostgreSQL Database**

#### **Option A: Using psql command line**

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE hospital_management;

# Exit psql
\q
```

#### **Option B: Using pgAdmin**

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Enter name: `hospital_management`
5. Click "Save"

---

## ⚙️ Configuration

### **Step 5: Configure Backend Environment**

Create a `.env` file in the `backend` folder:

```bash
# Navigate to backend folder
cd backend

# Create .env file (Windows PowerShell)
New-Item -Path .env -ItemType File

# Or on macOS/Linux
touch .env
```

Add the following content to `backend/.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospital_management?schema=public"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospital_management?schema=public"

# Replace YOUR_PASSWORD with your PostgreSQL password

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-change-this-in-production-min-64-chars"
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

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

### **Step 6: Configure Frontend Environment**

Create a `.env.local` file in the `frontend` folder:

```bash
# Navigate to frontend folder
cd ../frontend

# Create .env.local file (Windows PowerShell)
New-Item -Path .env.local -ItemType File

# Or on macOS/Linux
touch .env.local
```

Add the following content to `frontend/.env.local`:

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

### **Step 7: Initialize Database**

```bash
# Navigate to backend folder
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run seed
```

Expected output:
```
✓ Prisma Client generated
✓ Database migrations applied
✓ Sample data seeded successfully
```

---

## 🚀 Running the Application

### **Step 8: Start Backend Server**

Open a terminal window:

```bash
# Navigate to backend folder
cd backend

# Start development server
npm run dev
```

Expected output:
```
INFO: Server running on port 3001 in development mode
INFO: ✅ Hospital Management System initialized
```

**Keep this terminal window open!**

### **Step 9: Start Frontend Server**

Open a **new** terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Start development server
npm run dev
```

Expected output:
```
▲ Next.js 15.5.3 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 3s
```

**Keep this terminal window open too!**

### **Step 10: Access the Application**

Open your web browser and navigate to:

**Frontend Application**: http://localhost:3000

**Backend API**: http://localhost:3001/api

---

## 👤 First Login

### **Default User Accounts**

The seeded database includes the following test accounts:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | admin@hospital.com | admin123 | System administration |
| **Doctor** | doctor@hospital.com | doctor123 | Doctor portal testing |
| **Patient** | patient@hospital.com | patient123 | Patient portal testing |
| **Receptionist** | reception@hospital.com | reception123 | Reception desk testing |

### **Login Steps**

1. Go to http://localhost:3000
2. You'll be redirected to the login page
3. Enter one of the test account credentials
4. Click "Sign In"
5. You'll be redirected to the appropriate dashboard

### **First-Time Recommendations**

**As Admin:**
1. Change default password immediately
2. Explore the admin dashboard
3. Create a new test patient
4. Try creating a new user
5. View system statistics

**As Doctor:**
1. View assigned patients
2. Check appointment schedule
3. Update your profile

**As Patient:**
1. View your medical records
2. Book an appointment
3. Check billing information

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Cannot connect to PostgreSQL"**

**Error:**
```
Error: P1001: Can't reach database server
```

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   pg_isready
   
   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Verify database credentials in `backend/.env`
3. Ensure database `hospital_management` exists
4. Try connecting manually:
   ```bash
   psql -U postgres -d hospital_management
   ```

### **Issue 2: "Port 3000 or 3001 already in use"**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

**Windows:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### **Issue 3: "Prisma Client not generated"**

**Error:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
cd backend
npx prisma generate
npm run dev
```

### **Issue 4: "Module not found" errors**

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

# Repeat for frontend if needed
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### **Issue 5: "JWT_SECRET not defined"**

**Error:**
```
Error: JWT_SECRET environment variable is required
```

**Solution:**
1. Ensure `.env` file exists in `backend` folder
2. Check that `JWT_SECRET` is defined
3. Restart backend server

### **Issue 6: "CORS Error"**

**Error:**
```
Access to fetch at 'http://localhost:3001/api' has been blocked by CORS policy
```

**Solution:**
1. Check `CORS_ORIGIN` in `backend/.env` is set to `http://localhost:3000`
2. Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is `http://localhost:3001/api`
3. Restart both servers

---

## 🔍 Verify Installation

Run these checks to ensure everything is working:

### **Backend Health Check**

```bash
# Test backend API
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","message":"API is running"}
```

### **Frontend Health Check**

1. Open browser DevTools (F12)
2. Go to http://localhost:3000
3. Check Console tab - should have no errors
4. Check Network tab - API calls should return 200 status

### **Database Health Check**

```bash
cd backend
npx prisma studio
```

- Should open Prisma Studio in browser
- You should see tables: users, patients, doctors, etc.
- Tables should contain seed data

---

## 📚 Next Steps

After successful installation:

1. **Read Documentation**
   - [API Documentation](./API-DOCUMENTATION.md)
   - [User Guide](./USER-GUIDE.md)
   - [Deployment Guide](./DEPLOYMENT.md)

2. **Explore Features**
   - Try all user roles
   - Create test patients and appointments
   - Generate billing records
   - View analytics dashboard

3. **Customize**
   - Update hospital name in `frontend/.env.local`
   - Modify theme colors
   - Add your logo

4. **Development**
   - Set up your IDE
   - Review code structure
   - Read contribution guidelines

---

## 💡 Tips for Development

### **Useful Commands**

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run seed         # Reseed database
npx prisma studio    # Open database GUI
npx prisma migrate dev --name <name>  # Create migration

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### **IDE Extensions (VS Code)**

Recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens

### **Development Workflow**

1. Start backend server first
2. Then start frontend server
3. Make changes with hot reload
4. Test in browser
5. Check terminal for errors

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check Logs**
   - Backend terminal output
   - Browser console (F12)
   - Network tab in DevTools

2. **Documentation**
   - Review [Troubleshooting Guide](./TROUBLESHOOTING.md)
   - Check [FAQ](./FAQ.md)

3. **Community Support**
   - GitHub Issues: [Report Issue](https://github.com/vivek12coder/hms/issues)
   - GitHub Discussions: [Ask Question](https://github.com/vivek12coder/hms/discussions)

4. **Contact**
   - Email: vivek12coder@gmail.com

---

## ✅ Installation Checklist

Use this checklist to track your progress:

- [ ] Node.js installed and verified
- [ ] PostgreSQL installed and running
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] PostgreSQL database created
- [ ] Backend .env configured
- [ ] Frontend .env.local configured
- [ ] Prisma client generated
- [ ] Database migrations applied
- [ ] Sample data seeded
- [ ] Backend server started successfully
- [ ] Frontend server started successfully
- [ ] Successfully logged in with test account
- [ ] Explored dashboard features

---

**Congratulations! 🎉** You've successfully set up the Hospital Management System!

*Last Updated: November 2025*
