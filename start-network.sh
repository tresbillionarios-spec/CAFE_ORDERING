#!/bin/bash

echo "🚀 Starting QR Scanner Trios - Network Access Mode"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get local IP
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

# Check if ports are available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Find available ports
if ! check_port $BACKEND_PORT; then
    for port in 5001 5002 5003 5004 5005; do
        if check_port $port; then
            BACKEND_PORT=$port
            break
        fi
    done
fi

if ! check_port $FRONTEND_PORT; then
    for port in 5174 5175 5176 5177 5178; do
        if check_port $port; then
            FRONTEND_PORT=$port
            break
        fi
    done
fi

echo -e "${GREEN}✅ Local IP: $LOCAL_IP${NC}"
echo -e "${GREEN}✅ Backend Port: $BACKEND_PORT${NC}"
echo -e "${GREEN}✅ Frontend Port: $FRONTEND_PORT${NC}"
echo ""

# Start backend
echo -e "${YELLOW}📦 Starting Backend Server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo -e "${YELLOW}📦 Starting Frontend Server...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo -e "${GREEN}🎉 QR Scanner Trios is now running!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "   Local Access:"
echo -e "   • Frontend: http://localhost:$FRONTEND_PORT"
echo -e "   • Backend:  http://localhost:$BACKEND_PORT"
echo ""
echo -e "${BLUE}📱 Network Access (same WiFi):${NC}"
echo -e "   • Frontend: http://$LOCAL_IP:$FRONTEND_PORT"
echo -e "   • Backend:  http://$LOCAL_IP:$BACKEND_PORT"
echo ""
echo -e "${BLUE}🔧 Health Check:${NC}"
echo -e "   • Backend Health: http://$LOCAL_IP:$BACKEND_PORT/health"
echo ""
echo -e "${BLUE}📋 Test Credentials:${NC}"
echo -e "   • Email: test@cafe.com"
echo -e "   • Password: password123"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • Share the network URLs with devices on the same WiFi"
echo -e "   • Use ngrok for public access: ngrok http $FRONTEND_PORT"
echo -e "   • Press Ctrl+C to stop all servers"
echo ""
echo -e "${YELLOW}⚠️  Note:${NC}"
echo -e "   • Make sure your firewall allows connections on ports $BACKEND_PORT and $FRONTEND_PORT"
echo -e "   • Some antivirus software may block network access"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
