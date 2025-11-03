# 🚀 Render Backend Deployment Guide

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Supabase PostgreSQL database (already configured)

---

## 📝 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure render.yaml is configured** (already done ✅)
2. **Commit all changes** to GitHub:
```powershell
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create New Web Service on Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** → **Web Service**
3. **Connect your GitHub repository**: `vivek12coder/hms`
4. **Configure the service**:

#### Basic Settings:
- **Name**: `hms-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Singapore)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npm start`

#### Instance Type:
- **Free** (for testing) or **Starter** ($7/month for production)

### Step 3: Configure Environment Variables

Add these environment variables in Render:

```bash
# Node Configuration
NODE_ENV=production
PORT=10000

# Database (Supabase - ALREADY CONFIGURED)
DATABASE_URL=postgresql://postgres.apnaqcqdebuktyqnjokl:nftq9XoliFTTAkIe@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.apnaqcqdebuktyqnjokl:nftq9XoliFTTAkIe@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# JWT Configuration
JWT_SECRET=17455e94bb82ca5ec2baccbd1601d99c33167ec84eefae4056876efaba319cc53f5495d1f0c7882afb8483dec95c4d6fff0172b4ad92e4e6af9848f7739c3063
JWT_EXPIRES_IN=7d

# CORS - UPDATE THIS AFTER VERCEL DEPLOYMENT
CORS_ORIGIN=https://your-frontend.vercel.app

# Logging
LOG_LEVEL=info
```

#### How to Add Environment Variables:

1. In Render service settings → **Environment**
2. Click **Add Environment Variable**
3. Add each key-value pair
4. Click **Save Changes**

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Generate Prisma client
   - Start the server
3. Wait for deployment (3-5 minutes)
4. Your backend will be live at: `https://your-service.onrender.com`

---

## ⚙️ Post-Deployment Setup

### Step 1: Initialize Database (First Time Only)

Your database is already set up on Supabase, but if you need to reseed:

1. Go to Render Dashboard → Your Service → **Shell**
2. Run these commands:
```bash
npx prisma db push
node seed.js
```

### Step 2: Update CORS Origin

After deploying frontend to Vercel:

1. Go to Render → Your Service → **Environment**
2. Update `CORS_ORIGIN` with your Vercel URL:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
3. Click **Save Changes** (service will auto-redeploy)

### Step 3: Test Your API

Visit these endpoints to verify deployment:

```bash
# Health check
https://your-service.onrender.com/health

# API base
https://your-service.onrender.com/api

# Dashboard stats (requires auth)
https://your-service.onrender.com/api/dashboard/stats
```

---

## 🔒 Security Configuration

### Update CORS for Multiple Origins (if needed):

If you have multiple frontend URLs (production + staging):

1. Update `backend/src/server.js` CORS configuration
2. Or set multiple origins in environment:
```bash
CORS_ORIGIN=https://app.vercel.app,https://staging.vercel.app
```

### Secure Environment Variables:

✅ Never commit `.env` file to GitHub  
✅ Use Render's environment variables (encrypted at rest)  
✅ Rotate JWT_SECRET regularly  
✅ Use strong database passwords

---

## 📊 Monitoring & Logs

### View Logs:
1. Go to Render Dashboard → Your Service
2. Click **Logs** tab
3. See real-time application logs

### Monitor Performance:
- CPU and Memory usage in Metrics tab
- Response times
- Error rates

### Set Up Alerts:
1. Go to Service Settings → **Notifications**
2. Configure email/Slack alerts for:
   - Deploy failures
   - Service crashes
   - High resource usage

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

1. **Push to main branch** → Automatic deployment
2. **Manual deploy** → Dashboard → Manual Deploy
3. **Rollback** → Deployments tab → Previous deployment → Rollback

### Disable Auto-Deploy:
- Go to Settings → **Build & Deploy**
- Disable "Auto-Deploy"

---

## 💾 Database Management

### View Database:
```bash
# From local machine with Prisma Studio
npx prisma studio
```

### Backup Database:
Supabase provides automatic backups. To manually backup:
1. Go to Supabase Dashboard
2. Database → Backups
3. Download backup

### Run Migrations:
```bash
# In Render Shell or locally
npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### Issue: "Build Failed"
**Solution**:
- Check build logs in Render dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed
- Check Node version compatibility

### Issue: "Database Connection Failed"
**Solution**:
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check if Supabase project is active (not paused)
- Ensure connection pooling URL uses port 6543
- Test connection locally first

### Issue: "Port Already in Use"
**Solution**:
- Render automatically assigns PORT=10000
- Ensure your code uses `process.env.PORT`
- Check `backend/src/server.js` line:
  ```javascript
  const PORT = process.env.PORT || 3001;
  ```

### Issue: "CORS Errors from Frontend"
**Solution**:
- Update `CORS_ORIGIN` in Render environment variables
- Include your Vercel URL exactly as shown in browser
- Restart service after updating CORS

### Issue: "Service Crashes on Startup"
**Solution**:
- Check logs for error details
- Verify Prisma client is generated (`npx prisma generate`)
- Ensure database is accessible
- Check environment variables are set correctly

---

## 🆙 Scaling Your Backend

### Free Tier Limitations:
- ⏱️ Spins down after 15 minutes of inactivity
- 🐌 Cold start time: 30-60 seconds
- 💾 Limited resources

### Upgrade to Paid Tier:
- ✅ Always-on (no cold starts)
- ✅ More CPU and RAM
- ✅ Custom domains
- ✅ Better performance

**Pricing**: Starting at $7/month

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain:
1. Go to Service Settings → **Custom Domain**
2. Add your domain: `api.yourdomain.com`
3. Update DNS records:
   ```
   Type: CNAME
   Name: api
   Value: your-service.onrender.com
   ```
4. SSL certificate auto-generated by Render

---

## 🔐 Security Checklist

Before going live:

- ✅ All environment variables configured
- ✅ `NODE_ENV=production`
- ✅ Strong `JWT_SECRET` (64+ characters)
- ✅ CORS properly configured
- ✅ Database connection secure (SSL)
- ✅ `.env` file NOT in Git
- ✅ Rate limiting enabled
- ✅ Input validation in place
- ✅ Error messages don't expose sensitive data

---

## 📱 API Health Monitoring

### Create Health Check Endpoint:

Your backend already has a health endpoint. Test it:

```bash
curl https://your-service.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T10:30:00.000Z",
  "uptime": 12345
}
```

### Set Up External Monitoring:
- **UptimeRobot**: https://uptimerobot.com (free)
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

---

## 📞 Getting Help

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **GitHub Issues**: https://github.com/vivek12coder/hms/issues

---

## 🎉 Your Backend URLs

After deployment:

- **Production API**: `https://your-service.onrender.com/api`
- **Health Check**: `https://your-service.onrender.com/health`
- **Logs**: Render Dashboard → Logs tab

---

## 📋 Quick Command Reference

```bash
# View logs
render logs -s your-service

# SSH into service
render shell -s your-service

# Manual deploy
render deploy -s your-service

# View environment variables
render env -s your-service
```

---

**Last Updated**: November 3, 2025  
**Deployment Platform**: Render  
**Runtime**: Node.js 18+  
**Database**: Supabase PostgreSQL
