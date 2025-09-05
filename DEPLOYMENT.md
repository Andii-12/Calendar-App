# 🚀 Deployment Guide

This guide will help you deploy your Calendar & Todo App to production using MongoDB Atlas, Railway (backend), and Vercel (frontend).

## 📋 Prerequisites

- MongoDB Atlas account
- Railway account
- Vercel account
- GitHub repository (already set up)

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Choose your preferred cloud provider and region
4. Select cluster tier (M0 free tier is fine for development)

### 1.2 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Note down the username and password

### 1.3 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Add `0.0.0.0/0` to allow access from anywhere (or specific IPs for security)

### 1.4 Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `calendar-app`

**Example connection string:**
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/calendar-app?retryWrites=true&w=majority
```

## 🚂 Step 2: Railway Backend Deployment

### 2.1 Connect Railway to GitHub
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `Calendar-App` repository
6. Select the `backend` folder

### 2.2 Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calendar-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-app.vercel.app
```

**Important:** Replace the values with your actual:
- MongoDB Atlas connection string
- Strong JWT secret (generate a random string)
- Your Vercel frontend URL (you'll get this after Step 3)

### 2.3 Deploy
1. Railway will automatically detect it's a Node.js project
2. It will run `npm install` and `npm start`
3. Wait for deployment to complete
4. Note down your Railway backend URL (e.g., `https://your-app.railway.app`)

### 2.4 Test Backend
Visit: `https://your-backend-url.railway.app/api/health`
You should see: `{"status":"OK","timestamp":"...","environment":"production"}`

## ⚡ Step 3: Vercel Frontend Deployment

### 3.1 Connect Vercel to GitHub
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `Calendar-App` repository
5. Set the root directory to `frontend`

### 3.2 Configure Build Settings
- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `out`

### 3.3 Configure Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

**Important:** Replace with your actual Railway backend URL from Step 2.

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note down your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

### 3.5 Update Backend CORS
Go back to Railway and update the `CORS_ORIGIN` variable with your Vercel URL:
```env
CORS_ORIGIN=https://your-frontend-app.vercel.app
```

## 🔧 Step 4: Final Configuration

### 4.1 Test Full Application
1. Visit your Vercel frontend URL
2. Try registering a new account
3. Create some events and todo lists
4. Test the PWA installation

### 4.2 Test Magic Mirror API
Visit: `https://your-backend-url.railway.app/api/magic-mirror/future-data`

### 4.3 Update Magic Mirror Configuration
In your Magic Mirror module, update the API URL:
```javascript
const options = {
  hostname: 'your-backend-url.railway.app',
  port: 443,
  path: '/api/magic-mirror/future-data',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};
```

## 🔒 Step 5: Security Considerations

### 5.1 Environment Variables
- Never commit `.env` files to Git
- Use strong, unique JWT secrets
- Regularly rotate secrets

### 5.2 MongoDB Atlas Security
- Use strong passwords
- Enable IP whitelisting for production
- Enable MongoDB Atlas authentication

### 5.3 CORS Configuration
- Only allow your Vercel domain in CORS_ORIGIN
- Don't use wildcard (*) in production

## 📱 Step 6: PWA Configuration

### 6.1 Update Manifest
Update `frontend/public/manifest.json` with your production URLs:
```json
{
  "start_url": "https://your-app.vercel.app/",
  "scope": "https://your-app.vercel.app/"
}
```

### 6.2 Update Service Worker
The service worker will automatically work with your production URLs.

## 🚀 Step 7: Custom Domain (Optional)

### 7.1 Vercel Custom Domain
1. Go to Vercel dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 7.2 Railway Custom Domain
1. Go to Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 🔍 Troubleshooting

### Common Issues:

#### Backend not connecting to MongoDB
- Check MongoDB Atlas connection string
- Verify network access settings
- Check if database user has correct permissions

#### CORS errors
- Verify CORS_ORIGIN in Railway matches your Vercel URL
- Check if frontend is making requests to correct backend URL

#### Frontend not loading
- Check if NEXT_PUBLIC_API_URL is set correctly
- Verify backend is running and accessible
- Check browser console for errors

#### PWA not working
- Ensure HTTPS is enabled (Vercel provides this automatically)
- Check if manifest.json is accessible
- Verify service worker is registered

## 📊 Monitoring

### Railway Monitoring
- Check Railway dashboard for logs
- Monitor resource usage
- Set up alerts for downtime

### Vercel Monitoring
- Check Vercel dashboard for analytics
- Monitor build logs
- Check function logs

### MongoDB Atlas Monitoring
- Monitor database performance
- Check connection metrics
- Set up alerts for unusual activity

## 🎉 Success!

Your Calendar & Todo App is now deployed to production! 

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app
- **Database:** MongoDB Atlas
- **PWA:** Installable on mobile and desktop
- **Magic Mirror:** Ready for integration

## 📞 Support

If you encounter any issues:
1. Check the logs in Railway and Vercel dashboards
2. Verify all environment variables are set correctly
3. Test the API endpoints directly
4. Check browser console for frontend errors

Happy coding! 🚀
