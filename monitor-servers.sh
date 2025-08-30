#!/bin/bash

echo "🔍 Starting server monitor..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if server is running
check_server() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to restart backend
restart_backend() {
    print_warning "Backend server is down. Restarting..."
    
    # Kill any existing backend processes
    pkill -f "node.*server.js" 2>/dev/null || true
    
    # Start backend
    cd backend
    node src/server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    if check_server "http://localhost:5001/health" "Backend"; then
        print_success "Backend server restarted successfully (PID: $BACKEND_PID)"
    else
        print_error "Failed to restart backend server"
    fi
}

# Function to restart frontend
restart_frontend() {
    print_warning "Frontend server is down. Restarting..."
    
    # Kill any existing frontend processes
    pkill -f "vite" 2>/dev/null || true
    
    # Start frontend
    cd frontend
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
    
    if check_server "http://localhost:5173" "Frontend"; then
        print_success "Frontend server restarted successfully (PID: $FRONTEND_PID)"
    else
        print_error "Failed to restart frontend server"
    fi
}

# Create logs directory
mkdir -p logs

# Initial server check and start
print_status "Checking server status..."

# Check backend
if ! check_server "http://localhost:5001/health" "Backend"; then
    print_warning "Backend server is not running. Starting..."
    restart_backend
else
    print_success "Backend server is running"
fi

# Check frontend
if ! check_server "http://localhost:5173" "Frontend"; then
    print_warning "Frontend server is not running. Starting..."
    restart_frontend
else
    print_success "Frontend server is running"
fi

print_status "Starting server monitor (checking every 30 seconds)..."
echo "Press Ctrl+C to stop monitoring"
echo ""

# Monitor loop
while true; do
    # Check backend
    if ! check_server "http://localhost:5001/health" "Backend"; then
        print_error "Backend server is down!"
        restart_backend
    fi
    
    # Check frontend
    if ! check_server "http://localhost:5173" "Frontend"; then
        print_error "Frontend server is down!"
        restart_frontend
    fi
    
    # Wait 30 seconds before next check
    sleep 30
done
