#!/bin/bash

# QR Scanner Trios - Render Deployment Script
echo "🚀 Deploying QR Scanner Trios to Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Code is ready for deployment!${NC}"
echo ""
echo -e "${YELLOW}📋 Deployment Steps:${NC}"
echo ""
echo -e "${BLUE}1. Go to Render Dashboard:${NC}"
echo "   https://render.com"
echo ""
echo -e "${BLUE}2. Sign in with GitHub:${NC}"
echo "   Use your GitHub account: zee71645-dotcom"
echo ""
echo -e "${BLUE}3. Create New Blueprint:${NC}"
echo "   • Click 'New +' → 'Blueprint'"
echo "   • Connect repository: zee71645-dotcom/qr-scanner-trios"
echo "   • Render will auto-detect render.yaml"
echo ""
echo -e "${BLUE}4. Configure Services:${NC}"
echo "   • Backend API (Node.js)"
echo "   • Frontend (Static Site)"
echo "   • Database (PostgreSQL)"
echo ""
echo -e "${BLUE}5. Deploy:${NC}"
echo "   • Click 'Apply' to start deployment"
echo "   • Wait for all services to be ready"
echo ""
echo -e "${GREEN}🎉 Your app will be live at:${NC}"
echo "   • Frontend: https://qr-scanner-trios-frontend.onrender.com"
echo "   • Backend: https://qr-scanner-trios-backend.onrender.com"
echo ""
echo -e "${YELLOW}📚 For detailed instructions, see: DEPLOYMENT_GUIDE.md${NC}"
echo ""
echo -e "${BLUE}🔧 Manual Deployment (if needed):${NC}"
echo "   • Backend: Create Web Service → Node.js"
echo "   • Frontend: Create Static Site"
echo "   • Database: Create PostgreSQL Database"
echo ""
echo -e "${GREEN}✅ Ready to deploy!${NC}"
