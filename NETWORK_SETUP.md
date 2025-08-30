# 🌐 QR Scanner Trios - Network Setup Guide

This guide will help you run the QR Scanner Trios application locally and make it accessible from other devices on the same WiFi network, allowing customers to scan QR codes and place orders from their phones.

## 🚀 Quick Start

### 1. Run the Network Setup Script

```bash
chmod +x run-local-network.sh
./run-local-network.sh
```

### 2. Start the Application

```bash
./start-network.sh
```

### 3. Access from Other Devices

Once running, you'll see URLs like:
- **Local Access**: http://localhost:5173
- **Network Access**: http://192.168.1.100:5173 (your actual IP)

Share the **Network Access** URL with devices on the same WiFi network.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git** (to clone the repository)
- **Same WiFi network** for all devices

## 🔧 Detailed Setup

### Automatic Setup (Recommended)

The `run-local-network.sh` script will:

1. ✅ Check Node.js and npm installation
2. ✅ Detect your local IP address
3. ✅ Find available ports (5000 for backend, 5173 for frontend)
4. ✅ Install dependencies for both frontend and backend
5. ✅ Create environment files with network configuration
6. ✅ Initialize the database
7. ✅ Set up firewall rules (optional)
8. ✅ Create additional helper scripts

### Manual Setup

If you prefer manual setup:

#### Backend Configuration

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp env.example .env
   ```

4. **Edit `.env` for network access**:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASS=password
   DB_NAME=qr_ordering_db
   DB_PORT=5432

   # JWT Configuration
   JWT_SECRET=local-development-secret-key-change-in-production
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Configuration - Allow all origins for network access
   CORS_ORIGIN=*

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

5. **Initialize database**:
   ```bash
   npm run init-db
   ```

#### Frontend Configuration

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp env.example .env
   ```

4. **Edit `.env` for network access**:
   ```env
   # API Configuration - Use your local IP
   VITE_API_URL=http://192.168.1.100:5000/api

   # App Configuration
   VITE_APP_NAME=QR Ordering System
   VITE_APP_VERSION=1.0.0

   # Feature Flags
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_DEBUG_MODE=true
   ```

   **Replace `192.168.1.100` with your actual local IP address**

## 🌐 Network Access

### Finding Your Local IP

#### macOS
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### Linux
```bash
hostname -I
```

#### Windows
```bash
ipconfig | findstr "IPv4"
```

### Testing Network Connectivity

Run the network test script:
```bash
./test-network.sh
```

This will test both local and network access to your application.

### Troubleshooting Network Access

#### 1. Firewall Issues

Run the firewall setup script:
```bash
./setup-firewall.sh
```

#### 2. Antivirus Software

Some antivirus software may block network access. Temporarily disable it for testing.

#### 3. Router Settings

Ensure your router allows local network communication.

#### 4. Port Conflicts

If ports 5000 or 5173 are in use, the scripts will automatically find alternative ports.

## 📱 Using the Application

### 1. Cafe Owner Setup

1. **Access the application**: http://your-ip:5173
2. **Register/Login**: Use test credentials or create new account
   - Email: `test@cafe.com`
   - Password: `password123`
3. **Create your cafe profile**
4. **Add menu items**
5. **Create tables and generate QR codes**

### 2. Customer Experience

1. **Scan QR code** or visit the menu URL directly
2. **Browse menu** on mobile device
3. **Place order** with table number
4. **Track order** status

### 3. Order Management

1. **Cafe dashboard** shows real-time orders
2. **Update order status** (pending → confirmed → preparing → ready → completed)
3. **View order details** and customer information

## 🔧 Available Scripts

| Script | Purpose |
|--------|---------|
| `./run-local-network.sh` | Initial setup and configuration |
| `./start-network.sh` | Start application with network access |
| `./setup-firewall.sh` | Configure firewall for network access |
| `./test-network.sh` | Test network connectivity |

## 🌍 Public Access (Optional)

For access from anywhere on the internet:

### Using ngrok

1. **Install ngrok**:
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/
   ```

2. **Create tunnel**:
   ```bash
   ngrok http 5173
   ```

3. **Share the ngrok URL** with customers

### Using Cloudflare Tunnel

1. **Install cloudflared**:
   ```bash
   # macOS
   brew install cloudflared
   ```

2. **Create tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```

## 🔒 Security Considerations

### Development Environment

- ✅ CORS is set to `*` for easy testing
- ✅ JWT secret is development-only
- ✅ Database is local SQLite

### Production Deployment

- ❌ Never use `CORS_ORIGIN=*` in production
- ❌ Use strong JWT secrets
- ❌ Use proper database with authentication
- ❌ Enable HTTPS
- ❌ Implement rate limiting

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to server"

**Solution**: Check if servers are running
```bash
./test-network.sh
```

#### 2. "Access denied from other devices"

**Solution**: Configure firewall
```bash
./setup-firewall.sh
```

#### 3. "Port already in use"

**Solution**: Scripts automatically find alternative ports

#### 4. "Database connection failed"

**Solution**: Check database configuration in `.env` file

#### 5. "CORS errors"

**Solution**: Ensure `CORS_ORIGIN=*` in backend `.env`

### Debug Mode

Enable debug mode in frontend `.env`:
```env
VITE_ENABLE_DEBUG_MODE=true
```

### Logs

Check application logs:
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev
```

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Run the test scripts** to diagnose problems
3. **Check the console logs** for error messages
4. **Ensure all devices are on the same WiFi network**

## 🎯 Next Steps

Once your local network setup is working:

1. **Test with multiple devices** on the same network
2. **Create a cafe profile** and add menu items
3. **Generate QR codes** for tables
4. **Test the ordering flow** from customer perspective
5. **Consider deploying** to a cloud service for public access

---

**Happy ordering! 🍕☕**
