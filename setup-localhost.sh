#!/bin/bash

echo "🚀 Setting up QR Scanner Trios for localhost development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Create environment files
print_status "Creating environment files..."

# Backend environment file
if [ ! -f "backend/.env" ]; then
    cp backend/env.local backend/.env
    print_success "Created backend/.env"
else
    print_warning "backend/.env already exists"
fi

# Frontend environment file
if [ ! -f "frontend/.env" ]; then
    cp frontend/env.local frontend/.env
    print_success "Created frontend/.env"
else
    print_warning "frontend/.env already exists"
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
else
    print_warning "Backend node_modules already exists"
fi

# Initialize database
print_status "Initializing database..."
npm run init-db
if [ $? -eq 0 ]; then
    print_success "Database initialized"
else
    print_warning "Database initialization failed (this might be normal if using SQLite)"
fi

cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
else
    print_warning "Frontend node_modules already exists"
fi

cd ..

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p backend/uploads
print_success "Uploads directory created"

# Set permissions
print_status "Setting file permissions..."
chmod +x setup-localhost.sh
chmod +x start-localhost.sh
chmod +x start-backend.sh
chmod +x start-frontend.sh

print_success "Setup completed successfully!"

echo ""
echo "🎉 Setup Complete! Here's what you can do next:"
echo ""
echo "1. Start the backend server:"
echo "   ./start-backend.sh"
echo ""
echo "2. Start the frontend server (in a new terminal):"
echo "   ./start-frontend.sh"
echo ""
echo "3. Or start both together:"
echo "   ./start-localhost.sh"
echo ""
echo "4. Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:5001"
echo "   Health Check: http://localhost:5001/health"
echo ""
echo "📝 Note: Make sure to copy the environment files:"
echo "   cp backend/env.local backend/.env"
echo "   cp frontend/env.local frontend/.env"
echo ""
