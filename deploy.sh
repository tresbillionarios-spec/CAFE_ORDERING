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

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Enable verbose output"
    echo "  --dry-run      Show what would be done without executing"
    echo ""
    echo "This script deploys the QR Scanner Trios application to AWS Lightsail"
    echo "with zero-downtime deployment using PM2."
}

# Parse command line arguments
VERBOSE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Enable verbose mode if requested
if [ "$VERBOSE" = true ]; then
    set -x
fi

# Check if dry run
if [ "$DRY_RUN" = true ]; then
    print_status "DRY RUN MODE - No changes will be made"
    print_status "Would execute: cd $APP_DIR && git pull origin main"
    print_status "Would execute: cd $BACKEND_DIR && npm install --production"
    print_status "Would execute: pm2 reload $PM2_APP_NAME"
    exit 0
fi

# Main deployment
deploy
