# 🚀 Production Deployment Guide for orderkaro.co.in

## 📋 **What to Change for Production Deployment**

### **1. Backend Environment Configuration**

#### **Current Development (.env.local):**
```env
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

#### **Production Configuration (.env.production):**
```env
FRONTEND_URL=https://orderkaro.co.in
CORS_ORIGIN=https://orderkaro.co.in
NODE_ENV=production
```

### **2. Frontend Environment Configuration**

#### **Current Development (frontend/.env.local):**
```env
VITE_API_URL=http://localhost:5001/api
```

#### **Production Configuration (frontend/.env.production):**
```env
VITE_API_URL=https://orderkaro.co.in/api
```

### **3. Mobile App Configuration**

#### **Current Development (mobile-app/src/services/api.js):**
```javascript
const BASE_URL = 'http://localhost:5001/api';
```

#### **Production Configuration:**
```javascript
const BASE_URL = 'https://orderkaro.co.in/api';
```

## 🔧 **Step-by-Step Production Deployment**

### **Step 1: Update Backend for Production**

1. **Create production environment file:**
```bash
# On your production server
cd /home/ubuntu/CAFE_ORDERING/backend
cp .env.local .env.production
```

2. **Update production environment variables:**
```env
# Database Configuration
USE_SQLITE=true
DB_HOST=localhost
DB_USER=postgres
DB_PASS=password
DB_NAME=qr_ordering_db
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30d

# Server Configuration
PORT=5001
NODE_ENV=production

# CORS Configuration - PRODUCTION DOMAIN
CORS_ORIGIN=https://orderkaro.co.in
FRONTEND_URL=https://orderkaro.co.in

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Database Sync (set to false to preserve data)
FORCE_SYNC=false
```

3. **Activate production environment:**
```bash
# On production server
cp .env.production .env
pm2 restart cafe-backend
```

### **Step 2: Update Frontend for Production**

1. **Create production environment file:**
```bash
# On your production server
cd /home/ubuntu/CAFE_ORDERING/frontend
cp .env.local .env.production
```

2. **Update production environment variables:**
```env
VITE_API_URL=https://orderkaro.co.in/api
VITE_FRONTEND_URL=https://orderkaro.co.in
```

3. **Build frontend for production:**
```bash
# On production server
cd /home/ubuntu/CAFE_ORDERING/frontend
npm run build
```

### **Step 3: Update Mobile App for Production**

1. **Update API configuration:**
```javascript
// mobile-app/src/services/api.js
const BASE_URL = 'https://orderkaro.co.in/api';
```

2. **Update environment configuration:**
```javascript
// mobile-app/src/config/environment.js
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:5001/api',
    FRONTEND_URL: 'http://localhost:5173',
  },
  production: {
    API_BASE_URL: 'https://orderkaro.co.in/api',
    FRONTEND_URL: 'https://orderkaro.co.in',
  },
};
```

3. **Build mobile app for production:**
```bash
# For Android
eas build --platform android

# For iOS
eas build --platform ios
```

### **Step 4: Update Nginx Configuration**

1. **Update Nginx configuration:**
```nginx
# /etc/nginx/sites-available/orderkaro.co.in
server {
    server_name orderkaro.co.in www.orderkaro.co.in;
    root /home/ubuntu/CAFE_ORDERING/frontend/dist;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    error_page 404 /index.html;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/orderkaro.co.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orderkaro.co.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

2. **Restart Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 **QR Code URL Changes**

### **Development QR Codes:**
```
🌐 Cafe QR: http://localhost:5173/menu/{cafe_id}
🌐 Table QR: http://localhost:5173/menu/{cafe_id}?table={table_number}
```

### **Production QR Codes:**
```
🌐 Cafe QR: https://orderkaro.co.in/menu/{cafe_id}
🌐 Table QR: https://orderkaro.co.in/menu/{cafe_id}?table={table_number}
```

## 📱 **Mobile App QR Code Scanning**

The mobile app will automatically handle both development and production QR codes:

1. **Development QR codes** → Connect to `localhost:5001/api`
2. **Production QR codes** → Connect to `orderkaro.co.in/api`

## 🚀 **Deployment Checklist**

### **Backend Changes:**
- [ ] Update `FRONTEND_URL` to `https://orderkaro.co.in`
- [ ] Update `CORS_ORIGIN` to `https://orderkaro.co.in`
- [ ] Set `NODE_ENV=production`
- [ ] Update JWT secret for production
- [ ] Restart PM2 process

### **Frontend Changes:**
- [ ] Update `VITE_API_URL` to `https://orderkaro.co.in/api`
- [ ] Build production bundle
- [ ] Update Nginx configuration
- [ ] Restart Nginx

### **Mobile App Changes:**
- [ ] Update API base URL to `https://orderkaro.co.in/api`
- [ ] Build production APK/IPA
- [ ] Test QR code scanning

### **Infrastructure Changes:**
- [ ] SSL certificate configured
- [ ] Domain DNS pointing to server
- [ ] Firewall rules configured
- [ ] PM2 process manager running
- [ ] Nginx reverse proxy configured

## 🔍 **Testing Production Deployment**

1. **Test Backend API:**
```bash
curl https://orderkaro.co.in/api/health
```

2. **Test Frontend:**
```bash
# Open in browser
https://orderkaro.co.in
```

3. **Test Mobile App:**
```bash
# Scan QR codes generated by production system
# Verify API calls go to orderkaro.co.in
```

## 🎯 **Result After Deployment**

- ✅ **QR codes generate** with `https://orderkaro.co.in` URLs
- ✅ **Web app works** at `https://orderkaro.co.in`
- ✅ **Mobile app connects** to `https://orderkaro.co.in/api`
- ✅ **SSL certificates** properly configured
- ✅ **Production environment** fully functional

Your QR Scanner Trios application will be fully deployed and accessible at `https://orderkaro.co.in`! 🎉
