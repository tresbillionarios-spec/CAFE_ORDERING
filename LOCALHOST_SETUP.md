# 🏠 Localhost Setup Guide

This guide will help you set up and run the QR Scanner Trios application on your local machine.

## 📋 Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd QR-Scanner-Trios

# Make scripts executable
chmod +x *.sh

# Run the setup script
./setup-localhost.sh
```

### 2. Start the Application

#### Option A: Start Both Servers Together
```bash
./start-localhost.sh
```

#### Option B: Start Servers Separately
```bash
# Terminal 1 - Start Backend
./start-backend.sh

# Terminal 2 - Start Frontend
./start-frontend.sh
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 🧪 Testing Your Setup

Run the test script to verify everything is working:

```bash
./test-localhost.sh
```

## 📁 Project Structure

```
QR-Scanner-Trios/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   ├── .env               # Backend environment variables
│   └── package.json       # Backend dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── main.jsx       # Main React entry point
│   ├── .env              # Frontend environment variables
│   └── package.json      # Frontend dependencies
├── setup-localhost.sh     # Initial setup script
├── start-localhost.sh     # Start both servers
├── start-backend.sh       # Start backend only
├── start-frontend.sh      # Start frontend only
└── test-localhost.sh      # Test script
```

## 🔧 Configuration

### Environment Files

The setup script creates two environment files:

#### Backend (.env)
```env
# Database Configuration
USE_SQLITE=true
PORT=5001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
FORCE_SYNC=true
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=QR Ordering System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG_MODE=true
```

## 🗄️ Database

The application uses **SQLite** for local development, which means:
- No need to install PostgreSQL
- Database file is created automatically at `backend/database.sqlite`
- Tables are created automatically on first run

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :5001
lsof -i :5173

# Kill the process
kill -9 <PID>
```

#### 2. Node Modules Missing
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

#### 3. Environment Files Missing
```bash
# Copy environment files
cp backend/env.local backend/.env
cp frontend/env.local frontend/.env
```

#### 4. Database Issues
```bash
# Remove and recreate database
rm backend/database.sqlite
cd backend && npm run init-db
```

### Error Messages

#### "Module not found"
- Run `npm install` in the respective directory
- Check if `node_modules` folder exists

#### "Cannot connect to database"
- Make sure `USE_SQLITE=true` in backend `.env`
- Check if `database.sqlite` file exists in `backend/` directory

#### "CORS error"
- Verify `CORS_ORIGIN=http://localhost:5173` in backend `.env`
- Check if frontend is running on port 5173

## 🎯 Development Workflow

### 1. Start Development
```bash
./start-localhost.sh
```

### 2. Make Changes
- Edit files in `frontend/src/` for UI changes
- Edit files in `backend/src/` for API changes
- Both servers support hot reloading

### 3. Test Changes
```bash
./test-localhost.sh
```

### 4. Stop Servers
Press `Ctrl+C` in the terminal where servers are running

## 📱 Available Features

Once the application is running, you can:

1. **Create a Cafe Account**
   - Go to http://localhost:5173
   - Click "Create a new cafe account"
   - Fill in your cafe details

2. **Login to Your Cafe**
   - Use your email and password
   - Access your cafe dashboard

3. **Manage Your Menu**
   - Add, edit, and delete menu items
   - Set prices and descriptions
   - Upload images

4. **Generate QR Codes**
   - Create QR codes for each table
   - Customers can scan to view menu

5. **Manage Orders**
   - View incoming orders
   - Update order status
   - Track order history

## 🔐 Default Test Account

You can create a test account with:
- **Email**: test@example.com
- **Password**: password123

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Run `./test-localhost.sh` to diagnose problems
3. Check the console output for error messages
4. Verify all environment files are properly configured

## 🚀 Next Steps

After successful localhost setup:

1. Explore the application features
2. Customize the UI and functionality
3. Add new features to the codebase
4. Deploy to production when ready

---

**Happy Coding! 🎉**
