# 🚀 Vercel Frontend Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Backend deployed on Render (get the URL first)

---

## 📝 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Commit all changes** to GitHub:
```powershell
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import your GitHub repository**: `vivek12coder/hms`
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### Step 3: Configure Environment Variables

In the Vercel deployment settings, add these environment variables:

#### Required Variables:

```bash
# Backend API URL (IMPORTANT: Replace with your actual Render backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com/api

# Application Configuration
NEXT_PUBLIC_HOSPITAL_NAME=City General Hospital
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=false

# Contact Information
NEXT_PUBLIC_SUPPORT_EMAIL=support@hospital.com
NEXT_PUBLIC_SUPPORT_PHONE=+1-555-0123

# Session Configuration
NEXT_PUBLIC_SESSION_TIMEOUT=1800000
NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL=840000
```

#### How to Add Environment Variables in Vercel:

1. In your Vercel project → Settings → Environment Variables
2. Add each variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-name.onrender.com/api`
   - **Environment**: Production, Preview, Development (select all)
3. Click **Save**
4. Repeat for all variables

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Your frontend will be live at: `https://your-project.vercel.app`

---

## ⚙️ Post-Deployment Configuration

### Update Backend CORS

After deployment, you need to update your backend's CORS settings:

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to Environment Variables
4. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
5. Save and redeploy

### Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Try logging in with test credentials:
   - **Admin**: admin@hospital.com / password123
   - **Doctor**: doctor@hospital.com / password123
   - **Patient**: patient@hospital.com / password123

---

## 🔧 Custom Domain (Optional)

### Add Custom Domain to Vercel:

1. Go to your Vercel project → Settings → Domains
2. Add your domain (e.g., `hms.yourdomain.com`)
3. Update DNS records as instructed by Vercel
4. Update backend `CORS_ORIGIN` to include your custom domain

---

## 🐛 Troubleshooting

### Issue: "API connection failed"
**Solution**: 
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend is running on Render
- Ensure backend CORS allows your Vercel domain

### Issue: "Environment variables not working"
**Solution**:
- Ensure all env vars start with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check Environment Variables tab in Vercel settings

### Issue: "Build failed"
**Solution**:
- Check build logs in Vercel dashboard
- Ensure `frontend/package.json` has correct scripts
- Verify all dependencies are in `package.json`

### Issue: "Page not found (404)"
**Solution**:
- Ensure Root Directory is set to `frontend`
- Check if build completed successfully
- Verify Next.js configuration is correct

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Push to main branch** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull requests** → Automatic preview deployments

To disable auto-deployment:
- Go to Settings → Git → Disable automatic deployments

---

## 📊 Monitoring & Analytics

### View Deployment Logs:
1. Go to your Vercel project
2. Click on Deployments
3. Select a deployment
4. View Function Logs

### Performance Monitoring:
- Vercel Analytics: Enable in project settings
- Real User Monitoring (RUM)
- Core Web Vitals tracking

---

## 🔐 Security Checklist

- ✅ Environment variables properly set
- ✅ `NEXT_PUBLIC_DEBUG_MODE=false` in production
- ✅ Custom domain configured with SSL
- ✅ CORS properly configured on backend
- ✅ API URL uses HTTPS

---

## 📞 Getting Help

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: https://github.com/vivek12coder/hms/issues

---

## 🎉 Your Frontend URLs

After deployment:

- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

---

**Last Updated**: November 3, 2025  
**Deployment Platform**: Vercel  
**Framework**: Next.js 15.5.3
