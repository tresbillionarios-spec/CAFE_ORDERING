#!/bin/bash

echo "🚀 QR Scanner Trios - Status Check"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo -e "${BLUE}📱 Local IP: $LOCAL_IP${NC}"
echo ""

# Check backend
echo -e "${BLUE}🔧 Checking Backend Server...${NC}"
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 5001${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
fi

# Check frontend
echo -e "${BLUE}🌐 Checking Frontend Server...${NC}"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on port 5173${NC}"
else
    echo -e "${RED}❌ Frontend is not running${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "   Local Access:"
echo -e "   • Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   • Backend:  ${GREEN}http://localhost:5001${NC}"
echo ""
echo -e "${BLUE}📱 Network Access (same WiFi):${NC}"
echo -e "   • Frontend: ${GREEN}http://$LOCAL_IP:5173${NC}"
echo -e "   • Backend:  ${GREEN}http://$LOCAL_IP:5001${NC}"
echo ""
echo -e "${BLUE}🔧 Health Check:${NC}"
echo -e "   • Backend Health: ${GREEN}http://$LOCAL_IP:5001/health${NC}"
echo ""
echo -e "${BLUE}📋 Login Credentials:${NC}"
echo -e "   • Email: ${GREEN}test@cafe.com${NC}"
echo -e "   • Password: ${GREEN}password123${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • Use the network URLs to access from other devices"
echo -e "   • Share the network frontend URL with customers for QR scanning"
echo -e "   • The backend API is accessible for mobile apps"
