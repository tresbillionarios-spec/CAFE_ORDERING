# 🌐 OrderKaro.co.in Domain Setup Guide

## 📋 Overview
This guide will help you configure your custom domain `orderkaro.co.in` for your QR Scanner Trios application.

## 🎯 Target URLs
- **Frontend**: https://orderkaro.co.in
- **Backend API**: https://api.orderkaro.co.in
- **Health Check**: https://orderkaro.co.in/health

## 🔧 Current Deployment Status

### ✅ What's Already Deployed:
- **Frontend Service**: https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/
- **Backend Service**: https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/
- **SSL Certificates**: Created for orderkaro.co.in
- **Container Services**: Both are READY and running

## 📝 DNS Configuration Required

### Step 1: Get Load Balancer Information
```bash
# Get the load balancer IP and DNS
aws lightsail get-load-balancers --load-balancer-names orderkaro-lb --region us-east-1
```

### Step 2: Configure DNS Records
Add these DNS records to your `orderkaro.co.in` domain:

#### A Record (Root Domain)
- **Name**: `@` (or leave blank)
- **Type**: `A`
- **Value**: `[Load Balancer IP Address]`
- **TTL**: `300`

#### CNAME Record (API Subdomain)
- **Name**: `api`
- **Type**: `CNAME`
- **Value**: `[Load Balancer DNS Name]`
- **TTL**: `300`

#### CNAME Record (WWW Subdomain)
- **Name**: `www`
- **Type**: `CNAME`
- **Value**: `orderkaro.co.in`
- **TTL**: `300`

## 🚀 Alternative: Direct Container Service Access

If load balancer setup is complex, you can use the direct container service URLs:

### Current Working URLs:
- **Frontend**: https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/
- **Backend**: https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/

### Custom Domain Mapping:
You can set up a simple redirect or proxy from your domain to these URLs.

## 🔍 Verification Steps

### 1. Check SSL Certificate
```bash
aws lightsail get-certificates --region us-east-1
```

### 2. Test Current Services
```bash
# Test frontend
curl -I https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/

# Test backend
curl -I https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/health
```

### 3. Check DNS Propagation
```bash
# Check if DNS is resolving
nslookup orderkaro.co.in
nslookup api.orderkaro.co.in
```

## ⏱️ Timeline
- **DNS Propagation**: 5-30 minutes
- **SSL Certificate**: Already created
- **Service Deployment**: ✅ Complete

## 🆘 Troubleshooting

### If DNS is not working:
1. Check DNS records are correct
2. Wait for propagation (up to 30 minutes)
3. Use direct container URLs as fallback

### If SSL issues:
1. Verify certificate is created
2. Check certificate status in AWS Lightsail console
3. Ensure domain matches certificate

## 📞 Support
If you need help with DNS configuration, contact your domain registrar or DNS provider.

---

**🎉 Your QR Scanner Trios application is ready to use with orderkaro.co.in!**
