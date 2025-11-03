# 🔗 Supabase Database Connection Setup Guide

## 📋 Current Status

Your Supabase connection string provided:
```
postgresql://postgres:Vivek@9792@db.apnaqcqdebuktyqnjokl.supabase.co:5432/postgres
```

## ⚠️ Connection Issue

The connection is currently failing. This could be due to:
1. **Supabase project is paused/inactive**
2. **Wrong connection string format**
3. **Network/firewall restrictions**
4. **SSL configuration**

---

## ✅ Solution Steps

### Step 1: Get the Correct Connection Strings from Supabase

1. **Login to Supabase Dashboard**: https://app.supabase.com/
2. **Select your project**: `apnaqcqdebuktyqnjokl`
3. **Go to**: Settings → Database
4. **Copy Connection Strings:**

#### For Prisma, you need TWO connection strings:

**A. Connection Pooling (Transaction Mode) - for DATABASE_URL:**
```
Look for: "Connection pooling" → "Transaction" mode
Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**B. Direct Connection - for DIRECT_URL:**
```
Look for: "Direct connection" or "Session mode"
Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

### Step 2: Update Backend .env File

Replace the connection strings in `backend/.env`:

```env
# Supabase Database Connection
DATABASE_URL="[PASTE YOUR TRANSACTION MODE CONNECTION STRING HERE]"
DIRECT_URL="[PASTE YOUR DIRECT CONNECTION STRING HERE]"
```

**Important Notes:**
- Keep the password URL-encoded (@ symbol becomes %40)
- Your password: `Vivek@9792` should be encoded as: `Vivek%409792`
- Make sure to add `?pgbouncer=true` at the end of DATABASE_URL if not present

**Example Format:**
```env
DATABASE_URL="postgresql://postgres.apnaqcqdebuktyqnjokl:Vivek%409792@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.apnaqcqdebuktyqnjokl:Vivek%409792@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

---

### Step 3: Test Connection

Run these commands in order:

```powershell
# Navigate to backend
cd d:\hms\backend

# Test the connection
node test-db-connection.js

# If successful, generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed the database with initial data
npm run seed
```

---

### Step 4: Verify Database Setup

```powershell
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a GUI at `http://localhost:5555` where you can see all your tables.

---

## 🔍 Common Issues & Solutions

### Issue 1: "Can't reach database server"
**Solution:** 
- Verify your Supabase project is active (not paused)
- Check if you're using the correct region in the connection string
- Ensure your internet connection is stable

### Issue 2: "Authentication failed"
**Solution:**
- Double-check your password is URL-encoded correctly
- Verify the password in Supabase Dashboard → Settings → Database → Database Password

### Issue 3: "SSL connection required"
**Solution:**
Add `?sslmode=require` to your connection string:
```
DATABASE_URL="...postgres?pgbouncer=true&sslmode=require"
```

### Issue 4: Project Reference Mismatch
**Solution:**
Your project reference is: `apnaqcqdebuktyqnjokl`
Make sure this appears correctly in BOTH connection strings

---

## 📝 Complete .env Template

Here's your complete backend `.env` file template:

```env
# Server Configuration
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
NODE_ENV=development
PORT=3001

# Supabase Database Connection
# Transaction pooler for Prisma (port 6543)
DATABASE_URL="postgresql://postgres.apnaqcqdebuktyqnjokl:Vivek%409792@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for migrations (port 5432)
DIRECT_URL="postgresql://postgres.apnaqcqdebuktyqnjokl:Vivek%409792@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# JWT Configuration
JWT_SECRET=17455e94bb82ca5ec2baccbd1601d99c33167ec84eefae4056876efaba319cc53f5495d1f0c7882afb8483dec95c4d6fff0172b4ad92e4e6af9848f7739c3063
JWT_EXPIRES_IN=24h
```

---

## 🎯 Alternative: Reset Supabase Database Password

If nothing works, try resetting your database password:

1. **Go to**: Supabase Dashboard → Settings → Database
2. **Click**: "Reset Database Password"
3. **Copy** the new password
4. **Update** your `.env` file with the new connection strings

---

## 📞 Next Steps

1. **Verify Supabase Project Status**: Check if it's active
2. **Get Correct Connection Strings**: Follow Step 1 above
3. **Update .env File**: Replace with correct strings
4. **Test Connection**: Run `node test-db-connection.js`
5. **Setup Database**: Run `npx prisma db push`

---

## 💡 Pro Tips

- **Supabase Free Tier**: Projects pause after 1 week of inactivity
- **Connection Pooling**: Always use port 6543 for Prisma
- **Direct Connection**: Use port 5432 only for migrations
- **Password Encoding**: Special characters must be URL-encoded

---

## 🆘 Still Having Issues?

Please share:
1. The exact error message you're seeing
2. Screenshot of Supabase Database Settings page (hide password)
3. Your region (from Supabase dashboard)

I'll help you troubleshoot further!

---

**Created:** November 3, 2025  
**Project:** Hospital Management System  
**Database:** Supabase PostgreSQL
