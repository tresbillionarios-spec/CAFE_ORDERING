#!/bin/bash

# QR Scanner Trios - Fly.io Deployment Script
echo "🚀 Deploying QR Scanner Trios to Fly.io..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Please login to Fly.io first:"
    echo "   fly auth login"
    exit 1
fi

# Create app if it doesn't exist
echo "📦 Creating Fly.io app..."
fly apps create qr-scanner-trios --org personal || echo "App already exists"

# Set secrets
echo "🔐 Setting environment variables..."
fly secrets set NODE_ENV=production
fly secrets set PORT=8080
fly secrets set JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
fly secrets set CORS_ORIGIN="https://qr-scanner-trios.fly.dev"
fly secrets set FRONTEND_URL="https://qr-scanner-trios.fly.dev"

# Deploy the application
echo "🚀 Deploying application..."
fly deploy

# Check deployment status
echo "✅ Deployment completed!"
echo "🌐 Your app is available at: https://qr-scanner-trios.fly.dev"
echo "🔗 Health check: https://qr-scanner-trios.fly.dev/health"

# Show app status
echo "📊 App status:"
fly status
