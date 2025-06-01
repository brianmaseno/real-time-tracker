# Deployment Guide

This project contains both frontend (Next.js) and backend (Node.js/Express) in a single repository.

## Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add deployment configurations"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `realtime-tracker-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Auto-Deploy**: `Yes`

### Step 3: Set Environment Variables on Render
Add these environment variables in Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: `5001`
- `MONGODB_URI`: `your_mongodb_atlas_connection_string`
- `JWT_SECRET`: `your_secure_jwt_secret`
- `FRONTEND_URL`: `https://your-frontend-domain.vercel.app` (add after frontend deployment)

## Frontend Deployment (Vercel)

### Step 1: Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### Step 2: Set Environment Variables on Vercel
Add these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.render.com`
- `NEXT_PUBLIC_SOCKET_URL`: `https://your-backend-domain.render.com`

### Step 3: Update Backend CORS
After frontend deployment, update the `FRONTEND_URL` environment variable on Render with your Vercel domain.

## Important Notes

1. **MongoDB Atlas**: Make sure to use MongoDB Atlas (cloud) for production, not local MongoDB
2. **CORS Configuration**: Update server CORS settings with your Vercel domain
3. **Environment Variables**: Never commit `.env` files to Git
4. **SSL/HTTPS**: Both Render and Vercel provide HTTPS by default
5. **Domain Names**: 
   - Render: `https://your-app-name.onrender.com`
   - Vercel: `https://your-app-name.vercel.app`

## Post-Deployment Testing

1. Test user registration and login
2. Test real-time location updates
3. Test WebSocket connections
4. Verify all dashboard functionalities

## Troubleshooting

- Check deployment logs on both platforms
- Verify environment variables are set correctly
- Ensure MongoDB Atlas allows connections from Render's IP addresses
- Check CORS configuration if requests are failing
