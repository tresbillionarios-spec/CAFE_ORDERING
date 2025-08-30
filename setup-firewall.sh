#!/bin/bash

echo "🔥 Setting up Firewall Rules for Network Access"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_PORT=5000
FRONTEND_PORT=5173

# macOS firewall setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}📱 Setting up macOS firewall rules...${NC}"
    
    # Check if firewall is enabled
    if sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate | grep -q "Firewall is enabled"; then
        echo -e "${GREEN}✅ Firewall is enabled${NC}"
        
        # Add rules for Node.js
        echo -e "${YELLOW}🔧 Adding Node.js to firewall exceptions...${NC}"
        sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(which node)
        sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock $(which node)
        
        echo -e "${GREEN}✅ Firewall rules configured for macOS${NC}"
    else
        echo -e "${YELLOW}⚠️  Firewall is disabled. Consider enabling it for security.${NC}"
    fi

# Linux firewall setup
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "${YELLOW}🐧 Setting up Linux firewall rules...${NC}"
    
    # Check if ufw is available
    if command -v ufw &> /dev/null; then
        echo -e "${YELLOW}🔧 Configuring UFW firewall...${NC}"
        sudo ufw allow $BACKEND_PORT/tcp
        sudo ufw allow $FRONTEND_PORT/tcp
        echo -e "${GREEN}✅ UFW rules added for ports $BACKEND_PORT and $FRONTEND_PORT${NC}"
    elif command -v iptables &> /dev/null; then
        echo -e "${YELLOW}🔧 Configuring iptables...${NC}"
        sudo iptables -A INPUT -p tcp --dport $BACKEND_PORT -j ACCEPT
        sudo iptables -A INPUT -p tcp --dport $FRONTEND_PORT -j ACCEPT
        echo -e "${GREEN}✅ iptables rules added for ports $BACKEND_PORT and $FRONTEND_PORT${NC}"
    else
        echo -e "${YELLOW}⚠️  No firewall management tool found. Please configure manually.${NC}"
    fi

# Windows firewall setup
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo -e "${YELLOW}🪟 Setting up Windows firewall rules...${NC}"
    
    # Add firewall rules for Node.js
    netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=$BACKEND_PORT
    netsh advfirewall firewall add rule name="Node.js Frontend" dir=in action=allow protocol=TCP localport=$FRONTEND_PORT
    
    echo -e "${GREEN}✅ Windows firewall rules configured${NC}"
else
    echo -e "${YELLOW}⚠️  Unknown OS. Please configure firewall manually.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Firewall setup completed!${NC}"
echo -e "${YELLOW}💡 If you still can't access from other devices:${NC}"
echo -e "   • Check your antivirus software settings"
echo -e "   • Ensure both devices are on the same network"
echo -e "   • Try disabling firewall temporarily for testing"
