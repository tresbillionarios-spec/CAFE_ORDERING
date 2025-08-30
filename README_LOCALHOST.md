# 🏠 QR Scanner Trios - Localhost Development Guide

## 🎯 Quick Start (5 minutes)

### 1. Setup Environment
```bash
# Copy environment files
cp backend/env.local backend/.env
cp frontend/env.local frontend/.env

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Create uploads directory
mkdir -p backend/uploads
```

### 2. Start Application
```bash
# Start both servers
./start-localhost.sh
```

### 3. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 📋 What's Included

### ✅ Backend Features
- **Express.js API Server** (Port 5001)
- **SQLite Database** (No PostgreSQL required)
- **JWT Authentication**
- **File Upload Support**
- **CORS Configuration**
- **Rate Limiting**
- **Security Headers**

### ✅ Frontend Features
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Context API** for state management
- **QR Code Generation**
- **Responsive Design**

### ✅ Available Pages
1. **Home Page** - Landing page with features
2. **Cafe Login/Register** - Authentication
3. **Cafe Dashboard** - Overview and stats
4. **Menu Management** - Add/edit menu items
5. **QR Code Management** - Generate table QR codes
6. **Order Management** - View and manage orders
7. **Table Management** - Manage cafe tables
8. **Cafe Profile** - Update cafe information

## 🛠️ Development Scripts

| Script | Description |
|--------|-------------|
| `./setup-localhost.sh` | Complete initial setup |
| `./start-localhost.sh` | Start both servers |
| `./start-backend.sh` | Start backend only |
| `./start-frontend.sh` | Start frontend only |
| `./test-localhost.sh` | Test all endpoints |
| `./quick-test.sh` | Quick setup verification |

## 🔧 Configuration

### Backend Environment (.env)
```env
USE_SQLITE=true
PORT=5001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
FORCE_SYNC=true
```

### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=QR Ordering System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG_MODE=true
```

## 🗄️ Database

- **Type**: SQLite (file-based)
- **Location**: `backend/database.sqlite`
- **Auto-creation**: Tables created on first run
- **No setup required**: Works out of the box

## 🧪 Testing Your Setup

### 1. Quick Verification
```bash
./quick-test.sh
```

### 2. Full Testing
```bash
./test-localhost.sh
```

### 3. Manual Testing
```bash
# Test backend health
curl http://localhost:5001/health

# Test frontend
curl http://localhost:5173
```

## 🚀 Development Workflow

### 1. Start Development
```bash
./start-localhost.sh
```

### 2. Make Changes
- **Frontend**: Edit files in `frontend/src/`
- **Backend**: Edit files in `backend/src/`
- **Hot Reload**: Both servers support auto-reload

### 3. Test Changes
```bash
./test-localhost.sh
```

### 4. Stop Servers
Press `Ctrl+C` in the terminal

## 📱 Application Features

### For Cafe Owners
1. **Account Management**
   - Register new cafe account
   - Login with email/password
   - Update cafe profile

2. **Menu Management**
   - Add menu items with images
   - Set prices and descriptions
   - Categorize items
   - Bulk operations

3. **QR Code System**
   - Generate QR codes for tables
   - Customize QR code design
   - Track QR code usage

4. **Order Management**
   - View incoming orders
   - Update order status
   - Order history and analytics
   - Real-time notifications

5. **Table Management**
   - Add/remove tables
   - Assign QR codes to tables
   - Table status tracking

### For Customers
1. **Menu Browsing**
   - Scan QR code to view menu
   - Browse by categories
   - View item details and images

2. **Ordering**
   - Add items to cart
   - Customize orders
   - Place orders
   - Track order status

## 🔐 Authentication

### Test Account
- **Email**: test@example.com
- **Password**: password123

### JWT Tokens
- **Expiration**: 7 days
- **Storage**: LocalStorage
- **Auto-refresh**: Not implemented (manual login required)

## 📁 File Structure

```
QR-Scanner-Trios/
├── backend/
│   ├── src/
│   │   ├── config/database.js    # Database configuration
│   │   ├── models/               # Sequelize models
│   │   ├── routes/               # API routes
│   │   ├── middleware/auth.js    # JWT authentication
│   │   └── server.js             # Main server file
│   ├── uploads/                  # File uploads directory
│   ├── database.sqlite           # SQLite database
│   ├── .env                      # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   ├── contexts/AuthContext.jsx
│   │   ├── services/api.js       # API service functions
│   │   └── main.jsx              # React entry point
│   ├── .env                      # Environment variables
│   └── package.json
├── *.sh                          # Development scripts
└── README_LOCALHOST.md           # This file
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using the ports
lsof -i :5001
lsof -i :5173

# Kill processes
kill -9 <PID>
```

#### 2. Module Not Found
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

#### 3. Database Issues
```bash
# Reset database
rm backend/database.sqlite
cd backend && npm run init-db
```

#### 4. CORS Errors
- Verify `CORS_ORIGIN=http://localhost:5173` in backend `.env`
- Check if frontend is running on port 5173

#### 5. Environment Files Missing
```bash
# Copy environment files
cp backend/env.local backend/.env
cp frontend/env.local frontend/.env
```

### Error Solutions

| Error | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` in respective directory |
| "Port already in use" | Kill process or change port in `.env` |
| "Database connection failed" | Check `USE_SQLITE=true` in backend `.env` |
| "CORS error" | Verify CORS_ORIGIN in backend `.env` |
| "JWT token invalid" | Clear localStorage and login again |

## 🎯 Next Steps

### 1. Explore Features
- Create a cafe account
- Add menu items
- Generate QR codes
- Test the ordering flow

### 2. Customize
- Modify UI components
- Add new features
- Customize styling
- Extend API endpoints

### 3. Deploy
- Set up production database
- Configure environment variables
- Deploy to hosting platform
- Set up domain and SSL

## 📞 Support

### Getting Help
1. Check this README
2. Run `./quick-test.sh` for setup verification
3. Check console output for error messages
4. Verify environment file configuration

### Debug Mode
Enable debug mode in frontend `.env`:
```env
VITE_ENABLE_DEBUG_MODE=true
```

### Logs
- **Backend**: Check terminal output
- **Frontend**: Check browser console
- **Database**: Check `backend/database.sqlite`

---

## 🎉 Ready to Start!

Your QR Scanner Trios application is now ready for localhost development!

**Quick Commands:**
```bash
./start-localhost.sh    # Start both servers
./test-localhost.sh     # Test everything
./quick-test.sh         # Verify setup
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5001
- Health: http://localhost:5001/health

Happy coding! 🚀
