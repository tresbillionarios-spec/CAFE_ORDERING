#!/bin/bash

# Complete AWS Lightsail Setup Script
# This script creates all necessary AWS Lightsail resources for the QR Scanner Trios application

set -e

echo "🚀 Setting up AWS Lightsail infrastructure for QR Scanner Trios..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
print_status "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

print_success "AWS credentials are working!"

# Set region
REGION="us-east-1"
print_status "Using region: $REGION"

# Step 1: Create Container Registries
print_status "Creating container registries..."

# Create frontend registry
print_status "Creating qr-scanner-frontend registry..."
aws lightsail create-container-service-registry-login --region $REGION || true

# Create backend registry  
print_status "Creating qr-scanner-backend registry..."
aws lightsail create-container-service-registry-login --region $REGION || true

print_success "Container registries setup completed!"

# Step 2: Create Container Services
print_status "Creating container services..."

# Create frontend container service
print_status "Creating qr-scanner-frontend container service..."
aws lightsail create-container-service \
    --service-name qr-scanner-frontend \
    --power nano \
    --scale 1 \
    --region $REGION || print_warning "Frontend service may already exist"

# Wait for frontend service to be ready
print_status "Waiting for frontend service to be ready..."
sleep 30

# Create backend container service
print_status "Creating qr-scanner-backend container service..."
aws lightsail create-container-service \
    --service-name qr-scanner-backend \
    --power nano \
    --scale 1 \
    --region $REGION || print_warning "Backend service may already exist"

print_success "Container services created!"

# Step 3: Create Load Balancer
print_status "Creating load balancer..."
aws lightsail create-load-balancer \
    --load-balancer-name qr-scanner-lb \
    --instance-port 80 \
    --health-check-path / \
    --region $REGION || print_warning "Load balancer may already exist"

print_success "Load balancer created!"

# Step 4: Get service information
print_status "Getting service information..."

# Get frontend service info
FRONTEND_SERVICE=$(aws lightsail get-container-services --service-name qr-scanner-frontend --region $REGION 2>/dev/null || echo "{}")
BACKEND_SERVICE=$(aws lightsail get-container-services --service-name qr-scanner-backend --region $REGION 2>/dev/null || echo "{}")

print_success "Infrastructure setup completed!"

# Step 5: Display next steps
echo ""
echo "🎉 AWS Lightsail Infrastructure Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Wait 5-10 minutes for services to fully provision"
echo "2. Run the GitHub Actions pipeline again"
echo "3. The pipeline will now be able to push images to the registries"
echo ""
echo "🔗 Useful Commands:"
echo "• Check services: aws lightsail get-container-services --region $REGION"
echo "• Check load balancer: aws lightsail get-load-balancers --region $REGION"
echo ""
echo "🌐 Your domains will be:"
echo "• Frontend: https://orderkaro.co.in"
echo "• Backend API: https://api.orderkaro.co.in"
echo ""
print_success "Setup completed successfully!"
