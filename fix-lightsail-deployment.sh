#!/bin/bash

# Fix Lightsail Container Service Deployment Issues
# This script handles deployment conflicts and provides better deployment management

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

echo "🔧 Fixing Lightsail Container Service Deployment Issues"
echo "======================================================"
echo ""

# Check current deployment status
print_status "Checking current deployment status..."

# Get the current deployment status
DEPLOYMENT_STATUS=$(aws lightsail get-container-service-deployments \
    --service-name qr-scanner-backend \
    --region us-east-1 \
    --query 'deployments[0].state' \
    --output text 2>/dev/null || echo "UNKNOWN")

print_status "Current deployment status: $DEPLOYMENT_STATUS"

# Wait for deployment to complete if it's in progress
if [ "$DEPLOYMENT_STATUS" = "RUNNING" ] || [ "$DEPLOYMENT_STATUS" = "PENDING" ]; then
    print_warning "Deployment is currently in progress. Waiting for completion..."
    
    # Wait for deployment to complete (max 10 minutes)
    TIMEOUT=600
    ELAPSED=0
    while [ "$DEPLOYMENT_STATUS" = "RUNNING" ] || [ "$DEPLOYMENT_STATUS" = "PENDING" ]; do
        if [ $ELAPSED -ge $TIMEOUT ]; then
            print_error "Deployment timeout reached. Please check the service manually."
            exit 1
        fi
        
        print_status "Waiting for deployment to complete... (${ELAPSED}s/${TIMEOUT}s)"
        sleep 30
        ELAPSED=$((ELAPSED + 30))
        
        DEPLOYMENT_STATUS=$(aws lightsail get-container-service-deployments \
            --service-name qr-scanner-backend \
            --region us-east-1 \
            --query 'deployments[0].state' \
            --output text 2>/dev/null || echo "UNKNOWN")
    done
    
    print_success "Deployment completed with status: $DEPLOYMENT_STATUS"
fi

# Check if deployment failed
if [ "$DEPLOYMENT_STATUS" = "FAILED" ]; then
    print_error "Previous deployment failed. Checking logs..."
    
    # Get deployment logs
    aws lightsail get-container-service-deployments \
        --service-name qr-scanner-backend \
        --region us-east-1 \
        --query 'deployments[0].containers' \
        --output table
    
    print_warning "Please check the logs above and fix any issues before retrying."
    exit 1
fi

# Create improved deployment configuration
print_status "Creating improved deployment configuration..."

cat > deployment-config.json << EOF
{
  "publicEndpoint": {
    "containerName": "backend",
    "containerPort": 5001,
    "healthCheck": {
      "path": "/health",
      "intervalSeconds": 30,
      "timeoutSeconds": 5,
      "healthyThreshold": 2,
      "unhealthyThreshold": 3
    }
  },
  "containers": {
    "backend": {
      "image": "076481189581.dkr.ecr.us-east-1.amazonaws.com/qr-scanner-backend:c5033260877803602b682217b962e06e2b48a7ce",
      "ports": {
        "5001": "HTTP"
      },
      "environment": {
        "NODE_ENV": "production",
        "PORT": "5001",
        "CORS_ORIGIN": "https://orderkaro.co.in",
        "FRONTEND_URL": "https://orderkaro.co.in",
        "JWT_SECRET": "your-super-secret-jwt-key-change-this-in-production",
        "USE_SQLITE": "true",
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_NAME": "qr_ordering_db",
        "DB_USER": "postgres",
        "DB_PASSWORD": "password"
      },
      "command": ["npm", "start"],
      "workingDirectory": "/app"
    }
  }
}
EOF

print_success "Deployment configuration created"

# Deploy with retry logic
print_status "Deploying to Lightsail Container Service..."

RETRY_COUNT=0
MAX_RETRIES=3

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    print_status "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES"
    
    if aws lightsail create-container-service-deployment \
        --service-name qr-scanner-backend \
        --cli-input-json file://deployment-config.json \
        --region us-east-1; then
        
        print_success "Deployment initiated successfully!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            print_warning "Deployment failed, retrying in 30 seconds..."
            sleep 30
        else
            print_error "Deployment failed after $MAX_RETRIES attempts"
            exit 1
        fi
    fi
done

# Monitor deployment progress
print_status "Monitoring deployment progress..."

DEPLOYMENT_STATUS="PENDING"
TIMEOUT=600
ELAPSED=0

while [ "$DEPLOYMENT_STATUS" != "ACTIVE" ] && [ "$DEPLOYMENT_STATUS" != "FAILED" ]; do
    if [ $ELAPSED -ge $TIMEOUT ]; then
        print_error "Deployment timeout reached"
        exit 1
    fi
    
    print_status "Deployment status: $DEPLOYMENT_STATUS (${ELAPSED}s/${TIMEOUT}s)"
    sleep 30
    ELAPSED=$((ELAPSED + 30))
    
    DEPLOYMENT_STATUS=$(aws lightsail get-container-service-deployments \
        --service-name qr-scanner-backend \
        --region us-east-1 \
        --query 'deployments[0].state' \
        --output text 2>/dev/null || echo "UNKNOWN")
done

if [ "$DEPLOYMENT_STATUS" = "ACTIVE" ]; then
    print_success "🎉 Deployment completed successfully!"
    
    # Get service URL
    SERVICE_URL=$(aws lightsail get-container-service \
        --service-name qr-scanner-backend \
        --region us-east-1 \
        --query 'containerService.url' \
        --output text)
    
    print_success "Service URL: $SERVICE_URL"
    print_status "Testing health endpoint..."
    
    # Test health endpoint
    if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
        print_success "Health check passed! Service is running correctly."
    else
        print_warning "Health check failed. Service may still be starting up."
    fi
    
else
    print_error "Deployment failed with status: $DEPLOYMENT_STATUS"
    
    # Get deployment logs
    print_status "Getting deployment logs..."
    aws lightsail get-container-service-deployments \
        --service-name qr-scanner-backend \
        --region us-east-1 \
        --query 'deployments[0].containers' \
        --output table
    
    exit 1
fi

# Clean up
rm -f deployment-config.json

print_success "🚀 Deployment process completed!"
print_status "Your application is now running on Lightsail Container Service"
print_status "Domain: https://orderkaro.co.in"
print_status "Health check: $SERVICE_URL/health"
