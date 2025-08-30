#!/bin/bash

echo "🔄 Safely restarting QR Scanner Trios servers..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Stop existing servers
print_status "Stopping existing servers..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend environment file..."
    cp backend/env.local backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    print_status "Creating frontend environment file..."
    cp frontend/env.local frontend/.env
fi

# Start backend server
print_status "Starting backend server..."
cd backend
node src/server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_success "Backend server started (PID: $BACKEND_PID)"
else
    print_warning "Backend failed to start"
    exit 1
fi

# Start frontend server
print_status "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    print_success "Frontend server started (PID: $FRONTEND_PID)"
else
    print_warning "Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Test the servers
print_status "Testing servers..."
sleep 2

if curl -s http://localhost:5001/health > /dev/null; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed"
fi

if curl -s http://localhost:5173 > /dev/null; then
    print_success "Frontend server is responding"
else
    print_warning "Frontend server not responding"
fi

echo ""
print_success "🎉 Servers restarted successfully!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5001"
echo "🏥 Health Check: http://localhost:5001/health"
echo ""
echo "🔐 Demo Login:"
echo "   Email: demo@cafe.com"
echo "   Password: password123"
echo ""
echo "💾 Your data is preserved - no data loss!"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Keep script running
wait
