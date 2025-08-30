#!/bin/bash

echo "🚀 Starting QR Scanner Trios Application..."

# Start backend
echo "📦 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "📦 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:5000"
echo "📊 Health check: http://localhost:5000/health"
echo ""
echo "Test credentials:"
echo "Email: test@cafe.com"
echo "Password: password123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
