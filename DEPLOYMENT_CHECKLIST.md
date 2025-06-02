# Deployment Checklist

## Pre-Deployment ✅
- [x] Code pushed to GitHub repository
- [x] Build working locally (`npm run build`)
- [x] SSR compatibility issues resolved
- [x] Socket.IO configuration updated for production
- [x] Environment variables documented

## MongoDB Atlas Setup 📦
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with proper permissions
- [ ] Connection string obtained
- [ ] IP whitelist configured (0.0.0.0/0 for Render)
- [ ] Test connection from local environment

## Backend Deployment (Render) 🚀
- [ ] Render account created/logged in
- [ ] New Web Service created
- [ ] GitHub repository connected
- [ ] Build and start commands configured
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `MONGODB_URI=<atlas_connection_string>`
  - [ ] `JWT_SECRET=<strong_secret_key>`
  - [ ] `FRONTEND_URL=<will_update_after_frontend>`
- [ ] First deployment successful
- [ ] Health check endpoint responding
- [ ] Backend URL noted: `https://realtime-tracker-backend.onrender.com`

## Frontend Deployment (Vercel) 🌐
- [ ] Vercel account created/logged in
- [ ] New Project created
- [ ] GitHub repository imported
- [ ] Next.js framework auto-detected
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_API_URL=<render_backend_url>`
  - [ ] `NEXT_PUBLIC_SOCKET_URL=<render_backend_url>`
- [ ] First deployment successful
- [ ] Frontend URL noted: `https://realtime-tracker-frontend.vercel.app`

## Post-Deployment Configuration 🔧
- [ ] Update Render `FRONTEND_URL` with Vercel domain
- [ ] Verify CORS configuration working
- [ ] Test basic API endpoints
- [ ] Test Socket.IO real-time connections

## Testing & Verification ✔️
- [ ] User registration working
- [ ] User login working
- [ ] Place order functionality working
- [ ] Real-time tracking updates working
- [ ] Vendor dashboard functioning
- [ ] Delivery dashboard functioning
- [ ] Mobile responsiveness verified

## Production Monitoring 📊
- [ ] Render logs accessible and clean
- [ ] Vercel logs accessible and clean
- [ ] MongoDB Atlas monitoring set up
- [ ] Error tracking configured (optional)
- [ ] Performance monitoring set up (optional)

## Security Review 🔒
- [ ] JWT secret is strong and unique
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Database connection secure
- [ ] API endpoints protected where necessary

## Documentation 📝
- [ ] README updated with live URLs
- [ ] Environment setup documented
- [ ] Deployment process documented
- [ ] Architecture diagram updated (if exists)

---

## Quick Reference URLs

**Development:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

**Production:**
- Frontend: https://realtime-tracker-frontend.vercel.app (update after deployment)
- Backend: https://realtime-tracker-backend.onrender.com (update after deployment)
- Database: MongoDB Atlas cluster

**Admin Dashboards:**
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com

## Environment Variables Quick Copy

### Render Backend:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/real-time-tracker
JWT_SECRET=your-super-secure-32-character-secret-key
FRONTEND_URL=https://realtime-tracker-frontend.vercel.app
```

### Vercel Frontend:
```
NEXT_PUBLIC_API_URL=https://realtime-tracker-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://realtime-tracker-backend.onrender.com
```
