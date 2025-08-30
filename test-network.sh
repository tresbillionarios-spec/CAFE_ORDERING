#!/bin/bash

echo "🌐 Testing Network Connectivity"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        hostname -I | awk '{print $1}' 2>/dev/null || echo "127.0.0.1"
    else
        echo "127.0.0.1"
    fi
}

LOCAL_IP=$(get_local_ip)
BACKEND_PORT=5000
FRONTEND_PORT=5173

echo -e "${BLUE}🔍 Testing local connectivity...${NC}"

# Test local backend
if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend (localhost:$BACKEND_PORT) - OK${NC}"
else
    echo -e "${RED}❌ Backend (localhost:$BACKEND_PORT) - FAILED${NC}"
fi

# Test local frontend
if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend (localhost:$FRONTEND_PORT) - OK${NC}"
else
    echo -e "${RED}❌ Frontend (localhost:$FRONTEND_PORT) - FAILED${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Testing network connectivity...${NC}"

# Test network backend
if curl -s http://$LOCAL_IP:$BACKEND_PORT/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend (http://$LOCAL_IP:$BACKEND_PORT) - OK${NC}"
else
    echo -e "${RED}❌ Backend (http://$LOCAL_IP:$BACKEND_PORT) - FAILED${NC}"
fi

# Test network frontend
if curl -s http://$LOCAL_IP:$FRONTEND_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend (http://$LOCAL_IP:$FRONTEND_PORT) - OK${NC}"
else
    echo -e "${RED}❌ Frontend (http://$LOCAL_IP:$FRONTEND_PORT) - FAILED${NC}"
fi

echo ""
echo -e "${BLUE}📱 Network Information:${NC}"
echo -e "   Local IP: $LOCAL_IP"
echo -e "   Backend Port: $BACKEND_PORT"
echo -e "   Frontend Port: $FRONTEND_PORT"
echo ""
echo -e "${YELLOW}💡 If network tests fail:${NC}"
echo -e "   • Run: ./setup-firewall.sh"
echo -e "   • Check antivirus settings"
echo -e "   • Ensure both devices are on same WiFi"
