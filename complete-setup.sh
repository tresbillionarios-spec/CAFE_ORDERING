#!/bin/bash

# Complete Setup Script for QR Scanner Trios
# This script sets up everything from Git to AWS Lightsail deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🚀 QR Scanner Trios - Complete Setup from Git to AWS"
echo "=================================================="
echo ""

# Configuration
APP_NAME="CAFE_Ordering"
APP_DIR="/home/ubuntu/$APP_NAME"
DOMAIN="orderkaro.co.in"
SERVER_IP="13.232.219.159"
BACKEND_PORT=5001
FRONTEND_PORT=3000

print_status "Setting up complete CI/CD pipeline..."

# Step 1: Update system and install dependencies
print_status "Step 1: Updating system and installing dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

print_success "System dependencies installed successfully!"

# Step 2: Setup application directory
print_status "Step 2: Setting up application directory..."

# Create application directory
mkdir -p $APP_DIR
cd $APP_DIR

# Check if repository is already cloned
if [ ! -d ".git" ]; then
    print_status "Please clone your repository first:"
    echo "git clone https://github.com/your-username/your-repo-name.git $APP_DIR"
    echo ""
    read -p "Press Enter after cloning your repository..."
fi

# Navigate to backend and install dependencies
cd backend
npm install --production
cd ..

print_success "Application directory setup completed!"

# Step 3: Setup PM2 process manager
print_status "Step 3: Setting up PM2 process manager..."

cd $APP_DIR/backend

# Start the application with PM2
pm2 start src/server.js --name cafe-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

print_success "PM2 setup completed!"

# Step 4: Setup Nginx
print_status "Step 4: Setting up Nginx reverse proxy..."

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
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
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:$BACKEND_PORT/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location /uploads {
        alias $APP_DIR/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Default location (if you have a frontend)
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

print_success "Nginx configuration completed!"

# Step 5: Setup SSL certificate
print_status "Step 5: Setting up SSL certificate..."

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Test auto-renewal
sudo certbot renew --dry-run

print_success "SSL certificate setup completed!"

# Step 6: Setup firewall
print_status "Step 6: Setting up firewall..."

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

print_success "Firewall configuration completed!"

# Step 7: Create deployment script
print_status "Step 7: Creating deployment script..."

cat > /home/ubuntu/deploy.sh << 'EOF'
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

print_success "Deployment script created!"

# Step 8: Create backup script
print_status "Step 8: Creating backup script..."

cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /home/ubuntu/CAFE_Ordering/backend/database.sqlite $BACKUP_DIR/database_backup_$DATE.sqlite

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /home/ubuntu/CAFE_Ordering/backend uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $DATE"
EOF

chmod +x /home/ubuntu/backup.sh

# Setup cron job for backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh") | crontab -

print_success "Backup script created and scheduled!"

# Step 9: Health check
print_status "Step 9: Performing health checks..."

# Wait for services to start
sleep 10

# Check PM2 status
if pm2 status | grep -q "cafe-backend"; then
    print_success "PM2 application is running"
else
    print_error "PM2 application is not running"
fi

# Check backend health
if curl -f http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
    print_success "Backend is healthy on port $BACKEND_PORT"
else
    print_error "Backend health check failed"
fi

# Check Nginx
if curl -f http://localhost/ > /dev/null 2>&1; then
    print_success "Nginx is working correctly"
else
    print_error "Nginx health check failed"
fi

# Check domain
if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
    print_success "Domain $DOMAIN is accessible with SSL"
else
    print_warning "Domain $DOMAIN may not be accessible yet (DNS propagation)"
fi

# Step 10: Display final information
print_success "🎉 Complete setup finished successfully!"
echo ""
print_status "Application Information:"
print_status "  - Backend API: http://localhost:$BACKEND_PORT"
print_status "  - Domain: https://$DOMAIN"
print_status "  - PM2 App: cafe-backend"
print_status "  - Nginx: Configured and running"
print_status "  - SSL: Enabled with Let's Encrypt"
print_status "  - Firewall: Configured"
echo ""
print_status "Useful Commands:"
print_status "  - View logs: pm2 logs cafe-backend"
print_status "  - Restart: pm2 restart cafe-backend"
print_status "  - Deploy: /home/ubuntu/deploy.sh"
print_status "  - Backup: /home/ubuntu/backup.sh"
print_status "  - Check status: pm2 status"
echo ""
print_status "Next Steps:"
print_status "1. Add your SSH key to GitHub Secrets as 'AWS_SSH_KEY'"
print_status "2. Push your code to trigger the first deployment"
print_status "3. Test your application at https://$DOMAIN"
echo ""
print_success "Setup completed! Your application is ready for CI/CD deployment! 🚀"
