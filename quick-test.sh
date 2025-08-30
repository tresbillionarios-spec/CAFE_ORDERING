#!/bin/bash

echo "🧪 Quick Test - QR Scanner Trios Setup"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Checking environment files...${NC}"

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env exists${NC}"
else
    echo -e "${RED}❌ Backend .env missing${NC}"
    echo "Run: cp backend/env.local backend/.env"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ Frontend .env exists${NC}"
else
    echo -e "${RED}❌ Frontend .env missing${NC}"
    echo "Run: cp frontend/env.local frontend/.env"
fi

echo -e "${BLUE}Checking dependencies...${NC}"

# Check backend node_modules
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend dependencies missing${NC}"
    echo "Run: cd backend && npm install"
fi

# Check frontend node_modules
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend dependencies missing${NC}"
    echo "Run: cd frontend && npm install"
fi

echo -e "${BLUE}Checking uploads directory...${NC}"

# Check uploads directory
if [ -d "backend/uploads" ]; then
    echo -e "${GREEN}✅ Uploads directory exists${NC}"
else
    echo -e "${RED}❌ Uploads directory missing${NC}"
    echo "Run: mkdir -p backend/uploads"
fi

echo ""
echo -e "${GREEN}🎉 Setup verification complete!${NC}"
echo ""
echo "To start the application:"
echo "  ./start-localhost.sh"
echo ""
echo "To test the application:"
echo "  ./test-localhost.sh"
