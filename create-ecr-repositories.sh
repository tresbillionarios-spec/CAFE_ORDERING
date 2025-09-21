#!/bin/bash

# Create ECR Repositories for QR Scanner Trios
# This script creates the ECR repositories needed for Docker images

set -e

echo "🐳 Creating ECR repositories for QR Scanner Trios..."

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

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_status "AWS Account ID: $ACCOUNT_ID"

# Create ECR repositories
print_status "Creating ECR repositories..."

# Create frontend repository
print_status "Creating qr-scanner-frontend repository..."
aws ecr create-repository \
    --repository-name qr-scanner-frontend \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 || print_warning "Frontend repository may already exist"

# Create backend repository
print_status "Creating qr-scanner-backend repository..."
aws ecr create-repository \
    --repository-name qr-scanner-backend \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 || print_warning "Backend repository may already exist"

print_success "ECR repositories created!"

# Display repository information
echo ""
echo "📋 ECR Repository Information:"
echo "• Frontend: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/qr-scanner-frontend"
echo "• Backend: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/qr-scanner-backend"
echo ""

# List repositories to verify
print_status "Verifying repositories..."
aws ecr describe-repositories --region $REGION --query 'repositories[?contains(repositoryName, `qr-scanner`)].{Name:repositoryName,URI:repositoryUri}' --output table

print_success "ECR repositories setup completed!"
echo ""
echo "🎉 You can now run the GitHub Actions pipeline!"
echo "The Docker images will be pushed to these ECR repositories."
