#!/bin/bash

echo "🚀 Starting QR Scanner Trios Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Development environment is ready!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/health"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f"
