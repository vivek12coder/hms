# 🚀 Deployment Guide - Hospital Management System

## 📋 Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Migration](#database-migration)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificates ready
- [ ] Domain configured
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Documentation updated
- [ ] Team trained on new features

---

## 🔧 Environment Setup

### **Backend Environment Variables**

Create `.env` file for production:

```env
# Database (Use managed database URL)
DATABASE_URL="postgresql://user:password@host:5432/hospital_management"
DIRECT_URL="postgresql://user:password@host:5432/hospital_management"

# Authentication (Generate secure keys)
JWT_SECRET="YOUR-256-BIT-SECRET-KEY-GENERATE-USING-OPENSSL"
JWT_EXPIRES_IN="12h"

# Server
NODE_ENV="production"
PORT="3001"
CORS_ORIGIN="https://yourdomain.com"

# Security
LOG_LEVEL="warn"
ENABLE_AUDIT_LOGGING="true"
API_RATE_LIMIT="100"
AUTH_RATE_LIMIT="5"
```

**Generate Secure JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Frontend Environment Variables**

Create `.env.production`:

```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api"
NEXT_PUBLIC_HOSPITAL_NAME="Your Hospital Name"
NEXT_PUBLIC_APP_ENV="production"
NEXT_PUBLIC_DEBUG_MODE="false"

NEXT_PUBLIC_LOGIN_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_LOGOUT_REDIRECT_URL="/auth/login"
NEXT_PUBLIC_SESSION_TIMEOUT="720"

NEXT_PUBLIC_DEFAULT_THEME="light"
NEXT_PUBLIC_ENABLE_APPOINTMENTS="true"
NEXT_PUBLIC_ENABLE_BILLING="true"
```

---

## 🗄️ Database Migration

### **1. Backup Current Database**

```bash
# PostgreSQL backup
pg_dump -U postgres hospital_management > backup_$(date +%Y%m%d).sql

# Or using Prisma
npx prisma db pull
```

### **2. Run Migrations**

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations in production
npx prisma migrate deploy
```

### **3. Verify Migration**

```bash
# Connect to production database
psql -U postgres -h your-db-host -d hospital_management

# Check tables
\dt

# Verify data
SELECT COUNT(*) FROM users;
```

---

## 🌐 Deployment Options

## Option 1: Vercel + Railway (Recommended)

### **Frontend on Vercel**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Environment Variables** (In Vercel Dashboard)
   - Go to Project Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` variables
   - Redeploy

5. **Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records

### **Backend on Railway**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Create New Project**
   ```bash
   cd backend
   railway init
   ```

4. **Add PostgreSQL**
   ```bash
   railway add --database postgres
   ```

5. **Deploy Backend**
   ```bash
   railway up
   ```

6. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-secret
   railway variables set NODE_ENV=production
   ```

7. **Get URLs**
   ```bash
   railway domain
   ```

---

## Option 2: Docker Deployment

### **1. Create Dockerfiles**

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
```

### **2. Docker Compose**

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: hospital_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/hospital_management
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### **3. Deploy with Docker**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Option 3: AWS Deployment

### **Frontend on AWS Amplify**

1. **Connect GitHub Repository**
   - Go to AWS Amplify Console
   - Click "New App" → "Host Web App"
   - Connect GitHub repository
   - Select `frontend` folder as root

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables

### **Backend on AWS Elastic Beanstalk**

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize**
   ```bash
   cd backend
   eb init -p node.js-18 hms-backend
   ```

3. **Create Environment**
   ```bash
   eb create hms-production
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv JWT_SECRET=your-secret NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### **Database on AWS RDS**

1. Create PostgreSQL instance in RDS
2. Configure security groups
3. Update `DATABASE_URL` in backend environment

---

## Option 4: DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Select `backend` and `frontend` components

2. **Configure Backend**
   - Detect Node.js automatically
   - Set environment variables
   - Add PostgreSQL managed database

3. **Configure Frontend**
   - Detect Next.js automatically
   - Set environment variables
   - Enable CDN

4. **Deploy**
   - Click "Deploy"
   - Monitor build logs

---

## 🔒 Production Security Checklist

### **Backend Security**

```javascript
// Ensure these in production
- [ ] HTTPS enabled (SSL/TLS)
- [ ] Strong JWT secret (64+ characters)
- [ ] Rate limiting configured
- [ ] CORS restricted to frontend domain
- [ ] Helmet.js security headers enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection enabled
- [ ] Environment variables secured
- [ ] Database credentials encrypted
```

### **Frontend Security**

```javascript
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] API keys not exposed in client code
- [ ] Authentication tokens in httpOnly cookies
- [ ] XSS protection in forms
- [ ] CSRF tokens implemented
- [ ] Secure session management
```

### **Database Security**

```sql
-- Create read-only user for reporting
CREATE USER reports WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reports;

-- Enable SSL connections
ALTER SYSTEM SET ssl = on;

-- Set password encryption
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
```

---

## 📊 Post-Deployment

### **1. Verify Deployment**

```bash
# Check backend health
curl https://api.yourdomain.com/api/health

# Check frontend
curl https://yourdomain.com
```

### **2. Initial Configuration**

1. **Change Default Passwords**
   ```sql
   -- Connect to database
   UPDATE users SET password = 'new_hashed_password' WHERE email = 'admin@hospital.com';
   ```

2. **Create Admin Account**
   - Login with default admin
   - Create new admin with strong password
   - Delete or disable default admin

3. **Configure System Settings**
   - Hospital name and logo
   - Email templates
   - Notification preferences
   - Backup schedules

### **3. SSL Certificate Setup**

**Using Let's Encrypt (Free):**
```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Auto-renewal cron job
sudo crontab -e
# Add: 0 0 1 * * certbot renew --quiet
```

### **4. Set Up Backups**

**Automated Database Backup Script:**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="hospital_management"

# Create backup
pg_dump -U postgres -h localhost $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.sql.gz s3://your-bucket/backups/
```

**Cron Job:**
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 📈 Monitoring & Maintenance

### **Application Monitoring**

**1. Error Tracking (Sentry)**
```bash
npm install @sentry/node @sentry/react
```

```javascript
// Backend (server.js)
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Frontend
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**2. Uptime Monitoring**
- Use services like UptimeRobot, Pingdom, or StatusCake
- Monitor both frontend and backend
- Set up SMS/email alerts

**3. Performance Monitoring**
```javascript
// New Relic or DataDog integration
npm install newrelic
```

### **Log Management**

**Winston Logger Configuration:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### **Database Monitoring**

```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size('hospital_management'));

-- Slow query monitoring
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### **Health Check Endpoint**

```javascript
// backend/src/routes/health.js
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🆘 Troubleshooting

### **Common Deployment Issues**

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check firewall rules

2. **Build Failures**
   - Clear build cache
   - Check Node.js version
   - Verify all dependencies installed

3. **SSL Certificate Issues**
   - Renew expired certificates
   - Check DNS configuration
   - Verify certificate paths

4. **Performance Issues**
   - Enable database connection pooling
   - Add caching layer (Redis)
   - Optimize database queries
   - Enable CDN for static assets

---

## 📞 Support

For deployment assistance:

- **Documentation**: [View Full Docs](./README.md)
- **GitHub Issues**: [Report Issue](https://github.com/vivek12coder/hms/issues)
- **Email**: vivek12coder@gmail.com

---

*Last Updated: November 2025*
