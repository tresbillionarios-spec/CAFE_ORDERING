#!/bin/bash

echo "🚀 Setting up AWS Lightsail infrastructure for QR Scanner Trios..."

# Set your AWS region
AWS_REGION="us-east-1"

echo "📦 Creating frontend container service..."
aws lightsail create-container-service \
  --service-name qr-scanner-frontend \
  --power small \
  --scale 1 \
  --region $AWS_REGION

echo "📦 Creating backend container service..."
aws lightsail create-container-service \
  --service-name qr-scanner-backend \
  --power small \
  --scale 1 \
  --region $AWS_REGION

echo "⏳ Waiting for services to be ready..."
aws lightsail wait container-service-ready \
  --service-name qr-scanner-frontend \
  --region $AWS_REGION

aws lightsail wait container-service-ready \
  --service-name qr-scanner-backend \
  --region $AWS_REGION

echo "🌐 Creating load balancer..."
aws lightsail create-load-balancer \
  --load-balancer-name qr-scanner-lb \
  --instance-port 80 \
  --health-check-path /health \
  --region $AWS_REGION

echo "⏳ Waiting for load balancer to be ready..."
aws lightsail wait load-balancer-ready \
  --load-balancer-name qr-scanner-lb \
  --region $AWS_REGION

echo "🔗 Attaching services to load balancer..."
aws lightsail attach-instances-to-load-balancer \
  --load-balancer-name qr-scanner-lb \
  --instance-names qr-scanner-frontend \
  --region $AWS_REGION

aws lightsail attach-instances-to-load-balancer \
  --load-balancer-name qr-scanner-lb \
  --instance-names qr-scanner-backend \
  --region $AWS_REGION

echo "✅ Infrastructure setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS records:"
echo "   - orderkaro.co.in A <load-balancer-ip>"
echo "   - api.orderkaro.co.in A <load-balancer-ip>"
echo "2. Push to main branch to trigger deployment"
echo "3. Monitor the GitHub Actions workflow"
echo "4. Your app will be available at:"
echo "   - Frontend: https://orderkaro.co.in"
echo "   - Backend: https://api.orderkaro.co.in"
