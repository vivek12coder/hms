# 🚀 Quick Deployment Guide - Vercel + Render

## TL;DR - Deploy in 15 Minutes

### 1️⃣ Deploy Backend to Render (5 mins)

```bash
# Commit your code
git add .
git commit -m "Ready for deployment"
git push origin main
```

1. Go to https://render.com/new/web-service
2. Connect GitHub repo: `vivek12coder/hms`
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Add Environment Variables (copy from backend/.env.production.template):
   - `NODE_ENV=production`
   - `PORT=10000`
   - `DATABASE_URL` (your Supabase URL)
   - `DIRECT_URL` (your Supabase URL)
   - `JWT_SECRET` (your secret)
   - `JWT_EXPIRES_IN=7d`
   - `CORS_ORIGIN=*` (temporary, will update)
   - `LOG_LEVEL=info`
5. Click **Create Web Service**
6. **Save your backend URL**: `https://______.onrender.com` 📝

### 2️⃣ Deploy Frontend to Vercel (5 mins)

1. Go to https://vercel.com/new
2. Import GitHub repo: `vivek12coder/hms`
3. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com/api` ⚠️
   - `NEXT_PUBLIC_HOSPITAL_NAME=City General Hospital`
   - `NEXT_PUBLIC_APP_ENV=production`
   - `NEXT_PUBLIC_DEBUG_MODE=false`
5. Click **Deploy**
6. **Save your frontend URL**: `https://______.vercel.app` 📝

### 3️⃣ Update CORS (2 mins)

1. Go to Render → Your Backend Service → Environment
2. Update `CORS_ORIGIN=https://YOUR-FRONTEND.vercel.app`
3. Save (auto-redeploys)

### 4️⃣ Test (3 mins)

1. Visit your Vercel URL
2. Login with:
   - **Admin**: admin@hospital.com / password123
   - **Doctor**: doctor@hospital.com / password123
   - **Patient**: patient@hospital.com / password123
3. Check dashboard loads ✅

---

## 📋 Environment Variables Quick Reference

### Backend (Render)
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.apnaqcqdebuktyqnjokl:nftq9XoliFTTAkIe@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.apnaqcqdebuktyqnjokl:nftq9XoliFTTAkIe@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
JWT_SECRET=17455e94bb82ca5ec2baccbd1601d99c33167ec84eefae4056876efaba319cc53f5495d1f0c7882afb8483dec95c4d6fff0172b4ad92e4e6af9848f7739c3063
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
LOG_LEVEL=info
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_HOSPITAL_NAME=City General Hospital
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
```

---

## 🔗 Important Links

- **Detailed Backend Guide**: [RENDER-DEPLOYMENT.md](./RENDER-DEPLOYMENT.md)
- **Detailed Frontend Guide**: [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)
- **Complete Checklist**: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

---

## ⚠️ Common Issues

**Backend not responding?**
- Check if service is running in Render dashboard
- Free tier spins down after 15 mins (cold start ~30s)
- Check logs for errors

**CORS errors?**
- Verify CORS_ORIGIN matches your Vercel URL exactly
- No trailing slash in URLs
- Redeploy backend after changing CORS

**Frontend can't connect to backend?**
- Check NEXT_PUBLIC_API_URL is correct
- Must include `/api` at the end
- Use HTTPS (not HTTP)

---

## 🎉 You're Live!

Once deployed:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-service.onrender.com/api`

**Default Login Credentials**:
- Admin: admin@hospital.com / password123
- Doctor: doctor@hospital.com / password123
- Patient: patient@hospital.com / password123

⚠️ **Change these in production!**

---

Need help? Check the detailed guides or open an issue on GitHub!
