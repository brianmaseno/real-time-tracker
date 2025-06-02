# Deployment Guide - Real-Time Location Tracker

This project contains both frontend (Next.js) and backend (Node.js/Express) in a single repository.

## Prerequisites

1. **MongoDB Atlas Database**: Set up at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **GitHub Repository**: Code must be pushed to GitHub
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Backend Deployment (Render)

### Step 1: Prepare MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Create a database user with read/write access
3. Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/real-time-tracker`)
4. Whitelist `0.0.0.0/0` for Render's IP addresses (or use specific IPs)

### Step 2: Deploy Backend on Render
1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `brianmaseno/real-time-tracker`
4. Configure the service:
   - **Name**: `realtime-tracker-backend`
   - **Environment**: `Node`
   - **Root Directory**: Leave empty (monorepo setup)
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `node server/index.js`
   - **Auto-Deploy**: `Yes`

### Step 3: Set Environment Variables on Render
Add these environment variables in the Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render's default)
- `MONGODB_URI`: `your_mongodb_atlas_connection_string` (from Step 1)
- `JWT_SECRET`: `generate-a-strong-32-character-secret-key`
- `FRONTEND_URL`: `https://realtime-tracker-frontend.vercel.app` (update after frontend deployment)

### Step 4: Note Your Backend URL
After deployment, your backend will be available at:
`https://realtime-tracker-backend.onrender.com`

## Frontend Deployment (Vercel)

### Step 1: Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `brianmaseno/real-time-tracker`
4. Configure the project:
   - **Project Name**: `realtime-tracker-frontend`
   - **Framework Preset**: `Next.js` (auto-detected)
   - **Root Directory**: Leave as `.` (default)

### Step 2: Set Environment Variables on Vercel
Add these environment variables in the Vercel dashboard (Settings → Environment Variables):
- `NEXT_PUBLIC_API_URL`: `https://realtime-tracker-backend.onrender.com`
- `NEXT_PUBLIC_SOCKET_URL`: `https://realtime-tracker-backend.onrender.com`

### Step 3: Update Backend CORS Settings
After frontend deployment, update the `FRONTEND_URL` environment variable on Render with your Vercel domain:
`https://realtime-tracker-frontend.vercel.app`

## Post-Deployment Configuration

### 1. Update Environment Variables
- **Render (Backend)**: Update `FRONTEND_URL` with your Vercel domain
- **Vercel (Frontend)**: Verify API and Socket URLs point to your Render backend

### 2. Test the Application
1. Visit your Vercel frontend URL
2. Test user registration and login
3. Test placing an order
4. Test real-time tracking functionality
5. Verify vendor and delivery dashboards work

### 3. Monitor and Debug
- **Render Logs**: Check backend logs in Render dashboard
- **Vercel Logs**: Check frontend logs in Vercel dashboard
- **MongoDB Atlas**: Monitor database connections and queries

## Important Notes

### CORS Configuration
The backend is configured to accept requests from your frontend domain. Make sure the `FRONTEND_URL` environment variable on Render matches your Vercel domain exactly.

### Socket.IO Configuration
The application uses Socket.IO for real-time updates. Both the API and Socket connections use the same backend URL.

### Database Considerations
- MongoDB Atlas free tier has connection limits
- Consider upgrading for production use
- Set up proper database indexes for better performance

### Security
- Use strong JWT secrets (32+ characters)
- Keep environment variables secure
- Consider implementing rate limiting for production

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

### Runtime Issues
- Verify environment variables are set correctly
- Check MongoDB connection string format
- Ensure CORS is properly configured

### Real-time Features Not Working
- Verify Socket.IO URLs are correct
- Check network connectivity
- Ensure both frontend and backend are deployed and running

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Frontend URL | http://localhost:3000 | https://your-app.vercel.app |
| Backend URL | http://localhost:5001 | https://your-app.onrender.com |
| Database | Local MongoDB | MongoDB Atlas |
| Environment | development | production |

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
