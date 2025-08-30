#!/bin/bash

# QR Scanner Trios - Render.com Deployment Script
echo "🚀 Preparing QR Scanner Trios for Render.com deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not found. Please initialize git first:${NC}"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo -e "${RED}❌ No GitHub remote found. Please add your GitHub repository:${NC}"
    echo "   git remote add origin https://github.com/yourusername/qr-scanner-trios.git"
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found. Please ensure the file exists.${NC}"
    exit 1
fi

# Push to GitHub
echo -e "${BLUE}📤 Pushing code to GitHub...${NC}"
git add .
git commit -m "Ready for Render.com deployment - $(date)" || echo "No changes to commit"
git push origin main

echo ""
echo -e "${GREEN}✅ Code pushed to GitHub successfully!${NC}"
echo ""
echo -e "${YELLOW}🌐 Next Steps for Render.com Deployment:${NC}"
echo ""
echo -e "${BLUE}1. Go to https://render.com${NC}"
echo -e "${BLUE}2. Sign up with your GitHub account${NC}"
echo -e "${BLUE}3. Click 'New +' → 'Blueprint'${NC}"
echo -e "${BLUE}4. Connect your GitHub repository${NC}"
echo -e "${BLUE}5. Render will automatically detect render.yaml and configure services${NC}"
echo ""
echo -e "${YELLOW}📋 Services that will be created:${NC}"
echo "   • qr-scanner-trios-backend (Node.js API)"
echo "   • qr-scanner-trios-frontend (Static Site)"
echo "   • qr-scanner-trios-db (PostgreSQL Database)"
echo ""
echo -e "${YELLOW}🔧 Environment Variables (auto-configured):${NC}"
echo "   • NODE_ENV=production"
echo "   • PORT=10000"
echo "   • JWT_SECRET (auto-generated)"
echo "   • CORS_ORIGIN=https://qr-scanner-trios-frontend.onrender.com"
echo "   • FRONTEND_URL=https://qr-scanner-trios-frontend.onrender.com"
echo "   • Database credentials (auto-linked)"
echo ""
echo -e "${YELLOW}🌍 Your app will be live at:${NC}"
echo "   • Frontend: https://qr-scanner-trios-frontend.onrender.com"
echo "   • Backend API: https://qr-scanner-trios-backend.onrender.com"
echo "   • Health Check: https://qr-scanner-trios-backend.onrender.com/health"
echo ""
echo -e "${GREEN}🎯 Deployment Checklist:${NC}"
echo "   ☐ Blueprint deployment completed"
echo "   ☐ Database migrations run successfully"
echo "   ☐ Frontend builds without errors"
echo "   ☐ Backend health check passes"
echo "   ☐ CORS configuration is correct"
echo "   ☐ Environment variables are set"
echo ""
echo -e "${BLUE}📚 Additional Resources:${NC}"
echo "   • Render Documentation: https://render.com/docs"
echo "   • Blueprint Documentation: https://render.com/docs/blueprint-spec"
echo "   • PostgreSQL on Render: https://render.com/docs/databases"
echo ""
echo -e "${GREEN}🚀 Happy deploying!${NC}"
