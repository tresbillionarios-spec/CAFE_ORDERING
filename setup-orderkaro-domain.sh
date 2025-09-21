#!/bin/bash

# Setup orderkaro.co.in domain for existing Lightsail services
# This script configures domain redirects and SSL certificates

set -e

echo "🌐 Setting up orderkaro.co.in domain for existing Lightsail services..."

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

# Set region
REGION="us-east-1"
print_status "Using region: $REGION"

# Get current service URLs
print_status "Getting current service URLs..."

FRONTEND_URL="https://qr-scanner-frontend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/"
BACKEND_URL="https://qr-scanner-backend.cw27w5415mg9y.us-east-1.cs.amazonlightsail.com/"

print_success "Current service URLs:"
echo "  • Frontend: $FRONTEND_URL"
echo "  • Backend: $BACKEND_URL"

# Create SSL certificate for orderkaro.co.in
print_status "Creating SSL certificate for orderkaro.co.in..."
aws lightsail create-certificate \
    --certificate-name orderkaro-co-in-cert \
    --domain-name orderkaro.co.in \
    --region $REGION || print_warning "Certificate may already exist"

print_success "SSL certificate created for orderkaro.co.in"

# Create a simple HTML redirect page
print_status "Creating redirect page for orderkaro.co.in..."

cat > index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OrderKaro - QR Scanner Trios</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            margin: 10px;
            font-size: 1.2em;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #45a049;
        }
        .info {
            margin-top: 30px;
            font-size: 1.1em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍽️ OrderKaro</h1>
        <p>QR Scanner Trios - Restaurant Ordering System</p>
        
        <a href="$FRONTEND_URL" class="btn">🚀 Launch Application</a>
        <a href="$BACKEND_URL/health" class="btn">🔧 API Health Check</a>
        
        <div class="info">
            <p><strong>Frontend:</strong> $FRONTEND_URL</p>
            <p><strong>Backend API:</strong> $BACKEND_URL</p>
        </div>
    </div>
</body>
</html>
EOF

print_success "Redirect page created"

# Create a simple nginx configuration for the domain
print_status "Creating nginx configuration..."

cat > nginx.conf << EOF
server {
    listen 80;
    server_name orderkaro.co.in www.orderkaro.co.in;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    server_name orderkaro.co.in www.orderkaro.co.in;
    
    # SSL configuration (will be handled by Lightsail)
    ssl_certificate /etc/ssl/certs/orderkaro.co.in.crt;
    ssl_certificate_key /etc/ssl/private/orderkaro.co.in.key;
    
    # Main page
    location / {
        root /var/www/html;
        index index.html;
        try_files \$uri \$uri/ =404;
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass $BACKEND_URL;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        proxy_pass $BACKEND_URL/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

print_success "Nginx configuration created"

# Display setup instructions
echo ""
echo "🎉 OrderKaro.co.in Domain Setup Complete!"
echo ""
echo "📋 What's Been Set Up:"
echo "✅ SSL Certificate: orderkaro-co-in-cert"
echo "✅ Redirect Page: index.html"
echo "✅ Nginx Config: nginx.conf"
echo ""
echo "🌐 Your Domain URLs:"
echo "• Main Site: https://orderkaro.co.in"
echo "• API: https://orderkaro.co.in/api"
echo "• Health: https://orderkaro.co.in/health"
echo ""
echo "📋 DNS Configuration Required:"
echo "Add these DNS records to your orderkaro.co.in domain:"
echo ""
echo "1. A Record:"
echo "   • Name: @"
echo "   • Value: [Your server IP]"
echo "   • TTL: 300"
echo ""
echo "2. CNAME Record:"
echo "   • Name: www"
echo "   • Value: orderkaro.co.in"
echo "   • TTL: 300"
echo ""
echo "⏱️ DNS propagation may take 5-30 minutes"
print_success "Domain setup completed!"
