# Quick Start - Render Deployment

Get your QR Scanner Trios app deployed on Render in under 10 minutes!

## 🚀 One-Click Deployment

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```bash
   ./setup-render-deployment.sh
   ```

2. **Follow the prompts and push to GitHub**

3. **Deploy on Render:**
   - Go to [https://render.com](https://render.com)
   - Sign up with GitHub
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render handles everything else!

### Option 2: Manual Setup

1. **Prepare your code:**
   ```bash
   # Install dependencies
   cd backend && npm ci --only=production && cd ..
   cd frontend && npm ci && npm run build && cd ..
   
   # Commit changes
   git add .
   git commit -m "Ready for Render"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [https://render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically configure:
     - Backend API (Node.js)
     - Frontend (Static Site)
     - PostgreSQL Database

## 🌐 Your App URLs

After deployment, your app will be available at:

- **Frontend**: `https://qr-scanner-trios-frontend.onrender.com`
- **Backend API**: `https://qr-scanner-trios-backend.onrender.com`
- **Health Check**: `https://qr-scanner-trios-backend.onrender.com/health`

## 🔑 Demo Login

Use these credentials to test your deployed app:

- **Email**: `demo@cafe.com`
- **Password**: `password`

## 📋 What Gets Deployed

✅ **Backend API** - Node.js/Express server  
✅ **Frontend** - React app with Vite  
✅ **Database** - PostgreSQL with automatic setup  
✅ **Environment Variables** - Auto-configured  
✅ **HTTPS** - Automatic SSL certificates  
✅ **Health Checks** - Built-in monitoring  

## 🛠️ Troubleshooting

### Build Fails?
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Issues?
- Check environment variables are set correctly
- Verify database service is running
- Check backend logs for connection errors

### CORS Errors?
- Verify `CORS_ORIGIN` points to your frontend URL
- Check that both services are deployed
- Restart services after environment variable changes

## 📚 Need Help?

- **Detailed Guide**: See `DEPLOYMENT_GUIDE.md`
- **Render Docs**: [https://render.com/docs](https://render.com/docs)
- **Project Issues**: Create an issue in your repository

## 🎯 Next Steps

1. **Custom Domain** - Add your own domain name
2. **Monitoring** - Set up performance alerts
3. **Backups** - Configure database backups
4. **Scaling** - Upgrade plans when needed

---

**Happy Deploying! 🚀**
