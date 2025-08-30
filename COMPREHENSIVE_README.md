# QR Scanner Trios - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Documentation Structure](#documentation-structure)
4. [System Architecture](#system-architecture)
5. [Features](#features)
6. [Technology Stack](#technology-stack)
7. [Installation & Setup](#installation--setup)
8. [Usage Guide](#usage-guide)
9. [API Documentation](#api-documentation)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [Support](#support)

## 🎯 Project Overview

QR Scanner Trios is a comprehensive QR code-based ordering system designed for cafes and restaurants. It enables customers to scan QR codes placed on tables to view menus and place orders directly from their smartphones, while cafe owners can manage their menus, track orders, and generate QR codes through an intuitive dashboard.

### 🎨 Visual Mockups

#### Landing Page
```
┌─────────────────────────────────────────────────────────────────┐
│ ☕ QR Ordering                    [Cafe Login]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Transform Your Cafe with                     │
│                       QR Ordering                               │
│                                                                 │
│         Streamline your cafe operations with our               │
│         innovative QR code ordering system.                    │
│                                                                 │
│         [Get Started]  [Learn more →]                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │    QR Code  │  │   Mobile    │  │   Coffee    │  │Analytics││
│  │ Generation  │  │   Design    │  │ Management  │  │Tracking ││
│  │             │  │             │  │             │  │         ││
│  │ Unique QR   │  │ Mobile-first│  │ Easy menu   │  │ Track   ││
│  │ codes for   │  │ design for  │  │ management  │  │ orders  ││
│  │ each cafe   │  │ customers   │  │ and updates │  │ & sales ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### Cafe Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard                    Welcome back, John!               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │ 🛒          │ │ 💰          │ │ ⚠️          │ │ ☕          ││
│ │ Total       │ │ Revenue     │ │ Pending     │ │ Menu        ││
│ │ Orders      │ │ ₹1,250      │ │ Orders      │ │ Items       ││
│ │ 45          │ │             │ │ 3           │ │ 12          ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Your QR Code                                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │              ┌─────────────┐                               │ │
│ │              │             │                               │ │
│ │              │   [QR CODE] │                               │ │
│ │              │             │                               │ │
│ │              └─────────────┘                               │ │
│ │                                                             │ │
│ │              Order Number: #12345                           │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Customer Menu Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ ☕ Coffee Corner                    [🛒 Cart (3)]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Categories: [Beverages] [Food] [Desserts]                      │
│                                                                 │
│ Table 5                                                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Beverages                                                       │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☕ Cappuccino                    ₹45.00  [+ Add]            │ │
│ │                                                             │ │
│ │ Rich espresso with steamed milk                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🫖 Green Tea                     ₹25.00  [+ Add]            │ │
│ │                                                             │ │
│ │ Refreshing green tea                                         │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    [View Cart & Checkout]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- Git
- PostgreSQL (production) or SQLite (development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd QR-Scanner-Trios

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend API URL

# Start development servers
cd ../backend && npm run dev
cd ../frontend && npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 📚 Documentation Structure

This project includes comprehensive documentation organized into the following files:

### Core Documentation
- **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - Detailed technical architecture and system design
- **[UI_DOCUMENTATION.md](./UI_DOCUMENTATION.md)** - User interface design, mockups, and user flows
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference and examples
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Setup and deployment instructions
- **[QR_CODE_SYSTEM.md](./QR_CODE_SYSTEM.md)** - QR code system implementation details

### Project Files
- **[README.md](./README.md)** - Original project README
- **[QR_CODE_SYSTEM.md](./QR_CODE_SYSTEM.md)** - QR code system documentation

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (SQLite/PostgreSQL) │
│                 │    │                 │    │                 │
│ • Customer UI   │    │ • REST API      │    │ • User Data     │
│ • Admin Dashboard│   │ • Authentication│    │ • Menu Items    │
│ • QR Scanner    │    │ • QR Generation │    │ • Orders        │
│ • Order Tracking│    │ • File Upload   │    │ • Tables        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │     │    Cafes    │     │    Tables   │
│             │     │             │     │             │
│ • id (PK)   │◄────┤ • id (PK)   │◄────┤ • id (PK)   │
│ • name      │     │ • name      │     │ • table_number│
│ • email     │     │ • address   │     │ • capacity  │
│ • password  │     │ • phone     │     │ • location  │
│ • role      │     │ • owner_id  │     │ • qr_code_data│
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    ▼                    │
       │              ┌─────────────┐            │
       │              │    Menus    │            │
       │              │             │            │
       │              │ • id (PK)   │            │
       │              │ • name      │            │
       │              │ • description│           │
       │              │ • price     │            │
       │              │ • category  │            │
       │              │ • cafe_id   │            │
       │              └─────────────┘            │
       │                    │                    │
       │                    ▼                    │
       │              ┌─────────────┐            │
       │              │   Orders    │            │
       │              │             │            │
       │              │ • id (PK)   │            │
       │              │ • order_number│          │
       │              │ • customer_name│         │
       │              │ • total_amount│          │
       │              │ • status    │            │
       │              │ • cafe_id   │            │
       │              │ • table_id  │            │
       │              └─────────────┘            │
       └────────────────────────────────────────┘
```

## ✨ Features

### For Cafe Owners
- **Dashboard Analytics**: Real-time order tracking, revenue analytics, and performance metrics
- **Menu Management**: Add, edit, and manage menu items with categories and availability
- **QR Code Generation**: Bulk QR code generation for tables with download functionality
- **Order Management**: Real-time order notifications and status updates
- **Table Management**: Configure tables with capacity and location settings
- **Customer Analytics**: Track customer preferences and order patterns

### For Customers
- **QR Code Scanning**: Scan QR codes to access cafe menus
- **Mobile-First Design**: Optimized interface for smartphone ordering
- **Category Browsing**: Browse menu items by categories
- **Cart Management**: Add items to cart with quantity control
- **Order Tracking**: Real-time order status updates
- **Special Instructions**: Add custom requests to orders

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Real-time Updates**: Live order status updates
- **Responsive Design**: Works on all device sizes
- **API-First Architecture**: RESTful API for easy integration
- **Database Optimization**: Efficient queries and indexing
- **Security**: Input validation, rate limiting, and CORS protection

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API communication
- **Lucide React**: Icon library
- **React Query**: Data fetching and caching

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Sequelize**: Object-Relational Mapping (ORM)
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **qrcode**: QR code generation library
- **Multer**: File upload middleware
- **Helmet**: Security middleware
- **CORS**: Cross-Origin Resource Sharing
- **Rate Limiting**: Request throttling

### Database
- **SQLite**: Development database
- **PostgreSQL**: Production database
- **Sequelize ORM**: Database abstraction layer

### Deployment
- **Docker**: Containerization
- **Vercel**: Frontend hosting
- **Render/Railway**: Backend hosting
- **Neon/Supabase**: Database hosting

## 📦 Installation & Setup

### Development Environment

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd QR-Scanner-Trios
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with backend API URL
   npm run dev
   ```

### Production Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed deployment instructions including:
- Docker deployment
- Cloud platform deployment (Vercel + Render)
- Traditional server deployment
- SSL/TLS configuration
- Security considerations

## 📖 Usage Guide

### Cafe Owner Workflow

1. **Registration & Setup**
   - Register account and create cafe profile
   - Set up tables and generate QR codes
   - Add menu items with categories and prices

2. **Daily Operations**
   - Monitor incoming orders on dashboard
   - Update order status (pending → preparing → ready → completed)
   - Manage menu availability and pricing

3. **Analytics & Management**
   - View revenue and order analytics
   - Track customer preferences
   - Manage table configurations

### Customer Workflow

1. **Ordering Process**
   - Scan QR code on table
   - Browse menu by categories
   - Add items to cart
   - Complete order with customer details

2. **Order Tracking**
   - Receive order confirmation
   - Track order status in real-time
   - Receive completion notification

## 🔌 API Documentation

The system provides a comprehensive RESTful API with the following endpoints:

### Authentication
- `POST /api/auth/register` - Register new cafe owner
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Cafe Management
- `GET /api/cafes/:id` - Get cafe details
- `PUT /api/cafes/:id` - Update cafe profile
- `POST /api/cafes/:id/qr` - Generate QR code
- `GET /api/cafes/:id/dashboard` - Get dashboard data

### Menu Management
- `GET /api/cafes/:id/menu` - Get cafe menu (public)
- `POST /api/menu` - Add menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Order Management
- `POST /api/orders` - Create new order (public)
- `GET /api/orders` - Get orders (filtered by cafe)
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/track/:orderNumber` - Track order (public)

### Table Management
- `POST /api/tables/cafe/:cafeId/bulk` - Create tables with QR codes
- `GET /api/tables/cafe/:cafeId` - Get cafe tables
- `POST /api/tables/:id/regenerate-qr` - Regenerate QR code

For complete API documentation with examples, see **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**.

## 🚀 Deployment

### Quick Deployment Options

1. **Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Vercel + Render**
   - Frontend: Deploy to Vercel
   - Backend: Deploy to Render
   - Database: Use Render PostgreSQL

3. **Railway**
   - Full-stack deployment with PostgreSQL

For detailed deployment instructions, see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**.

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add documentation for new features

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📞 Support

### Documentation
- **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - Technical details
- **[UI_DOCUMENTATION.md](./UI_DOCUMENTATION.md)** - UI/UX documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions

### Common Issues

**Backend won't start:**
- Check database connection
- Verify environment variables
- Check port availability

**Frontend build fails:**
- Clear node_modules and reinstall
- Check environment variables
- Verify API URL configuration

**QR codes not generating:**
- Check qrcode library installation
- Verify URL format
- Check file permissions

### Getting Help

1. Check the documentation files
2. Review existing issues on GitHub
3. Create a new issue with detailed information
4. Include error logs and environment details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- TailwindCSS team for the utility-first CSS framework
- All contributors and users of this project

---

**QR Scanner Trios** - Modernizing cafe operations through QR code technology.

For the most up-to-date information, always refer to the individual documentation files linked above.
