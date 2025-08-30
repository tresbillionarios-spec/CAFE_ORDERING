#!/bin/bash

# QR Scanner Trios - Render.com Deployment Script
echo "🚀 Preparing QR Scanner Trios for Render.com deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo "❌ No GitHub remote found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/qr-scanner-trios.git"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing code to GitHub..."
git add .
git commit -m "Ready for Render.com deployment" || echo "No changes to commit"
git push origin main

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🌐 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Sign up with your GitHub account"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository"
echo "5. Configure:"
echo "   - Name: qr-scanner-trios-backend"
echo "   - Environment: Node"
echo "   - Build Command: cd backend && npm install"
echo "   - Start Command: cd backend && npm start"
echo "   - Plan: Free"
echo ""
echo "🔧 Environment Variables to set:"
echo "NODE_ENV=production"
echo "PORT=10000"
echo "JWT_SECRET=your-super-secret-jwt-key"
echo "CORS_ORIGIN=https://qr-scanner-trios-backend.onrender.com"
echo "FRONTEND_URL=https://qr-scanner-trios-backend.onrender.com"
echo ""
echo "🎯 Your app will be live at: https://qr-scanner-trios-backend.onrender.com"
