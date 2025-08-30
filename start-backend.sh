#!/bin/bash

echo "🚀 Starting QR Scanner Trios Backend Server..."

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
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend environment file..."
    cp backend/env.local backend/.env
    print_success "Created backend/.env"
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    print_success "Dependencies installed"
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the server
print_status "Starting backend server on http://localhost:5001"
print_status "Health check: http://localhost:5001/health"
echo ""

npm run dev

