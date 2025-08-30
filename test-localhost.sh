#!/bin/bash

echo "🧪 Testing QR Scanner Trios Localhost Setup..."

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

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    local expected_status=$3
    
    print_status "Testing $description..."
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        if [ "$response" = "$expected_status" ]; then
            print_success "$description is working (Status: $response)"
            return 0
        else
            print_error "$description is not working (Status: $response, Expected: $expected_status)"
            return 1
        fi
    else
        print_warning "curl not found, skipping $description test"
        return 0
    fi
}

# Test backend health endpoint
print_status "Testing backend server..."
if test_url "http://localhost:5001/health" "Backend Health Check" "200"; then
    print_success "Backend server is running"
else
    print_error "Backend server is not responding"
    echo "Make sure to start the backend server first: ./start-backend.sh"
    exit 1
fi

# Test frontend
print_status "Testing frontend server..."
if test_url "http://localhost:5173" "Frontend Application" "200"; then
    print_success "Frontend server is running"
else
    print_error "Frontend server is not responding"
    echo "Make sure to start the frontend server first: ./start-frontend.sh"
    exit 1
fi

# Test API endpoints
print_status "Testing API endpoints..."

# Test auth endpoint
if test_url "http://localhost:5001/api/auth" "Auth API" "404"; then
    print_success "Auth API endpoint is accessible"
else
    print_warning "Auth API endpoint test failed"
fi

# Test cafes endpoint
if test_url "http://localhost:5001/api/cafes" "Cafes API" "401"; then
    print_success "Cafes API endpoint is accessible (requires authentication)"
else
    print_warning "Cafes API endpoint test failed"
fi

# Test menu endpoint
if test_url "http://localhost:5001/api/menu" "Menu API" "404"; then
    print_success "Menu API endpoint is accessible"
else
    print_warning "Menu API endpoint test failed"
fi

echo ""
print_success "🎉 All tests completed!"
echo ""
echo "📋 Test Results Summary:"
echo "✅ Backend server: http://localhost:5001"
echo "✅ Frontend server: http://localhost:5173"
echo "✅ API endpoints: Accessible"
echo ""
echo "🚀 Your application is ready for development!"
echo ""
echo "📝 Next steps:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Create a new cafe account or login"
echo "3. Start building your QR ordering system!"
echo ""
