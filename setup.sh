#!/bin/bash

echo "🚀 Setting up QR Scanner Trios Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Backend setup
echo -e "\n${YELLOW}📦 Setting up Backend...${NC}"
cd backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Initialize database
print_status "Initializing database..."
npm run init-db

cd ..

# Frontend setup
echo -e "\n${YELLOW}📦 Setting up Frontend...${NC}"
cd frontend

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

cd ..

# Create start script
echo -e "\n${YELLOW}📝 Creating start script...${NC}"
cat > start-app.sh << 'EOF'
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
EOF

chmod +x start-app.sh

print_status "Setup completed successfully!"
echo -e "\n${GREEN}🎉 Your QR Scanner Trios application is ready!${NC}"
echo ""
echo "To start the application, run:"
echo "  ./start-app.sh"
echo ""
echo "Or start them separately:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Test credentials:"
echo "  Email: test@cafe.com"
echo "  Password: password123"
echo ""
echo "Frontend URL: http://localhost:5173"
echo "Backend URL: http://localhost:5000"
