# 🚀 Production Deployment Checklist

## Pre-Deployment Checklist

### 📝 Backend Preparation (Render)

- [ ] **Code Review**
  - [ ] All console.logs removed or using proper logger
  - [ ] Error handling in place for all routes
  - [ ] Input validation on all endpoints
  - [ ] Rate limiting configured
  - [ ] RBAC properly implemented

- [ ] **Security**
  - [ ] `.env` file NOT in Git (check `.gitignore`)
  - [ ] Strong JWT_SECRET generated (64+ characters)
  - [ ] Database connection uses SSL
  - [ ] Sensitive data encrypted
  - [ ] CORS properly configured
  - [ ] Security headers configured

- [ ] **Database (Supabase)**
  - [ ] Database schema finalized
  - [ ] All migrations run successfully
  - [ ] Database seeded with initial data
  - [ ] Backup strategy in place
  - [ ] Connection pooling configured

- [ ] **Environment Variables**
  - [ ] All required env vars documented
  - [ ] Production values ready (not development values)
  - [ ] No hardcoded secrets in code

- [ ] **Dependencies**
  - [ ] `package.json` has all required dependencies
  - [ ] No dev dependencies in production
  - [ ] Node version specified in `package.json`

### 🎨 Frontend Preparation (Vercel)

- [ ] **Configuration**
  - [ ] Environment variables documented
  - [ ] API URL points to production backend
  - [ ] Debug mode disabled in production
  - [ ] Analytics configured (if needed)

- [ ] **Build Verification**
  - [ ] `npm run build` runs successfully locally
  - [ ] No TypeScript errors
  - [ ] No ESLint errors
  - [ ] All pages load correctly

- [ ] **Performance**
  - [ ] Images optimized
  - [ ] Unused imports removed
  - [ ] Code splitting implemented
  - [ ] Lazy loading where appropriate

- [ ] **SEO & Meta**
  - [ ] Meta tags configured
  - [ ] Favicon set
  - [ ] robots.txt configured
  - [ ] sitemap.xml generated

---

## Deployment Steps

### Step 1: Backend Deployment (Render)

- [ ] **Create Render Account**
  - [ ] Sign up at https://render.com
  - [ ] Verify email

- [ ] **Deploy Backend**
  - [ ] Create new Web Service
  - [ ] Connect GitHub repository
  - [ ] Set root directory to `backend`
  - [ ] Configure build command: `npm install && npx prisma generate`
  - [ ] Configure start command: `npm start`

- [ ] **Configure Environment Variables**
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DATABASE_URL` (from Supabase)
  - [ ] `DIRECT_URL` (from Supabase)
  - [ ] `JWT_SECRET` (generated)
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `CORS_ORIGIN` (will update after frontend deploy)
  - [ ] `LOG_LEVEL=info`

- [ ] **Initial Deployment**
  - [ ] Click "Create Web Service"
  - [ ] Wait for build to complete
  - [ ] Check logs for errors

- [ ] **Test Backend**
  - [ ] Visit health endpoint: `https://your-service.onrender.com/health`
  - [ ] Test API endpoints with Postman/curl
  - [ ] Verify database connection

- [ ] **Note Backend URL** 📝
  ```
  Backend URL: https://_________________________.onrender.com
  ```

### Step 2: Frontend Deployment (Vercel)

- [ ] **Create Vercel Account**
  - [ ] Sign up at https://vercel.com
  - [ ] Connect GitHub account

- [ ] **Deploy Frontend**
  - [ ] Import GitHub repository
  - [ ] Set framework preset: Next.js
  - [ ] Set root directory: `frontend`
  - [ ] Keep default build settings

- [ ] **Configure Environment Variables**
  - [ ] `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api` ⚠️ Use actual URL
  - [ ] `NEXT_PUBLIC_HOSPITAL_NAME=City General Hospital`
  - [ ] `NEXT_PUBLIC_APP_ENV=production`
  - [ ] `NEXT_PUBLIC_DEBUG_MODE=false`
  - [ ] `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
  - [ ] `NEXT_PUBLIC_SUPPORT_EMAIL=support@hospital.com`
  - [ ] `NEXT_PUBLIC_SUPPORT_PHONE=+1-555-0123`
  - [ ] `NEXT_PUBLIC_SESSION_TIMEOUT=1800000`
  - [ ] `NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL=840000`

- [ ] **Deploy**
  - [ ] Click "Deploy"
  - [ ] Wait for build (2-5 minutes)
  - [ ] Check for build errors

- [ ] **Note Frontend URL** 📝
  ```
  Frontend URL: https://_________________________.vercel.app
  ```

### Step 3: Update CORS Configuration

- [ ] **Update Backend CORS**
  - [ ] Go to Render → Your Service → Environment
  - [ ] Update `CORS_ORIGIN` with Vercel URL
  - [ ] Save changes (auto-redeploys)

---

## Post-Deployment Testing

### 🧪 Backend Tests

- [ ] **Health Check**
  ```bash
  curl https://your-backend.onrender.com/health
  ```

- [ ] **Authentication**
  - [ ] Login endpoint works
  - [ ] JWT tokens generated correctly
  - [ ] Token expiration works

- [ ] **API Endpoints**
  - [ ] `/api/dashboard/stats` (with auth)
  - [ ] `/api/patients` (with auth)
  - [ ] `/api/doctors` (with auth)
  - [ ] `/api/appointments` (with auth)
  - [ ] `/api/billing` (with auth)

### 🎨 Frontend Tests

- [ ] **Page Loading**
  - [ ] Login page loads
  - [ ] Dashboard loads after login
  - [ ] All routes accessible

- [ ] **Authentication Flow**
  - [ ] Can login with test credentials
  - [ ] Token stored correctly
  - [ ] Redirects work properly
  - [ ] Logout works

- [ ] **Role-Based Access**
  - [ ] Admin sees all features
  - [ ] Doctor sees limited features
  - [ ] Patient sees only own data

- [ ] **Core Features**
  - [ ] Dashboard displays data
  - [ ] Can view patients/doctors
  - [ ] Can create appointments
  - [ ] Can view billing
  - [ ] Search works
  - [ ] Filters work

### 🔐 Security Tests

- [ ] **CORS**
  - [ ] Frontend can call backend
  - [ ] Other domains blocked

- [ ] **Authentication**
  - [ ] Cannot access protected routes without login
  - [ ] Token expiration works
  - [ ] Unauthorized access blocked

- [ ] **Authorization (RBAC)**
  - [ ] Patients cannot access admin features
  - [ ] Doctors cannot delete users
  - [ ] Admins have full access

---

## Performance Optimization

### Backend (Render)

- [ ] **Monitoring Setup**
  - [ ] Check response times in Render metrics
  - [ ] Monitor memory usage
  - [ ] Set up error alerts

- [ ] **Optimization**
  - [ ] Database queries optimized
  - [ ] Response caching where appropriate
  - [ ] Connection pooling configured

### Frontend (Vercel)

- [ ] **Analytics**
  - [ ] Vercel Analytics enabled
  - [ ] Core Web Vitals monitored

- [ ] **Performance**
  - [ ] Lighthouse score > 90
  - [ ] Images optimized
  - [ ] Initial load time < 3s

---

## Going Live Checklist

### 🌐 DNS & Domains (Optional)

- [ ] **Custom Domain Setup**
  - [ ] Purchase domain (if needed)
  - [ ] Add to Vercel: `www.yourdomain.com`
  - [ ] Add to Render: `api.yourdomain.com`
  - [ ] Configure DNS records
  - [ ] Wait for SSL certificates
  - [ ] Update CORS_ORIGIN with custom domain

### 📱 Monitoring & Alerts

- [ ] **Set Up Monitoring**
  - [ ] UptimeRobot for backend health checks
  - [ ] Vercel Analytics for frontend
  - [ ] Error tracking (Sentry, optional)
  - [ ] Email alerts for downtime

### 📊 Analytics & Logging

- [ ] **Backend Logging**
  - [ ] Logs visible in Render dashboard
  - [ ] Error logging working
  - [ ] Audit trail configured

- [ ] **Frontend Analytics**
  - [ ] Page views tracked
  - [ ] User interactions logged
  - [ ] Error tracking configured

### 📧 Communication

- [ ] **User Notification**
  - [ ] Update support email
  - [ ] Update contact information
  - [ ] Add status page link

### 💾 Backup & Recovery

- [ ] **Database Backups**
  - [ ] Supabase automatic backups enabled
  - [ ] Manual backup procedure documented
  - [ ] Recovery procedure tested

- [ ] **Code Backups**
  - [ ] Code in Git (multiple copies)
  - [ ] Tags for releases
  - [ ] Rollback procedure documented

---

## Launch Day! 🎉

- [ ] **Final Checks**
  - [ ] All tests passing ✅
  - [ ] All features working ✅
  - [ ] Performance acceptable ✅
  - [ ] Security verified ✅

- [ ] **Go Live**
  - [ ] Share URL with users
  - [ ] Monitor logs closely
  - [ ] Be ready for quick fixes

- [ ] **Documentation**
  - [ ] User guide ready
  - [ ] API documentation available
  - [ ] Support procedures in place

---

## Post-Launch

### Week 1

- [ ] Monitor error rates daily
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Fix critical issues immediately

### Week 2-4

- [ ] Review analytics
- [ ] Optimize slow queries
- [ ] Implement user feedback
- [ ] Plan feature updates

### Ongoing

- [ ] Regular security updates
- [ ] Dependency updates monthly
- [ ] Performance reviews quarterly
- [ ] User satisfaction surveys

---

## Emergency Contacts

```
Developer: [Your Name]
Email: vivek12coder@gmail.com
GitHub: https://github.com/vivek12coder/hms

Hosting Support:
- Vercel: https://vercel.com/support
- Render: https://render.com/support
- Supabase: https://supabase.com/support
```

---

## Rollback Procedure

If deployment fails:

### Backend (Render):
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Rollback to this version"

### Frontend (Vercel):
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

**Deployment Date**: ________________  
**Deployed By**: ________________  
**Backend URL**: ________________  
**Frontend URL**: ________________  

---

✅ **All checks complete? You're ready to deploy!** 🚀
