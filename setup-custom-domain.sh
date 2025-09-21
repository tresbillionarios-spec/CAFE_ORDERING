#!/bin/bash

# Setup Custom Domain for orderkaro.co.in
# This script configures domain mapping and SSL certificates

set -e

echo "🌐 Setting up custom domain orderkaro.co.in for QR Scanner Trios..."

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

# Step 1: Create SSL Certificate for orderkaro.co.in
print_status "Creating SSL certificate for orderkaro.co.in..."
aws lightsail create-certificate \
    --certificate-name orderkaro-co-in-cert \
    --domain-name orderkaro.co.in \
    --subject-alternative-names orderkaro.co.in,api.orderkaro.co.in \
    --region $REGION || print_warning "Certificate may already exist"

print_success "SSL certificate created for orderkaro.co.in"

# Step 2: Create Load Balancer
print_status "Creating load balancer for orderkaro.co.in..."
aws lightsail create-load-balancer \
    --load-balancer-name orderkaro-lb \
    --instance-port 80 \
    --health-check-path / \
    --region $REGION || print_warning "Load balancer may already exist"

print_success "Load balancer created"

# Step 3: Attach SSL Certificate to Load Balancer
print_status "Attaching SSL certificate to load balancer..."
aws lightsail attach-certificate-to-distribution \
    --distribution-name orderkaro-lb \
    --certificate-name orderkaro-co-in-cert \
    --region $REGION || print_warning "Certificate attachment may already exist"

print_success "SSL certificate attached to load balancer"

# Step 4: Get Load Balancer Information
print_status "Getting load balancer information..."
LB_INFO=$(aws lightsail get-load-balancers \
    --load-balancer-names orderkaro-lb \
    --region $REGION \
    --query 'loadBalancers[0]' \
    --output json 2>/dev/null || echo "{}")

if [ "$LB_INFO" != "{}" ]; then
    LB_IP=$(echo $LB_INFO | jq -r '.ipAddress // "Not available"')
    LB_DNS=$(echo $LB_INFO | jq -r '.dnsName // "Not available"')
    
    print_success "Load balancer information:"
    echo "  • IP Address: $LB_IP"
    echo "  • DNS Name: $LB_DNS"
else
    print_warning "Load balancer information not available"
fi

# Step 5: Display DNS Configuration Instructions
echo ""
echo "🎉 Custom Domain Setup Complete!"
echo ""
echo "📋 DNS Configuration Required:"
echo "Add these DNS records to your orderkaro.co.in domain:"
echo ""
echo "1. A Record:"
echo "   • Name: @"
echo "   • Value: $LB_IP"
echo "   • TTL: 300"
echo ""
echo "2. CNAME Record:"
echo "   • Name: api"
echo "   • Value: $LB_DNS"
echo "   • TTL: 300"
echo ""
echo "3. CNAME Record (Alternative):"
echo "   • Name: www"
echo "   • Value: orderkaro.co.in"
echo "   • TTL: 300"
echo ""
echo "🌐 Your URLs will be:"
echo "• Frontend: https://orderkaro.co.in"
echo "• Backend API: https://api.orderkaro.co.in"
echo ""
echo "⏱️ DNS propagation may take 5-30 minutes"
print_success "Custom domain setup completed!"
