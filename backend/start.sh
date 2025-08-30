#!/bin/bash

echo "🚀 Starting QR Scanner Trios Backend..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
    echo "📱 Production environment detected"
    
    # Wait for database to be ready
    echo "⏳ Waiting for database connection..."
    sleep 5
    
    # Start the application
    echo "🔧 Starting Node.js application..."
    npm start
else
    echo "🔧 Development environment detected"
    npm start
fi
