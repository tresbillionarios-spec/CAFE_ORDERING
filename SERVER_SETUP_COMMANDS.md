# AWS Lightsail Server Setup Commands

## Prerequisites
- AWS Lightsail Ubuntu instance running
- Domain `orderkaro.co.in` pointing to `13.232.219.159`
- SSH access with `LightsailDefaultKey-ap-south-1.pem`

## Server Preparation Commands

Run these commands on your AWS Lightsail instance to prepare it for CI/CD:

### 1. Update System and Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install -y git

# Install curl for health checks
sudo apt install -y curl
```

### 2. Setup Application Directory

```bash
# Navigate to home directory
cd /home/ubuntu

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/your-repo-name.git CAFE_Ordering

# Navigate to the application directory
cd CAFE_Ordering

# Install backend dependencies
cd backend
npm install --production
cd ..
```

### 3. Setup PM2 Process Manager

```bash
# Navigate to backend directory
cd /home/ubuntu/CAFE_Ordering/backend

# Start the application with PM2
pm2 start src/server.js --name cafe-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Follow the instructions that PM2 provides for the startup command
# It will look something like: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 4. Setup Nginx (if not already configured)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration for your domain
sudo tee /etc/nginx/sites-available/orderkaro.co.in << 'EOF'
server {
    listen 80;
    server_name orderkaro.co.in www.orderkaro.co.in;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:5001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files (if any)
    location /uploads {
        alias /home/ubuntu/CAFE_Ordering/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Default location (if you have a frontend)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/orderkaro.co.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Setup SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d orderkaro.co.in -d www.orderkaro.co.in

# Test auto-renewal
sudo certbot renew --dry-run
```

### 6. Setup Firewall

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 7. Copy Deployment Script

```bash
# Copy the deploy.sh script to the server
# You can either:
# 1. Copy the content manually, or
# 2. Use scp to copy the file from your local machine

# Create the deploy script
sudo tee /home/ubuntu/deploy.sh << 'EOF'
#!/bin/bash

# QR Scanner Trios - AWS Lightsail Deployment Script
# This script handles zero-downtime deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/CAFE_Ordering"
BACKEND_DIR="$APP_DIR/backend"
PM2_APP_NAME="cafe-backend"
HEALTH_CHECK_URL="http://localhost:5001/health"
MAX_RETRIES=5
RETRY_DELAY=10

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if service is healthy
check_health() {
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f $HEALTH_CHECK_URL > /dev/null 2>&1; then
            return 0
        fi
        print_warning "Health check failed, retrying... ($((retries + 1))/$MAX_RETRIES)"
        sleep $RETRY_DELAY
        retries=$((retries + 1))
    done
    return 1
}

# Function to perform zero-downtime deployment
deploy() {
    print_status "Starting deployment for orderkaro.co.in..."
    
    # Navigate to application directory
    cd $APP_DIR
    
    # Check if we're in the right directory
    if [ ! -f "$BACKEND_DIR/package.json" ]; then
        print_error "Backend directory not found at $BACKEND_DIR"
        exit 1
    fi
    
    # Pull latest changes
    print_status "Pulling latest changes from repository..."
    git pull origin main
    
    # Navigate to backend directory
    cd $BACKEND_DIR
    
    # Install dependencies
    print_status "Installing/updating dependencies..."
    npm install --production
    
    # Check if PM2 app exists
    if ! pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
        print_warning "PM2 app '$PM2_APP_NAME' not found. Starting it for the first time..."
        pm2 start src/server.js --name $PM2_APP_NAME
        pm2 save
    else
        # Zero-downtime restart
        print_status "Performing zero-downtime restart..."
        pm2 reload $PM2_APP_NAME
    fi
    
    # Wait for application to be ready
    print_status "Waiting for application to be ready..."
    if check_health; then
        print_success "Application is healthy and running!"
    else
        print_error "Application health check failed after deployment"
        print_status "Rolling back to previous version..."
        pm2 restart $PM2_APP_NAME
        if check_health; then
            print_warning "Rollback successful, but deployment may have issues"
        else
            print_error "Rollback failed. Manual intervention required."
            exit 1
        fi
    fi
    
    # Show deployment status
    print_status "Deployment completed. Application status:"
    pm2 status $PM2_APP_NAME
    
    print_success "🎉 Deployment to orderkaro.co.in completed successfully!"
    print_status "Application is accessible at: https://orderkaro.co.in"
}

# Main deployment
deploy
EOF

# Make the script executable
chmod +x /home/ubuntu/deploy.sh
```

### 8. Test the Setup

```bash
# Check if PM2 is running your app
pm2 status

# Check if the app is responding
curl http://localhost:5001/health

# Check if Nginx is working
curl http://localhost/

# Check if your domain is working
curl https://orderkaro.co.in/health
```

### 9. GitHub Repository Setup

1. **Add SSH Key to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add a new secret named `AWS_SSH_KEY`
   - Copy the content of your `LightsailDefaultKey-ap-south-1.pem` file

2. **Verify Repository URL:**
   - Make sure your repository URL in the GitHub Actions workflow matches your actual repository

## Verification Commands

After setup, run these commands to verify everything is working:

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs cafe-backend

# Check Nginx status
sudo systemctl status nginx

# Test health endpoint
curl -f http://localhost:5001/health

# Test domain
curl -f https://orderkaro.co.in/health

# Check if deploy script works
/home/ubuntu/deploy.sh --dry-run
```

## Troubleshooting

If something goes wrong:

```bash
# Check PM2 logs
pm2 logs cafe-backend --lines 50

# Restart the application
pm2 restart cafe-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check if ports are open
sudo netstat -tlnp | grep :5001
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## Manual Deployment

If you need to deploy manually:

```bash
# Run the deployment script
/home/ubuntu/deploy.sh

# Or run the commands manually
cd /home/ubuntu/CAFE_Ordering
git pull origin main
cd backend
npm install --production
pm2 reload cafe-backend
```

Your CI/CD pipeline is now ready! 🚀
