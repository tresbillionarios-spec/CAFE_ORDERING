# QR Scanner Trios - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [User Interface Documentation](#user-interface-documentation)
7. [API Documentation](#api-documentation)
8. [QR Code System](#qr-code-system)
9. [Authentication & Security](#authentication--security)
10. [Deployment Guide](#deployment-guide)
11. [Development Guide](#development-guide)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is QR Scanner Trios?

QR Scanner Trios is a comprehensive QR code-based ordering system designed for cafes and restaurants. It allows customers to scan QR codes placed on tables to view menus and place orders directly from their smartphones, while cafe owners can manage their menus, track orders, and generate QR codes through an intuitive dashboard.

### Key Features

- **QR Code Generation**: Unique QR codes for each cafe and table
- **Menu Management**: Add, edit, and manage menu items with categories
- **Order Processing**: Real-time order tracking and status updates
- **Table Management**: Bulk table creation with automatic QR generation
- **Customer Interface**: Mobile-optimized ordering experience
- **Analytics Dashboard**: Order tracking, revenue analytics, and insights
- **Multi-Cafe Support**: Support for multiple cafes in the same location

### Target Users

1. **Cafe Owners**: Manage menus, track orders, generate QR codes
2. **Customers**: Scan QR codes, browse menus, place orders
3. **Kitchen Staff**: View and update order status

---

## System Architecture

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

### Technology Stack

#### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **QR Code Generation**: qrcode library
- **Security**: Helmet, CORS, Rate Limiting

#### Database
- **Primary**: SQLite (Development)
- **Production**: PostgreSQL (Neon/Supabase)
- **ORM**: Sequelize

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │     │    Cafes    │     │    Tables   │
│             │     │             │     │             │
│ • id        │◄────┤ • id        │◄────┤ • id        │
│ • name      │     │ • name      │     │ • table_number│
│ • email     │     │ • address   │     │ • capacity  │
│ • password  │     │ • phone     │     │ • location  │
│ • role      │     │ • owner_id  │     │ • qr_code_data│
│ • created_at│     │ • created_at│     │ • cafe_id   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       │                    ▼                    │
       │              ┌─────────────┐            │
       │              │    Menus    │            │
       │              │             │            │
       │              │ • id        │            │
       │              │ • name      │            │
       │              │ • description│           │
       │              │ • price     │            │
       │              │ • category  │            │
       │              │ • is_available│          │
       │              │ • cafe_id   │            │
       │              └─────────────┘            │
       │                    │                    │
       │                    ▼                    │
       │              ┌─────────────┐            │
       │              │   Orders    │            │
       │              │             │            │
       │              │ • id        │            │
       │              │ • order_number│          │
       │              │ • customer_name│         │
       │              │ • customer_phone│        │
       │              │ • total_amount│          │
       │              │ • status    │            │
       │              │ • cafe_id   │            │
       │              │ • table_id  │            │
       │              └─────────────┘            │
       │                    │                    │
       │                    ▼                    │
       │              ┌─────────────┐            │
       │              │ OrderItems  │            │
       │              │             │            │
       │              │ • id        │            │
       │              │ • quantity  │            │
       │              │ • price     │            │
       │              │ • special_instructions│  │
       │              │ • order_id  │            │
       │              │ • menu_id   │            │
       │              └─────────────┘            │
       └────────────────────────────────────────┘
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('cafe_owner', 'customer') DEFAULT 'cafe_owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Cafes Table
```sql
CREATE TABLE cafes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  description TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tables Table
```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL,
  name VARCHAR(255),
  capacity INTEGER DEFAULT 4,
  location VARCHAR(255) DEFAULT 'main',
  is_active BOOLEAN DEFAULT true,
  qr_code_url TEXT,
  qr_code_data TEXT,
  qr_code_image TEXT, -- Base64 encoded PNG
  cafe_id UUID REFERENCES cafes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Menus Table
```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  cafe_id UUID REFERENCES cafes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
  special_instructions TEXT,
  cafe_id UUID REFERENCES cafes(id),
  table_id UUID REFERENCES tables(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### OrderItems Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  order_id UUID REFERENCES orders(id),
  menu_id UUID REFERENCES menus(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.jsx       # Main layout wrapper
│   ├── PrivateRoute.jsx # Authentication guard
│   ├── LoadingSpinner.jsx # Loading indicator
│   ├── AddMenuItemModal.jsx # Menu item form
│   ├── TableSetupModal.jsx # Table configuration
│   ├── QRCodeGenerator.jsx # QR code display
│   └── BulkQRCodeGenerator.jsx # Bulk QR generation
├── pages/               # Page components
│   ├── HomePage.jsx     # Landing page
│   ├── CafeLoginPage.jsx # Authentication
│   ├── CafeCreationPage.jsx # Cafe registration
│   ├── CafeDashboardPage.jsx # Main dashboard
│   ├── MenuManagementPage.jsx # Menu CRUD
│   ├── OrderManagementPage.jsx # Order tracking
│   ├── TableManagementPage.jsx # Table management
│   ├── QRCodeManagementPage.jsx # QR code management
│   ├── MenuPage.jsx     # Customer menu view
│   ├── OrderPage.jsx    # Customer ordering
│   └── OrderTrackingPage.jsx # Order status
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication state
├── services/            # API services
│   └── api.js          # HTTP client configuration
└── main.jsx            # Application entry point
```

### State Management

The application uses React Context API for global state management:

#### AuthContext
```javascript
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  loading: false
});
```

#### State Flow
```
User Action → API Call → Context Update → UI Re-render
```

### Routing Structure

```javascript
// Public Routes
/                    → HomePage
/login              → CafeLoginPage
/menu/:cafeId       → MenuPage (Customer)
/order/:cafeId      → OrderPage (Customer)
/track/:orderNumber → OrderTrackingPage (Customer)

// Protected Routes (Cafe Owner)
/dashboard          → CafeDashboardPage
/menu-management    → MenuManagementPage
/orders             → OrderManagementPage
/profile            → CafeProfilePage
/create-cafe        → CafeCreationPage
/tables             → TableManagementPage
/qr-codes           → QRCodeManagementPage
/qr-demo            → QRCodeDemoPage
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Database connection
│   ├── middleware/      # Custom middleware
│   │   └── auth.js      # JWT authentication
│   ├── models/          # Sequelize models
│   │   ├── index.js     # Model associations
│   │   ├── User.js      # User model
│   │   ├── Cafe.js      # Cafe model
│   │   ├── Menu.js      # Menu model
│   │   ├── Order.js     # Order model
│   │   ├── OrderItem.js # OrderItem model
│   │   └── Table.js     # Table model
│   ├── routes/          # API routes
│   │   ├── auth.js      # Authentication routes
│   │   ├── cafes.js     # Cafe management
│   │   ├── menu.js      # Menu CRUD
│   │   ├── orders.js    # Order processing
│   │   └── tables.js    # Table management
│   └── server.js        # Express server
├── package.json
└── .env
```

### Middleware Stack

```javascript
// Security Middleware
app.use(helmet());                    // Security headers
app.use(cors());                      // CORS configuration
app.use(rateLimit());                 // Rate limiting

// Body Parsing
app.use(express.json());              // JSON parsing
app.use(express.urlencoded());        // URL encoding

// Static Files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
```

### Authentication Flow

```
1. User Login Request
   ↓
2. Validate Credentials
   ↓
3. Generate JWT Token
   ↓
4. Return Token to Client
   ↓
5. Client Stores Token
   ↓
6. Token Sent with Requests
   ↓
7. Middleware Validates Token
   ↓
8. Grant/Deny Access
```

---

## User Interface Documentation

### 1. Landing Page (HomePage)

**Purpose**: Introduce the system to potential cafe owners and customers

**Key Elements**:
- Hero section with value proposition
- Feature highlights with icons
- Call-to-action buttons
- Professional design with coffee theme

**Mockup**:
```
┌─────────────────────────────────────────────────────────┐
│ ☕ QR Ordering                    [Cafe Login]          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           Transform Your Cafe with                      │
│              QR Ordering                                │
│                                                         │
│    Streamline your cafe operations with our            │
│    innovative QR code ordering system.                  │
│                                                         │
│    [Get Started]  [Learn more →]                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [QR Code] [Mobile] [Coffee] [Analytics]               │
│  Generation Design Management Tracking                  │
│                                                         │
│  Ready to get started?                                 │
│  [Start Your Free Trial]                               │
└─────────────────────────────────────────────────────────┘
```

### 2. Cafe Dashboard (CafeDashboardPage)

**Purpose**: Main control center for cafe owners

**Key Elements**:
- Statistics cards (orders, revenue, pending orders, menu items)
- QR code display
- Recent orders table
- Real-time updates

**Mockup**:
```
┌─────────────────────────────────────────────────────────┐
│ Dashboard                    Welcome back, John!        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ 🛒      │ │ 💰      │ │ ⚠️      │ │ ☕      │        │
│ │ Total   │ │ Revenue │ │ Pending │ │ Menu   │        │
│ │ Orders  │ │ ₹1,250  │ │ Orders  │ │ Items  │        │
│ │   45    │ │         │ │    3    │ │   12   │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ Your QR Code                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │              [QR CODE IMAGE]                        │ │
│ │                                                     │ │
│ │              Order Number: #12345                   │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Recent Orders                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Order │ Customer │ Amount │ Status │ Time           │ │
│ │ #123  │ John Doe │ ₹45.00 │ Ready  │ 2:30 PM       │ │
│ │ #124  │ Jane Smith│ ₹32.50│ Pending│ 2:25 PM       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3. Menu Management (MenuManagementPage)

**Purpose**: Add, edit, and manage menu items

**Key Elements**:
- Menu items list with categories
- Add/Edit modal forms
- Availability toggles
- Image upload functionality

**Mockup**:
```
┌─────────────────────────────────────────────────────────┐
│ Menu Management              [+ Add Menu Item]          │
├─────────────────────────────────────────────────────────┤
│ Categories: [All] [Beverages] [Food] [Desserts]        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☕ Cappuccino                    ₹45.00  [Edit] [×] │ │
│ │   Rich espresso with steamed milk                   │ │
│ │   Available: ✅                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🍰 Chocolate Cake                ₹85.00  [Edit] [×] │ │
│ │   Decadent chocolate cake with cream                │ │
│ │   Available: ✅                                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4. Customer Menu (MenuPage)

**Purpose**: Display menu to customers who scan QR codes

**Key Elements**:
- Category-based menu display
- Add to cart functionality
- Item details and pricing
- Mobile-optimized design

**Mockup**:
```
┌─────────────────────────────────────────────────────────┐
│ ☕ Coffee Corner                    [🛒 Cart (3)]      │
├─────────────────────────────────────────────────────────┤
│ Categories: [Beverages] [Food] [Desserts]              │
├─────────────────────────────────────────────────────────┤
│ Beverages                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☕ Cappuccino                    ₹45.00  [+ Add]    │ │
│ │   Rich espresso with steamed milk                   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🫖 Green Tea                     ₹25.00  [+ Add]    │ │
│ │   Refreshing green tea                             │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ [View Cart & Checkout]                                 │
└─────────────────────────────────────────────────────────┘
```

### 5. Order Management (OrderManagementPage)

**Purpose**: Track and manage incoming orders

**Key Elements**:
- Order list with status filters
- Status update buttons
- Order details modal
- Real-time notifications

**Mockup**:
```
┌─────────────────────────────────────────────────────────┐
│ Order Management                                       │
├─────────────────────────────────────────────────────────┤
│ Status: [All] [Pending] [Preparing] [Ready] [Completed]│
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Order #123 - Table 5              ₹45.00           │ │
│ │ Customer: John Doe                                 │ │
│ │ Items: 1x Cappuccino                              │ │
│ │ Status: [Pending] [Confirm] [Preparing] [Ready]   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Order #124 - Table 3              ₹32.50           │ │
│ │ Customer: Jane Smith                               │ │
│ │ Items: 1x Green Tea                               │ │
│ │ Status: [Pending] [Confirm] [Preparing] [Ready]   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 6. QR Code Management (QRCodeManagementPage)

**Purpose**: Generate and manage QR codes for tables

**Key Elements**:
- Table list with QR codes
- Bulk QR generation
- Download functionality
- QR code regeneration

**Mockup**:
```
┌─────────────────────────────────────────────────────────┐
│ QR Code Management        [Generate Bulk QR Codes]     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table 1 - Main Area                                │ │
│ │ ┌─────────┐                                        │ │
│ │ │ [QR]    │ [Download] [Copy URL] [Regenerate]     │ │
│ │ └─────────┘                                        │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table 2 - Main Area                                │ │
│ │ ┌─────────┐                                        │ │
│ │ │ [QR]    │ [Download] [Copy URL] [Regenerate]     │ │
│ │ └─────────┘                                        │ │
│ └─────────────────────────────────────────────────────┘ │
│ [Download All QR Codes]                                │
└─────────────────────────────────────────────────────────┘
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new cafe owner account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cafe owner registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "cafe_owner"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "cafe_owner",
    "cafe": {
      "id": "cafe_uuid",
      "name": "Coffee Corner",
      "address": "123 Main St"
    }
  },
  "token": "jwt_token_here"
}
```

### Cafe Management Endpoints

#### POST /api/cafes
Create a new cafe.

**Request Body**:
```json
{
  "name": "Coffee Corner",
  "address": "123 Main Street, City",
  "phone": "+1234567890",
  "description": "A cozy coffee shop"
}
```

#### GET /api/cafes/:id
Get cafe details.

#### PUT /api/cafes/:id
Update cafe information.

#### POST /api/cafes/:id/qr
Generate QR code for cafe.

### Menu Management Endpoints

#### GET /api/cafes/:id/menu
Get cafe menu (public endpoint).

#### POST /api/menu
Add new menu item (protected).

**Request Body**:
```json
{
  "name": "Cappuccino",
  "description": "Rich espresso with steamed milk",
  "price": 45.00,
  "category": "Beverages",
  "is_available": true
}
```

#### PUT /api/menu/:id
Update menu item.

#### DELETE /api/menu/:id
Delete menu item.

### Order Management Endpoints

#### POST /api/orders
Create new order (public endpoint).

**Request Body**:
```json
{
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "items": [
    {
      "menu_id": "menu_uuid",
      "quantity": 2,
      "special_instructions": "Extra hot"
    }
  ],
  "table_number": 5,
  "special_instructions": "Please deliver to table"
}
```

#### GET /api/orders
Get orders for cafe (protected).

#### PUT /api/orders/:id/status
Update order status.

**Request Body**:
```json
{
  "status": "preparing"
}
```

### Table Management Endpoints

#### POST /api/tables/cafe/:cafeId/bulk
Create multiple tables with QR codes.

**Request Body**:
```json
{
  "tableCount": 10,
  "startNumber": 1,
  "capacity": 4,
  "location": "main"
}
```

#### GET /api/tables/cafe/:cafeId
Get all tables for cafe.

#### POST /api/tables/:id/regenerate-qr
Regenerate QR code for specific table.

---

## QR Code System

### QR Code Generation Process

1. **Table Creation**: When tables are created, unique QR codes are generated
2. **URL Structure**: QR codes contain URLs with cafe ID and table number
3. **Base64 Storage**: QR code images are stored as base64 strings in database
4. **Dynamic Updates**: QR codes can be regenerated if needed

### QR Code URL Format

```
https://yourdomain.com/menu/{cafeId}?table={tableNumber}
```

**Example**:
```
https://mycafe.com/menu/123e4567-e89b-12d3-a456-426614174000?table=5
```

### QR Code Implementation

#### Backend QR Generation
```javascript
const QRCode = require('qrcode');

const generateQRCode = async (url) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('QR code generation failed');
  }
};
```

#### Frontend QR Display
```javascript
const QRCodeGenerator = ({ qrCodeData, tableNumber }) => {
  return (
    <div className="qr-code-container">
      <img 
        src={qrCodeData} 
        alt={`QR Code for Table ${tableNumber}`}
        className="qr-code-image"
      />
      <p>Table {tableNumber}</p>
      <button onClick={() => downloadQR(qrCodeData, tableNumber)}>
        Download QR Code
      </button>
    </div>
  );
};
```

### QR Code Workflow

```
1. Cafe Owner Creates Tables
   ↓
2. System Generates QR Codes
   ↓
3. QR Codes Stored in Database
   ↓
4. QR Codes Downloaded/Printed
   ↓
5. QR Codes Placed on Tables
   ↓
6. Customers Scan QR Codes
   ↓
7. Menu Opens with Table Number
   ↓
8. Orders Associated with Table
```

---

## Authentication & Security

### JWT Authentication Flow

1. **Login**: User provides credentials
2. **Validation**: Server validates credentials
3. **Token Generation**: JWT token created with user data
4. **Token Storage**: Client stores token in localStorage
5. **Request Authentication**: Token sent with API requests
6. **Token Validation**: Server validates token on protected routes

### Security Measures

#### Backend Security
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize user inputs
- **Password Hashing**: bcrypt for password security

#### Frontend Security
- **Token Storage**: Secure localStorage usage
- **Route Protection**: PrivateRoute component
- **Input Sanitization**: Form validation
- **HTTPS**: Secure communication

### Authentication Middleware

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

---

## Deployment Guide

### Environment Setup

#### Backend Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASS=password
DB_NAME=qr_ordering
DB_PORT=5432

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Frontend Environment Variables
```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api

# App Configuration
VITE_APP_NAME=QR Ordering System
```

### Production Deployment

#### Backend Deployment (Render/Railway)

1. **Connect Repository**: Link your GitHub repository
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment Variables**: Add all required env vars
5. **Database**: Connect PostgreSQL database

#### Frontend Deployment (Vercel)

1. **Import Project**: Connect GitHub repository
2. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**: Add API URL
4. **Deploy**: Automatic deployment on push

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=postgres
      - DB_USER=postgres
      - DB_PASS=password
      - DB_NAME=qr_ordering
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=qr_ordering
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Development Guide

### Local Development Setup

#### Prerequisites
- Node.js 18+
- npm or yarn
- Git

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend API URL
npm run dev
```

### Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Implement changes
   - Test locally
   - Create pull request

2. **Testing**:
   - Unit tests for backend
   - Component tests for frontend
   - Integration tests for API
   - E2E tests for user flows

3. **Code Quality**:
   - ESLint for code linting
   - Prettier for code formatting
   - Pre-commit hooks

### Database Migrations

```bash
# Create migration
npx sequelize-cli migration:generate --name add-new-field

# Run migrations
npx sequelize-cli db:migrate

# Undo migration
npx sequelize-cli db:migrate:undo
```

### API Testing

#### Using Postman/Insomnia
1. Import API collection
2. Set environment variables
3. Test endpoints with sample data
4. Verify responses

#### Using curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get menu
curl -X GET http://localhost:5000/api/cafes/123/menu
```

---

## Troubleshooting

### Common Issues

#### Backend Issues

**Database Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Check database credentials and ensure PostgreSQL is running

**JWT Token Invalid**
```
Error: jwt malformed
```
**Solution**: Verify JWT_SECRET is set and tokens are properly formatted

**QR Code Generation Fails**
```
Error: QR code generation failed
```
**Solution**: Check qrcode library installation and memory availability

#### Frontend Issues

**API Calls Failing**
```
Error: Network Error
```
**Solution**: Verify API URL and CORS configuration

**Authentication Not Working**
```
Error: Unauthorized
```
**Solution**: Check token storage and authentication middleware

**QR Code Not Displaying**
```
Error: Image failed to load
```
**Solution**: Verify QR code data format and base64 encoding

### Performance Optimization

#### Backend Optimization
- **Database Indexing**: Add indexes on frequently queried fields
- **Caching**: Implement Redis for session storage
- **Compression**: Enable gzip compression
- **Connection Pooling**: Optimize database connections

#### Frontend Optimization
- **Code Splitting**: Lazy load components
- **Image Optimization**: Compress and optimize images
- **Bundle Analysis**: Monitor bundle size
- **Caching**: Implement service workers

### Monitoring & Logging

#### Backend Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Frontend Error Tracking
```javascript
// Error boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error:', error);
    // Send to error tracking service
  }
}
```

### Support & Maintenance

#### Regular Maintenance Tasks
1. **Database Backups**: Daily automated backups
2. **Security Updates**: Regular dependency updates
3. **Performance Monitoring**: Monitor API response times
4. **Error Tracking**: Monitor and fix errors
5. **User Feedback**: Collect and address user feedback

#### Support Channels
- **Documentation**: Comprehensive guides and tutorials
- **FAQ**: Common questions and answers
- **Email Support**: Direct support for cafe owners
- **Community Forum**: User community for tips and tricks

---

## Conclusion

QR Scanner Trios is a comprehensive solution for modernizing cafe operations through QR code technology. The system provides a seamless experience for both cafe owners and customers, with robust features for menu management, order processing, and analytics.

### Key Benefits

1. **For Cafe Owners**:
   - Reduced operational costs
   - Improved order accuracy
   - Better customer experience
   - Real-time order tracking
   - Contactless service

2. **For Customers**:
   - Convenient ordering process
   - Detailed menu information
   - Order tracking
   - Contactless interaction
   - Mobile-optimized interface

### Future Enhancements

1. **Payment Integration**: Online payment processing
2. **Inventory Management**: Stock tracking and alerts
3. **Customer Analytics**: Detailed customer insights
4. **Multi-language Support**: Internationalization
5. **Mobile Apps**: Native iOS and Android apps
6. **POS Integration**: Connect with existing POS systems

The system is designed to be scalable, secure, and user-friendly, making it an ideal solution for cafes looking to modernize their operations and improve customer satisfaction.
