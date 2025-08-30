#!/bin/bash

echo "🚀 QR Scanner Trios - Quick Start with Network Access"
echo "====================================================="

# Check if setup has been done
if [ ! -f "start-network.sh" ]; then
    echo "📦 First time setup detected..."
    echo "Running initial setup..."
    ./run-local-network.sh
fi

# Start the application
echo "🚀 Starting application with network access..."
./start-network.sh
