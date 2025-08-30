#!/bin/bash

# QR Scanner Trios - Render Deployment Setup Script
echo "🚀 Setting up QR Scanner Trios for Render deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed.${NC}"

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Check if backend and frontend directories exist
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Backend or frontend directory not found. Please ensure you're in the correct project directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project structure verified.${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"

echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
if npm ci --only=production; then
    echo -e "${GREEN}✅ Backend dependencies installed.${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies.${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd ../frontend
if npm ci; then
    echo -e "${GREEN}✅ Frontend dependencies installed.${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies.${NC}"
    exit 1
fi

cd ..

# Test builds
echo -e "${BLUE}🔨 Testing builds...${NC}"

echo -e "${YELLOW}Testing frontend build...${NC}"
cd frontend
if npm run build; then
    echo -e "${GREEN}✅ Frontend build successful.${NC}"
    # Clean up build artifacts
    rm -rf dist
else
    echo -e "${RED}❌ Frontend build failed.${NC}"
    exit 1
fi

cd ..

# Check Git status
echo -e "${BLUE}📝 Checking Git status...${NC}"

if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
    echo -e "${GREEN}✅ Git repository initialized.${NC}"
else
    echo -e "${GREEN}✅ Git repository already exists.${NC}"
fi

# Check for remote origin
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  No GitHub remote found.${NC}"
    echo -e "${BLUE}Please add your GitHub repository:${NC}"
    echo "   git remote add origin https://github.com/yourusername/qr-scanner-trios.git"
    echo ""
    echo -e "${YELLOW}After adding the remote, run:${NC}"
    echo "   git push -u origin main"
else
    echo -e "${GREEN}✅ GitHub remote is configured.${NC}"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${BLUE}📝 Creating .gitignore file...${NC}"
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
frontend/dist/
backend/uploads/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database files
*.sqlite
*.sqlite3
backend/database.sqlite

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp
EOF
    echo -e "${GREEN}✅ .gitignore file created.${NC}"
fi

# Final status
echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo -e "${BLUE}1. Add your GitHub remote (if not already done):${NC}"
echo "   git remote add origin https://github.com/yourusername/qr-scanner-trios.git"
echo ""
echo -e "${BLUE}2. Push to GitHub:${NC}"
echo "   git add ."
echo "   git commit -m 'Ready for Render deployment'"
echo "   git push origin main"
echo ""
echo -e "${BLUE}3. Deploy to Render:${NC}"
echo "   - Go to https://render.com"
echo "   - Sign up with your GitHub account"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your repository"
echo "   - Render will automatically configure everything"
echo ""
echo -e "${GREEN}🚀 Your QR Scanner Trios app will be live at:${NC}"
echo "   • Frontend: https://qr-scanner-trios-frontend.onrender.com"
echo "   • Backend: https://qr-scanner-trios-backend.onrender.com"
echo ""
echo -e "${YELLOW}📚 For detailed instructions, see: DEPLOYMENT_GUIDE.md${NC}"
