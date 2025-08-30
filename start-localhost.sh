#!/bin/bash

# QR Scanner Trios - Localhost Startup Script
echo "🚀 Starting QR Scanner Trios on Localhost..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Create environment files if they don't exist
echo -e "${BLUE}📝 Setting up environment files...${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cat > backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password
DB_NAME=qr_ordering_db
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Development Settings
USE_SQLITE=true
FORCE_SYNC=true
EOF
    echo -e "${GREEN}✅ Backend .env file created.${NC}"
else
    echo -e "${GREEN}✅ Backend .env file already exists.${NC}"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5001/api
EOF
    echo -e "${GREEN}✅ Frontend .env file created.${NC}"
else
    echo -e "${GREEN}✅ Frontend .env file already exists.${NC}"
fi

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
cd frontend
if npm run build; then
    echo -e "${GREEN}✅ Frontend build successful.${NC}"
else
    echo -e "${RED}❌ Frontend build failed.${NC}"
    exit 1
fi
cd ..

# Initialize database
echo -e "${BLUE}🗄️  Initializing database...${NC}"
cd backend
if npm run init-db; then
    echo -e "${GREEN}✅ Database initialized.${NC}"
else
    echo -e "${YELLOW}⚠️  Database initialization failed (this is normal if SQLite is not set up).${NC}"
fi
cd ..

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"

# Start backend in background
echo -e "${YELLOW}Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo -e "${YELLOW}Starting frontend server...${NC}"
cd frontend
npm run serve &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if services are running
echo -e "${BLUE}🔍 Checking service status...${NC}"

# Check backend
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:5001${NC}"
else
    echo -e "${RED}❌ Backend is not responding on http://localhost:5001${NC}"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend is not responding on http://localhost:3000${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Localhost development environment is ready!${NC}"
echo ""
echo -e "${YELLOW}📋 Service URLs:${NC}"
echo -e "${BLUE}• Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}• Backend API:${NC} http://localhost:5001"
echo -e "${BLUE}• Health Check:${NC} http://localhost:5001/health"
echo ""
echo -e "${YELLOW}📋 Test Accounts:${NC}"
echo -e "${BLUE}• Email:${NC} admin@example.com"
echo -e "${BLUE}• Password:${NC} password123"
echo ""
echo -e "${YELLOW}🛑 To stop all services, press Ctrl+C${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Services stopped.${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo -e "${BLUE}⏳ Services are running. Press Ctrl+C to stop...${NC}"
wait
