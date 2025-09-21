# QR Scanner Trios - Complete Working Solution

A comprehensive QR code-based restaurant ordering system with full authentication, menu management, order tracking, and table management capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zee71645-dotcom/qr-scanner-trios.git
   cd qr-scanner-trios
   ```

2. **Quick Setup (Recommended)**
   ```bash
   chmod +x setup-localhost.sh
   ./setup-localhost.sh
   ```

3. **Manual Setup**
   ```bash
   # Backend setup
   cd backend
   npm install
   cp env.local .env
   
   # Frontend setup
   cd ../frontend
   npm install
   cp env.local .env
   ```

4. **Start the application**
   ```bash
   # Start both servers
   ./start-apps.sh
   
   # Or start individually
   ./start-backend.sh
   ./start-frontend.sh
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/health

## 🔧 Key Features

### ✅ Authentication System
- **JWT-based authentication** with 30-day token expiration
- **Automatic token refresh** mechanism
- **Persistent login sessions** - no more automatic logouts
- **Role-based access control** (cafe owners)

### ✅ Menu Management
- Add, edit, delete menu items
- Category organization
- Price management
- Availability controls
- Image upload support

### ✅ Order Management
- Real-time order tracking
- Order status updates
- Customer information management
- Payment status tracking
- Order history

### ✅ Table Management
- Dynamic table creation
- QR code generation for each table
- Table status tracking
- Capacity management

### ✅ QR Code System
- Automatic QR code generation
- QR code regeneration
- Table-specific QR codes
- Customer ordering interface

## 🛠️ Technical Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database (local development)
- **Sequelize ORM** for database management
- **JWT** for authentication
- **Multer** for file uploads
- **CORS** enabled for frontend communication

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Context API** for state management

## 📁 Project Structure

```
qr-scanner-trios/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   └── server.js        # Main server file
│   ├── env.local           # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── main.jsx        # App entry point
│   ├── env.local          # Environment variables
│   └── package.json
├── *.sh                   # Utility scripts
└── *.md                  # Documentation
```

## 🔄 Available Scripts

### Setup Scripts
- `setup-localhost.sh` - Complete setup for localhost
- `start-apps.sh` - Start both backend and frontend
- `restart-servers.sh` - Restart both servers safely

### Utility Scripts
- `monitor-servers.sh` - Monitor and auto-restart servers
- `backup-data.sh` - Backup SQLite database
- `test-localhost.sh` - Test server connectivity

### Individual Scripts
- `start-backend.sh` - Start backend server only
- `start-frontend.sh` - Start frontend server only

## 🔐 Authentication

### Default Login Credentials
- **Email**: demo@cafe.com
- **Password**: password123

### Features
- **30-day JWT token expiration**
- **Automatic token refresh**
- **Persistent sessions**
- **Secure password hashing**

## 📊 Database

### SQLite Database (Local Development)
- **Location**: `backend/database.sqlite`
- **Auto-sync**: Tables created automatically
- **Sample data**: Included for testing
- **Persistence**: Data preserved between restarts

### Sample Data
- Demo cafe owner account
- Sample cafe with menu items
- Sample tables with QR codes
- Sample orders for testing

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   ./restart-servers.sh
   ```

2. **Database issues**
   ```bash
   ./backup-data.sh
   rm backend/database.sqlite
   ./restart-servers.sh
   ```

3. **Authentication problems**
   - Clear browser localStorage
   - Restart both servers
   - Check environment variables

4. **Frontend not loading**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Monitoring
```bash
# Monitor servers automatically
./monitor-servers.sh

# Check server status
./test-localhost.sh
```

## 📚 Documentation

- [PERSISTENT_SOLUTION.md](./PERSISTENT_SOLUTION.md) - Complete solution guide
- [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) - Localhost setup instructions
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints documentation
- [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - Technical details

## 🔄 Recent Fixes

### ✅ Resolved Issues
- **Automatic logout after 2 minutes** - Fixed with extended JWT expiration
- **Order Management not working** - Fixed API endpoint issues
- **Table creation problems** - Fixed frontend-backend integration
- **QR code generation issues** - Fixed table management
- **Data persistence** - Fixed database sync configuration

### 🆕 New Features
- **Token refresh mechanism**
- **Server monitoring and auto-restart**
- **Database backup system**
- **Comprehensive error handling**
- **Improved authentication flow**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the documentation files
3. Check the recent fixes section
4. Create an issue on GitHub

---

**Status**: ✅ **FULLY WORKING** - All features functional with persistent data and no automatic logout issues.
# Test CI/CD deployment - Sun Sep 21 17:39:04 IST 2025
