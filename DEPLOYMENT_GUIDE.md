# QR Scanner Trios - Render.com Deployment Guide

This guide provides step-by-step instructions for deploying the QR Scanner Trios application to Render.com on Linux.

## Prerequisites

- GitHub account with your project repository
- Render.com account
- Basic understanding of Git and command line

## Quick Deployment (Recommended)

### 1. Prepare Your Repository

```bash
# Clone or navigate to your project
cd qr-scanner-trios

# Ensure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Deploy Using Blueprint

1. **Go to Render.com**
   - Visit [https://render.com](https://render.com)
   - Sign up or log in with your GitHub account

2. **Create Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and configure all services

3. **Monitor Deployment**
   - Watch the build logs for any issues
   - All services will be created automatically:
     - Backend API (Node.js)
     - Frontend (Static Site)
     - PostgreSQL Database

### 3. Verify Deployment

Once deployment is complete, verify your services:

- **Frontend**: `https://qr-scanner-trios-frontend.onrender.com`
- **Backend API**: `https://qr-scanner-trios-backend.onrender.com`
- **Health Check**: `https://qr-scanner-trios-backend.onrender.com/health`

## Manual Deployment (Alternative)

If you prefer manual deployment, follow these steps:

### 1. Create Database

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `qr-scanner-trios-db`
   - **Database**: `qr_ordering_db`
   - **User**: `qr_ordering_user`
   - **Plan**: Free
   - **Region**: Oregon (US West)

### 2. Create Backend Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `qr-scanner-trios-backend`
   - **Environment**: Node
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci --only=production`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here
   CORS_ORIGIN=https://qr-scanner-trios-frontend.onrender.com
   FRONTEND_URL=https://qr-scanner-trios-frontend.onrender.com
   FORCE_SYNC=false
   ```

5. **Database Variables** (from your PostgreSQL service):
   ```
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=qr_ordering_db
   DB_USER=qr_ordering_user
   DB_PASS=your-db-password
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

### 3. Create Frontend Service

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `qr-scanner-trios-frontend`
   - **Environment**: Static
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   VITE_API_URL=https://qr-scanner-trios-backend.onrender.com/api
   ```

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://qr-scanner-trios-frontend.onrender.com` |
| `FRONTEND_URL` | Frontend URL | `https://qr-scanner-trios-frontend.onrender.com` |
| `DB_HOST` | Database host | `your-db-host` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `qr_ordering_db` |
| `DB_USER` | Database user | `qr_ordering_user` |
| `DB_PASS` | Database password | `your-db-password` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://qr-scanner-trios-backend.onrender.com/api` |

## Database Setup

### Automatic Setup (Recommended)

The application automatically creates database tables on first run in production mode.

### Manual Database Setup

If you need to manually initialize the database:

1. **Access your backend service logs**
2. **Run database initialization**:
   ```bash
   # In your backend service shell
   cd backend
   npm run init-db
   ```

### Database Schema

The application creates the following tables:
- `users` - User accounts and authentication
- `cafes` - Cafe information
- `tables` - Table management and QR codes
- `menus` - Menu items
- `orders` - Customer orders
- `order_items` - Individual order items

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Frontend or backend build fails
**Solution**:
- Check build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

#### 2. Database Connection Issues

**Problem**: Backend can't connect to database
**Solution**:
- Verify database environment variables
- Check database service status
- Ensure database is in the same region

#### 3. CORS Errors

**Problem**: Frontend can't communicate with backend
**Solution**:
- Verify `CORS_ORIGIN` environment variable
- Check that frontend URL matches CORS configuration
- Ensure both services are deployed

#### 4. Environment Variables Not Set

**Problem**: Application fails due to missing environment variables
**Solution**:
- Double-check all required environment variables
- Restart services after adding variables
- Verify variable names and values

### Health Check

Monitor your backend health at:
```
https://qr-scanner-trios-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": "connected"
}
```

### Logs and Monitoring

1. **View Logs**: Go to your service dashboard → Logs
2. **Monitor Performance**: Check the Metrics tab
3. **Set up Alerts**: Configure notifications for service failures

## Security Considerations

### Production Security

1. **JWT Secret**: Use a strong, unique JWT secret
2. **Database Password**: Use a strong database password
3. **CORS**: Restrict CORS to your frontend domain only
4. **HTTPS**: Render provides automatic HTTPS
5. **Environment Variables**: Never commit secrets to Git

### Security Headers

The application includes security headers via Helmet:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## Scaling Considerations

### Free Tier Limitations

- **Backend**: 750 hours/month
- **Database**: 90 days, 1GB storage
- **Static Site**: Unlimited

### Upgrading Plans

When ready to scale:
1. **Backend**: Upgrade to Starter plan ($7/month)
2. **Database**: Upgrade to Starter plan ($7/month)
3. **Custom Domain**: Add your own domain

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check for errors and performance issues
2. **Update Dependencies**: Keep packages updated
3. **Backup Database**: Regular database backups
4. **Security Updates**: Apply security patches

### Updates and Deployments

1. **Code Updates**: Push to GitHub triggers automatic deployment
2. **Environment Variables**: Update in Render dashboard
3. **Database Migrations**: Run manually if needed

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Static Sites on Render](https://render.com/docs/deploy-create-react-app)

## Demo Credentials

After deployment, you can use these demo credentials:
- **Email**: `demo@cafe.com`
- **Password**: `password`

## Next Steps

1. **Custom Domain**: Add your own domain name
2. **SSL Certificate**: Automatic with Render
3. **Monitoring**: Set up performance monitoring
4. **Backup Strategy**: Implement regular backups
5. **CI/CD**: Set up automated testing and deployment

---

For additional support, check the project documentation or create an issue in the repository.
