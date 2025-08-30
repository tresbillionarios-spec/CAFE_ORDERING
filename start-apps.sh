#!/bin/bash

echo "🚀 Starting QR Scanner Trios Applications..."

# Kill any existing processes
echo "🛑 Stopping any existing processes..."
pkill -f "node" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Start backend on port 5001
echo "📦 Starting Backend on port 5001..."
cd backend
PORT=5001 npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend on port 3000
echo "📦 Starting Frontend on port 3000..."
cd frontend
npm run build
npm run serve &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

echo ""
echo "🎉 Applications are starting..."
echo ""
echo "📋 Service URLs:"
echo "• Frontend: http://localhost:3000"
echo "• Backend: http://localhost:5001"
echo "• Health Check: http://localhost:5001/health"
echo ""
echo "📋 Test Account:"
echo "• Email: admin@example.com"
echo "• Password: password123"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
