#!/bin/bash

echo "🚀 QR Scanner Trios - Local Network Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Get local IP address
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        hostname -I | awk '{print $1}' 2>/dev/null || echo "127.0.0.1"
    else
        # Windows or other
        echo "127.0.0.1"
    fi
}

LOCAL_IP=$(get_local_ip)
print_info "Local IP Address: $LOCAL_IP"

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Check if ports are available
BACKEND_PORT=5000
FRONTEND_PORT=5173

if ! check_port $BACKEND_PORT; then
    print_warning "Port $BACKEND_PORT is already in use. Trying to find alternative..."
    for port in 5001 5002 5003 5004 5005; do
        if check_port $port; then
            BACKEND_PORT=$port
            print_info "Using backend port: $BACKEND_PORT"
            break
        fi
    done
fi

if ! check_port $FRONTEND_PORT; then
    print_warning "Port $FRONTEND_PORT is already in use. Trying to find alternative..."
    for port in 5174 5175 5176 5177 5178; do
        if check_port $port; then
            FRONTEND_PORT=$port
            print_info "Using frontend port: $FRONTEND_PORT"
            break
        fi
    done
fi

# Create backend .env file
echo -e "\n${YELLOW}📦 Setting up Backend...${NC}"
cd backend

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Create .env file for backend
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file..."
    cat > .env << EOF
# Database Configuration (SQLite for local development)
DB_HOST=localhost
DB_USER=postgres
DB_PASS=password
DB_NAME=qr_ordering_db
DB_PORT=5432

# JWT Configuration
JWT_SECRET=local-development-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=$BACKEND_PORT
NODE_ENV=development

# CORS Configuration - Allow all origins for network access
CORS_ORIGIN=*

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF
    print_status "Backend .env file created"
else
    print_info "Backend .env file already exists"
fi

# Initialize database
print_status "Initializing database..."
npm run init-db

cd ..

# Create frontend .env file
echo -e "\n${YELLOW}📦 Setting up Frontend...${NC}"
cd frontend

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Create .env file for frontend
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file..."
    cat > .env << EOF
# API Configuration - Use local IP for network access
VITE_API_URL=http://$LOCAL_IP:$BACKEND_PORT/api

# App Configuration
VITE_APP_NAME=QR Ordering System
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
EOF
    print_status "Frontend .env file created"
else
    print_info "Frontend .env file already exists"
    # Update API URL to use local IP
    sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=http://$LOCAL_IP:$BACKEND_PORT/api|" .env
    print_status "Updated frontend API URL to use local IP"
fi

cd ..

# Create network access script
echo -e "\n${YELLOW}🌐 Creating Network Access Configuration...${NC}"

# Function to create ngrok configuration (if available)
setup_ngrok() {
    if command -v ngrok &> /dev/null; then
        print_info "ngrok found! Setting up tunnel..."
        cat > ngrok.yml << EOF
version: "2"
authtoken: YOUR_NGROK_AUTH_TOKEN
tunnels:
  frontend:
    addr: $FRONTEND_PORT
    proto: http
  backend:
    addr: $BACKEND_PORT
    proto: http
EOF
        print_warning "Please add your ngrok auth token to ngrok.yml"
        print_info "Run: ngrok start --config ngrok.yml frontend backend"
    else
        print_info "ngrok not found. Install from https://ngrok.com/ for public access"
    fi
}

setup_ngrok

# Create the main startup script
cat > start-network.sh << 'EOF'
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
EOF

chmod +x start-network.sh

# Create firewall helper script
cat > setup-firewall.sh << 'EOF'
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
EOF

chmod +x setup-firewall.sh

# Create network test script
cat > test-network.sh << 'EOF'
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
EOF

chmod +x test-network.sh

print_status "Setup completed successfully!"
echo ""
echo -e "${GREEN}🎉 QR Scanner Trios Network Setup Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📋 Available Scripts:${NC}"
echo -e "   • ${GREEN}./start-network.sh${NC} - Start the application with network access"
echo -e "   • ${GREEN}./setup-firewall.sh${NC} - Configure firewall for network access"
echo -e "   • ${GREEN}./test-network.sh${NC} - Test network connectivity"
echo ""
echo -e "${BLUE}🚀 To start the application:${NC}"
echo -e "   ./start-network.sh"
echo ""
echo -e "${BLUE}🌐 Network Access URLs (after starting):${NC}"
echo -e "   • Frontend: http://$LOCAL_IP:$FRONTEND_PORT"
echo -e "   • Backend:  http://$LOCAL_IP:$BACKEND_PORT"
echo ""
echo -e "${YELLOW}💡 Tips for network access:${NC}"
echo -e "   • Run ./setup-firewall.sh if you can't access from other devices"
echo -e "   • Use ./test-network.sh to verify connectivity"
echo -e "   • For public access, install ngrok: brew install ngrok (macOS)"
echo ""
echo -e "${BLUE}📱 Test Credentials:${NC}"
echo -e "   • Email: test@cafe.com"
echo -e "   • Password: password123"
