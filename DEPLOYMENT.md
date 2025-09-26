# Deployment Guide for Hospital Management System

This guide will help you deploy the Hospital Management System with the backend on Render and the frontend on Vercel.

## Backend Deployment (Render)

### Prerequisites

1. A [Render account](https://render.com)
2. A PostgreSQL database (You can create one on Render or use any other PostgreSQL provider)

### Steps

1. **Set up a PostgreSQL database**
   - Create a PostgreSQL database on Render or your preferred provider
   - Save the connection string for the next steps

2. **Deploy the backend to Render**
   - Go to the Render Dashboard and click "New +"
   - Select "Blueprint"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file in your backend directory
   - Update the environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET`: A secure random string (Render can generate this)
     - Update `CORS_ORIGIN` with your Vercel frontend URL after deployment
   - Click "Apply"
   - Render will start the deployment process

3. **After deployment**
   - Note your Render backend URL (e.g., `https://hospital-management-system-api.onrender.com`)
   - You'll need this URL for the frontend deployment

## Frontend Deployment (Vercel)

### Prerequisites

1. A [Vercel account](https://vercel.com)

### Steps

1. **Prepare your frontend**
   - Ensure your `vercel.json` file is configured correctly
   - Update the `.env.production` file with your Render backend URL

2. **Deploy to Vercel**
   - Go to the Vercel Dashboard and click "New Project"
   - Import your GitHub repository
   - Configure your project:
     - Framework Preset: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://hospital-management-system-api.onrender.com/api`)
   - Click "Deploy"

3. **After deployment**
   - Vercel will provide you with a deployment URL
   - Test the application to ensure the frontend can communicate with the backend

## Verify the Deployment

1. Visit your Vercel deployment URL
2. Try to register a new user and log in
3. Ensure all features are working correctly

## Troubleshooting

### Common issues:

1. **CORS errors**: Ensure the `CORS_ORIGIN` in your backend deployment matches your Vercel URL
2. **Database connection issues**: Verify your DATABASE_URL is correct and the database is accessible
3. **API not found**: Confirm that your NEXT_PUBLIC_API_URL is set correctly in Vercel

### Other tips:

- Check the Render logs for backend errors
- Check the Vercel build and deployment logs for frontend errors
- Test your API endpoints using tools like Postman

## Future Updates

For future updates:

1. Push changes to your GitHub repository
2. Render and Vercel will automatically rebuild and redeploy your application

## Security Considerations

1. Ensure your JWT_SECRET is strong and kept secure
2. Consider adding rate limiting to your API
3. Set up proper database backup procedures
4. Use HTTPS for all communications