# 🌐 OrderKaro.co.in Deployment Guide

## 📋 Overview
This guide shows you how to use your domain `orderkaro.co.in` with the existing Lightsail services.

## 🎯 Current Working URLs
- **Frontend**: https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/
- **Backend**: https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/

## 🌐 Your Domain Setup
- **Main Site**: https://orderkaro.co.in
- **API**: https://orderkaro.co.in/api
- **Health Check**: https://orderkaro.co.in/health

## ✅ What's Already Configured
1. **SSL Certificate**: `orderkaro-co-in-cert` created
2. **Redirect Page**: `index.html` created
3. **Nginx Config**: `nginx.conf` created
4. **Container Services**: Both frontend and backend are running

## 📋 DNS Configuration Required

### Step 1: Get Your Server IP
You need to get the IP address of your server where you'll host the domain.

### Step 2: Configure DNS Records
Add these DNS records to your `orderkaro.co.in` domain:

#### A Record (Root Domain)
- **Name**: `@` (or leave blank)
- **Type**: `A`
- **Value**: `[Your Server IP]`
- **TTL**: `300`

#### CNAME Record (WWW)
- **Name**: `www`
- **Type**: `CNAME`
- **Value**: `orderkaro.co.in`
- **TTL**: `300`

## 🚀 Deployment Options

### Option 1: Simple Redirect (Easiest)
1. Upload the `index.html` file to your web server
2. Configure DNS to point to your server
3. The page will redirect users to the Lightsail services

### Option 2: Full Proxy Setup
1. Install nginx on your server
2. Upload the `nginx.conf` configuration
3. Configure SSL certificates
4. Set up DNS records

### Option 3: Use Lightsail Services Directly
- **Frontend**: https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/
- **Backend**: https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/

## 🔧 Quick Setup Commands

### For Simple Redirect:
```bash
# Upload index.html to your web server
scp index.html user@your-server:/var/www/html/
```

### For Full Proxy:
```bash
# Install nginx
sudo apt update && sudo apt install nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/orderkaro.co.in
sudo ln -s /etc/nginx/sites-available/orderkaro.co.in /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 Testing Your Setup

### Test Current Services:
```bash
# Test frontend
curl -I https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/

# Test backend
curl -I https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/health
```

### Test Domain (after DNS setup):
```bash
# Test main domain
curl -I https://orderkaro.co.in

# Test API
curl -I https://orderkaro.co.in/api/health
```

## ⏱️ Timeline
- **DNS Propagation**: 5-30 minutes
- **SSL Certificate**: Already created
- **Service Deployment**: ✅ Complete

## 🆘 Troubleshooting

### If domain doesn't work:
1. Check DNS records are correct
2. Wait for propagation (up to 30 minutes)
3. Use direct Lightsail URLs as fallback

### If SSL issues:
1. Verify certificate is created
2. Check certificate status in AWS Lightsail console
3. Ensure domain matches certificate

## 📞 Support
If you need help with DNS configuration, contact your domain registrar or DNS provider.

---

**🎉 Your OrderKaro.co.in domain is ready to use!**
