# 🌐 OrderKaro.co.in Complete Setup Guide

## 📋 Overview
This guide shows you how to set up your domain `orderkaro.co.in` to work with both frontend and backend services.

## 🎯 Target URLs
- **Frontend**: https://orderkaro.co.in
- **Backend API**: https://orderkaro.co.in/api
- **Health Check**: https://orderkaro.co.in/health

## ✅ What's Been Configured

### 1. Frontend Configuration
- **API URL**: Updated to use `https://orderkaro.co.in/api`
- **Environment**: Production-ready configuration
- **CORS**: Configured for your domain

### 2. Backend Configuration
- **CORS Origin**: `https://orderkaro.co.in`
- **Frontend URL**: `https://orderkaro.co.in`
- **Environment**: Production configuration
- **Database**: SQLite for simplicity

### 3. GitHub Actions Pipeline
- **Environment Variables**: Configured for your domain
- **Deployment**: Automated deployment to Lightsail
- **SSL**: Certificate created for your domain

## 🚀 Deployment Options

### Option 1: Use Lightsail Services Directly (Recommended)
Your services are already deployed and working:
- **Frontend**: https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/
- **Backend**: https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/

### Option 2: Set Up Domain Proxy
1. **Get a server** with your domain `orderkaro.co.in`
2. **Install nginx** and configure proxy
3. **Set up SSL** certificates
4. **Configure DNS** records

### Option 3: Use Cloudflare (Easiest)
1. **Add your domain** to Cloudflare
2. **Configure DNS** to point to Lightsail services
3. **Enable SSL** and proxy features
4. **Set up redirects** for API calls

## 📋 DNS Configuration

### For Lightsail Services:
```
# A Record
Name: @
Value: [Lightsail IP]
TTL: 300

# CNAME Record
Name: api
Value: qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com
TTL: 300
```

### For Custom Server:
```
# A Record
Name: @
Value: [Your Server IP]
TTL: 300

# CNAME Record
Name: www
Value: orderkaro.co.in
TTL: 300
```

## 🔧 Nginx Configuration

If you want to use your own server, here's the nginx configuration:

```nginx
server {
    listen 80;
    server_name orderkaro.co.in www.orderkaro.co.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name orderkaro.co.in www.orderkaro.co.in;
    
    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Frontend
    location / {
        proxy_pass https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/health;
        proxy_set_header Host $host;
    }
}
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
- **Service Deployment**: ✅ Complete
- **SSL Certificate**: ✅ Created
- **DNS Setup**: You need to configure this
- **Total**: Ready to use!

## 🆘 Troubleshooting

### If domain doesn't work:
1. Check DNS records are correct
2. Wait for propagation (up to 30 minutes)
3. Use direct Lightsail URLs as fallback

### If API calls fail:
1. Check CORS configuration
2. Verify environment variables
3. Check network connectivity

## 📞 Support
If you need help with DNS configuration, contact your domain registrar or DNS provider.

---

**🎉 Your OrderKaro.co.in domain is ready to use!**
