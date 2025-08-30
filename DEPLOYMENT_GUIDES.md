# 🚀 QR Scanner Trios - Free Deployment Guides

## 🎯 **Recommended: Render.com (Completely Free)**

### **Step 1: Sign Up**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. No credit card required

### **Step 2: Deploy Backend**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `qr-scanner-trios-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### **Step 3: Set Environment Variables**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://qr-scanner-trios.onrender.com
FRONTEND_URL=https://qr-scanner-trios.onrender.com
```

### **Step 4: Deploy Frontend**
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `qr-scanner-trios-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

### **Step 5: Update Frontend Environment**
In `frontend/.env`:
```
VITE_API_URL=https://qr-scanner-trios-backend.onrender.com/api
```

**🌐 Your URLs:**
- Backend: `https://qr-scanner-trios-backend.onrender.com`
- Frontend: `https://qr-scanner-trios-frontend.onrender.com`
- Health Check: `https://qr-scanner-trios-backend.onrender.com/health`

---

## 🚂 **Alternative: Railway.app (Free with $5 credit)**

### **Step 1: Sign Up**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Add payment method (required for $5 credit)

### **Step 2: Deploy**
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Railway will auto-detect and deploy

### **Step 3: Set Variables**
In Railway dashboard:
```
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-app.railway.app
FRONTEND_URL=https://your-app.railway.app
```

**🌐 Your URL**: `https://your-app.railway.app`

---

## ⚡ **Frontend Only: Vercel (Completely Free)**

### **Step 1: Deploy Frontend**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect React app

### **Step 2: Configure**
1. Set build command: `cd frontend && npm run build`
2. Set output directory: `frontend/dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

**🌐 Your URL**: `https://your-app.vercel.app`

---

## 🐳 **Alternative: Fly.io (Free after adding payment)**

### **Step 1: Add Payment Method**
1. Go to [fly.io/dashboard](https://fly.io/dashboard)
2. Add credit card (required for free tier)
3. You get 3 free VMs

### **Step 2: Deploy**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
./deploy-fly.sh
```

**🌐 Your URL**: `https://qr-scanner-trios.fly.dev`

---

## 🔧 **Quick Deployment Commands**

### **Render.com (Recommended)**
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to render.com and deploy
# 3. Your app will be live in 5 minutes
```

### **Railway.app**
```bash
# 1. Push to GitHub
git push origin main

# 2. Railway auto-deploys
# 3. Check dashboard for URL
```

### **Vercel (Frontend)**
```bash
# 1. Push to GitHub
git push origin main

# 2. Vercel auto-deploys
# 3. Get URL from dashboard
```

---

## 📊 **Platform Comparison**

| Platform | Free Tier | Credit Card | Auto-Deploy | Custom Domain |
|----------|-----------|-------------|-------------|---------------|
| **Render.com** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Railway.app | ✅ $5 credit | ✅ Required | ✅ Yes | ✅ Yes |
| Vercel | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Fly.io | ✅ 3 VMs | ✅ Required | ✅ Yes | ✅ Yes |

---

## 🎯 **Recommended Setup**

### **For Complete Free Deployment:**
1. **Backend**: Render.com
2. **Frontend**: Vercel
3. **Database**: SQLite (included)

### **For Best Performance:**
1. **Backend**: Railway.app
2. **Frontend**: Vercel
3. **Database**: Railway PostgreSQL

---

## 🔗 **Your Live URLs**

After deployment, you'll have:

- **Backend API**: `https://your-backend-url.com`
- **Frontend App**: `https://your-frontend-url.com`
- **Health Check**: `https://your-backend-url.com/health`
- **API Docs**: `https://your-backend-url.com/api`

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **Port Issues**: Ensure PORT is set correctly
2. **CORS Errors**: Update CORS_ORIGIN to your frontend URL
3. **Database Errors**: Check file permissions for SQLite
4. **Build Failures**: Check Node.js version compatibility

### **Support:**
- **Render**: [render.com/docs](https://render.com/docs)
- **Railway**: [railway.app/docs](https://railway.app/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Fly.io**: [fly.io/docs](https://fly.io/docs)
