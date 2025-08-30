#!/bin/bash

echo "🚀 Starting QR Scanner Trios Frontend Server..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if .env file exists
if [ ! -f "frontend/.env" ]; then
    print_status "Creating frontend environment file..."
    cp frontend/env.local frontend/.env
    print_success "Created frontend/.env"
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    print_success "Dependencies installed"
fi

# Start the development server
print_status "Starting frontend server on http://localhost:5173"
print_status "Make sure backend is running on http://localhost:5001"
echo ""

npm run dev
