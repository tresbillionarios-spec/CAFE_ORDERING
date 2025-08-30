#!/bin/bash

echo "🚀 Starting Backend Server..."

# Set environment variables
export PORT=5001
export NODE_ENV=development
export USE_SQLITE=true
export JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
export JWT_EXPIRES_IN=7d

# Kill any existing processes on port 5001
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Start the server
cd backend && npm run dev

