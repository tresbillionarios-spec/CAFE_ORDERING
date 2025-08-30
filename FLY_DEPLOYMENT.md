# 🚀 QR Scanner Trios - Fly.io Deployment Guide

## 📋 Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **Fly CLI**: Install the Fly CLI
3. **Git Repository**: Your code should be in a Git repository

## 🛠️ Installation Steps

### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Login to Fly.io
```bash
fly auth login
```

### 3. Navigate to Project Directory
```bash
cd /path/to/your/qr-scanner-trios
```

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)
```bash
./deploy-fly.sh
```

### Option 2: Manual Deployment

#### Step 1: Create Fly.io App
```bash
fly apps create qr-scanner-trios --org personal
```

#### Step 2: Set Environment Variables
```bash
fly secrets set NODE_ENV=production
fly secrets set PORT=8080
fly secrets set JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
fly secrets set CORS_ORIGIN="https://qr-scanner-trios.fly.dev"
fly secrets set FRONTEND_URL="https://qr-scanner-trios.fly.dev"
```

#### Step 3: Deploy
```bash
fly deploy
```

## 🌐 Access Your Application

Once deployed, your application will be available at:
- **Main URL**: https://qr-scanner-trios.fly.dev
- **Health Check**: https://qr-scanner-trios.fly.dev/health
- **API Base**: https://qr-scanner-trios.fly.dev/api

## 📊 Monitor Your Application

### Check App Status
```bash
fly status
```

### View Logs
```bash
fly logs
```

### Scale Application
```bash
fly scale count 1
```

## 🔧 Configuration Files

### fly.toml
- Configures the Fly.io application
- Sets memory, CPU, and networking
- Defines health checks

### Dockerfile
- Multi-stage build for production
- Optimized for Node.js 18
- Includes health checks

### .dockerignore
- Excludes unnecessary files
- Reduces build time and image size

## 🗄️ Database Setup

The application uses SQLite for simplicity. For production, consider:

1. **PostgreSQL on Fly.io**:
```bash
fly postgres create qr-scanner-db
fly postgres attach qr-scanner-db --app qr-scanner-trios
```

2. **Update database configuration** in `backend/src/config/database.js`

## 🔐 Security Considerations

1. **Change JWT Secret**: Update the JWT_SECRET in production
2. **Environment Variables**: Use Fly.io secrets for sensitive data
3. **CORS**: Configure CORS_ORIGIN for your domain
4. **Rate Limiting**: Already configured in the application

## 📱 Frontend Deployment

For the frontend, you can deploy it separately:

1. **Vercel** (Recommended for React apps)
2. **Netlify**
3. **GitHub Pages**

Update the `FRONTEND_URL` secret after frontend deployment.

## 🆘 Troubleshooting

### Common Issues

1. **Port Issues**: Ensure PORT=8080 in secrets
2. **Database Errors**: Check SQLite file permissions
3. **CORS Errors**: Verify CORS_ORIGIN setting
4. **Memory Issues**: Increase memory in fly.toml

### Useful Commands

```bash
# Restart application
fly apps restart qr-scanner-trios

# Check app info
fly info

# SSH into app
fly ssh console

# View app metrics
fly dashboard
```

## 💰 Cost Management

Fly.io Free Tier includes:
- 3 shared-cpu VMs
- 3GB persistent volume
- 160GB outbound data transfer

Monitor usage with:
```bash
fly dashboard
```

## 🔄 Continuous Deployment

Set up GitHub Actions for automatic deployment:

1. Add Fly.io token to GitHub secrets
2. Create `.github/workflows/deploy.yml`
3. Push to main branch triggers deployment

## 📞 Support

- **Fly.io Docs**: https://fly.io/docs/
- **Fly.io Community**: https://community.fly.io/
- **Application Issues**: Check logs with `fly logs`
