#!/bin/bash

echo "🚀 Starting QR Scanner Trios Full Stack Application..."

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

# Check if .env files exist and create them if needed
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend environment file..."
    cp backend/env.local backend/.env
    print_success "Created backend/.env"
fi

if [ ! -f "frontend/.env" ]; then
    print_status "Creating frontend environment file..."
    cp frontend/env.local frontend/.env
    print_success "Created frontend/.env"
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    print_warning "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
print_status "Starting backend server..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start backend in background
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

print_success "Backend server started (PID: $BACKEND_PID)"

# Go back to root directory
cd ..

# Start frontend server
print_status "Starting frontend server..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        kill $BACKEND_PID
        exit 1
    fi
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID
    exit 1
fi

print_success "Frontend server started (PID: $FRONTEND_PID)"

# Go back to root directory
cd ..

echo ""
print_success "🎉 Both servers are running!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5001"
echo "🏥 Health Check: http://localhost:5001/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop
wait
