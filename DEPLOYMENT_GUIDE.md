# QR Scanner Trios - Deployment & Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and deploying the QR Scanner Trios system in both development and production environments.

## Prerequisites

### System Requirements

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: For version control
- **Database**: PostgreSQL (production) or SQLite (development)
- **Memory**: Minimum 512MB RAM
- **Storage**: Minimum 1GB free space

### Development Tools

- **Code Editor**: VS Code, Sublime Text, or similar
- **API Testing**: Postman, Insomnia, or similar
- **Database Client**: pgAdmin, DBeaver, or similar

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd QR-Scanner-Trios
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

#### Environment Variables (Backend)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password
DB_NAME=qr_ordering
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Optional: Force database sync in development
FORCE_SYNC=false
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

#### Environment Variables (Frontend)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=QR Ordering System
VITE_APP_VERSION=1.0.0
```

### 4. Database Setup

#### Option A: SQLite (Development)

SQLite is used by default for development. The database file will be created automatically.

#### Option B: PostgreSQL (Development)

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

CREATE DATABASE qr_ordering;
CREATE USER qr_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE qr_ordering TO qr_user;
\q

# Update .env file with PostgreSQL credentials
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## Production Deployment

### Option 1: Docker Deployment

#### 1. Docker Setup

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Environment Configuration

Create production environment files:

```bash
# Backend production environment
cat > backend/.env.production << EOF
DB_HOST=postgres
DB_USER=postgres
DB_PASS=your_secure_password
DB_NAME=qr_ordering
DB_PORT=5432
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
EOF

# Frontend production environment
cat > frontend/.env.production << EOF
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=QR Ordering System
EOF
```

#### 3. Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - NGINX_HOST=your-frontend-domain.com
      - NGINX_PORT=80

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=postgres
      - DB_USER=postgres
      - DB_PASS=your_secure_password
      - DB_NAME=qr_ordering
      - DB_PORT=5432
      - JWT_SECRET=your-super-secret-jwt-key-here
      - JWT_EXPIRES_IN=7d
      - PORT=5000
      - NODE_ENV=production
      - CORS_ORIGIN=https://your-frontend-domain.com
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=qr_ordering
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### 4. Dockerfile Configuration

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration:**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:5000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend:5000/health;
            proxy_set_header Host $host;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

#### 5. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and redeploy
docker-compose pull
docker-compose up -d
```

### Option 2: Cloud Platform Deployment

#### Vercel (Frontend) + Render (Backend)

**Frontend Deployment on Vercel:**

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Add environment variables:
   - `VITE_API_URL`: Your backend API URL
4. Deploy

**Backend Deployment on Render:**

1. Connect GitHub repository to Render
2. Configure service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
3. Add environment variables:
   - `DB_HOST`: Your PostgreSQL host
   - `DB_USER`: Database username
   - `DB_PASS`: Database password
   - `DB_NAME`: Database name
   - `JWT_SECRET`: Your JWT secret
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: Your frontend domain
4. Connect PostgreSQL database
5. Deploy

#### Railway Deployment

**Full Stack Deployment:**

1. Connect GitHub repository to Railway
2. Add PostgreSQL plugin
3. Configure environment variables
4. Deploy both frontend and backend

### Option 3: Traditional Server Deployment

#### Ubuntu Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

#### Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE qr_ordering;
CREATE USER qr_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE qr_ordering TO qr_user;
\q
```

#### Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd QR-Scanner-Trios

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with production values

# Start backend with PM2
pm2 start npm --name "qr-backend" -- start
pm2 save
pm2 startup

# Frontend setup
cd ../frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/qr-ordering
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/qr-ordering/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/qr-ordering /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Environment-Specific Configurations

### Development Environment

```env
# Backend (.env)
NODE_ENV=development
DB_HOST=localhost
DB_USER=postgres
DB_PASS=password
DB_NAME=qr_ordering_dev
DB_PORT=5432
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:5173
FORCE_SYNC=true

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=QR Ordering (Dev)
```

### Staging Environment

```env
# Backend (.env.staging)
NODE_ENV=staging
DB_HOST=staging-db-host
DB_USER=staging_user
DB_PASS=staging_password
DB_NAME=qr_ordering_staging
JWT_SECRET=staging-secret-key
CORS_ORIGIN=https://staging.your-domain.com

# Frontend (.env.staging)
VITE_API_URL=https://staging-api.your-domain.com/api
VITE_APP_NAME=QR Ordering (Staging)
```

### Production Environment

```env
# Backend (.env.production)
NODE_ENV=production
DB_HOST=production-db-host
DB_USER=production_user
DB_PASS=production_secure_password
DB_NAME=qr_ordering_prod
JWT_SECRET=production-super-secure-key
CORS_ORIGIN=https://your-domain.com

# Frontend (.env.production)
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=QR Ordering System
```

## Database Migrations

### Development

```bash
# Run migrations
cd backend
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Seed database
npx sequelize-cli db:seed:all
```

### Production

```bash
# Run migrations safely
cd backend
NODE_ENV=production npx sequelize-cli db:migrate

# Backup before migration
pg_dump -h your-db-host -U your-user -d qr_ordering > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Monitoring and Logging

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit
pm2 logs

# Docker monitoring
docker-compose logs -f
docker stats
```

### Database Monitoring

```bash
# PostgreSQL monitoring
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
sudo -u postgres psql -c "SELECT * FROM pg_stat_database;"
```

### Nginx Monitoring

```bash
# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# View access logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Considerations

### SSL/TLS Configuration

```bash
# Let's Encrypt SSL
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration

```bash
# UFW firewall setup
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Database Security

```bash
# PostgreSQL security
sudo -u postgres psql

# Create read-only user
CREATE USER readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE qr_ordering TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
```

## Backup and Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/qr-ordering"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="qr_ordering"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U postgres $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Application Backup

```bash
# Backup application files
tar -czf /var/backups/qr-ordering/app_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/qr-ordering/
```

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
pm2 logs qr-backend
docker-compose logs backend

# Check environment variables
echo $NODE_ENV
echo $DB_HOST
```

**Database connection issues:**
```bash
# Test database connection
psql -h localhost -U postgres -d qr_ordering

# Check PostgreSQL status
sudo systemctl status postgresql
```

**Frontend build issues:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env
```

**Nginx issues:**
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Optimization

```bash
# Enable gzip compression
sudo nano /etc/nginx/nginx.conf

# Add to http block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Scaling Considerations

```bash
# Load balancing with multiple backend instances
# Update nginx configuration to include multiple upstream servers

upstream backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}
```

This comprehensive deployment guide covers all aspects of setting up and deploying the QR Scanner Trios system in various environments, from local development to production deployment.
