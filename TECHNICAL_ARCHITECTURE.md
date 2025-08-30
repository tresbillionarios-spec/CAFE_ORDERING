# QR Scanner Trios - Technical Architecture

## System Overview

QR Scanner Trios is a full-stack web application built with modern technologies to provide a comprehensive QR code-based ordering system for cafes and restaurants.

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks and functional components
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework for styling
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

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Customer  │  │   Cafe      │  │   Kitchen   │            │
│  │   Interface │  │   Dashboard │  │   Interface │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   React     │  │   Vite      │  │  TailwindCSS│            │
│  │ Components  │  │   Build     │  │   Styling   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   CORS      │  │   Rate      │  │   Helmet    │            │
│  │   Policy    │  │   Limiting  │  │   Security  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Express   │  │   JWT       │  │   QR Code   │            │
│  │   Routes    │  │   Auth      │  │   Generator │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Sequelize  │  │   Models    │  │  Migrations │            │
│  │     ORM     │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  SQLite     │  │ PostgreSQL  │  │   File      │            │
│  │ (Dev)       │  │ (Prod)      │  │   Storage   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Database Design

### Entity Relationship Model

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │     │    Cafes    │     │    Tables   │
│             │     │             │     │             │
│ • id (PK)   │◄────┤ • id (PK)   │◄────┤ • id (PK)   │
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
       │              │ • id (PK)   │            │
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
       │              │ • id (PK)   │            │
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
       │              │ • id (PK)   │            │
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

## API Architecture

### RESTful API Design

The API follows RESTful principles with the following structure:

```
/api
├── /auth
│   ├── POST /register    # Register new user
│   ├── POST /login       # User login
│   └── GET  /me          # Get current user
├── /cafes
│   ├── GET    /          # Get all cafes
│   ├── POST   /          # Create cafe
│   ├── GET    /:id       # Get cafe details
│   ├── PUT    /:id       # Update cafe
│   └── POST   /:id/qr    # Generate QR code
├── /menu
│   ├── GET    /          # Get menu items
│   ├── POST   /          # Add menu item
│   ├── PUT    /:id       # Update menu item
│   └── DELETE /:id       # Delete menu item
├── /orders
│   ├── GET    /          # Get orders
│   ├── POST   /          # Create order
│   └── PUT    /:id/status # Update order status
└── /tables
    ├── GET    /cafe/:id  # Get cafe tables
    ├── POST   /cafe/:id/bulk # Create tables
    └── POST   /:id/regenerate-qr # Regenerate QR
```

### Authentication Flow

```
1. Client Login Request
   ↓
2. Server Validates Credentials
   ↓
3. Server Generates JWT Token
   ↓
4. Server Returns Token + User Data
   ↓
5. Client Stores Token (localStorage)
   ↓
6. Client Sends Token with Requests
   ↓
7. Server Validates Token (Middleware)
   ↓
8. Server Processes Request
```

### Security Implementation

#### Backend Security
```javascript
// Security middleware stack
app.use(helmet());                    // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));                                  // CORS policy
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,          // 15 minutes
  max: 100                           // 100 requests per window
}));                                  // Rate limiting
```

#### JWT Authentication
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

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── Routes
│       ├── Public Routes
│       │   ├── HomePage
│       │   ├── CafeLoginPage
│       │   ├── MenuPage
│       │   ├── OrderPage
│       │   └── OrderTrackingPage
│       └── Protected Routes
│           ├── Layout
│           │   ├── Sidebar
│           │   ├── Header
│           │   └── Main Content
│           ├── CafeDashboardPage
│           ├── MenuManagementPage
│           ├── OrderManagementPage
│           ├── TableManagementPage
│           ├── QRCodeManagementPage
│           └── CafeProfilePage
```

### State Management

#### Context API Implementation
```javascript
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  loading: false
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    // Login logic
  };

  const logout = () => {
    // Logout logic
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### React Query Integration
```javascript
const { data: dashboardData, isLoading } = useQuery(
  ['dashboard', cafeId],
  () => api.get(`/cafes/${cafeId}/dashboard`).then(res => res.data),
  {
    enabled: !!cafeId,
    refetchInterval: 30000, // Refresh every 30 seconds
  }
);
```

### Routing Configuration

```javascript
// Public routes (no authentication required)
<Route path="/" element={<HomePage />} />
<Route path="/login" element={<CafeLoginPage />} />
<Route path="/menu/:cafeId" element={<MenuPage />} />
<Route path="/order/:cafeId" element={<OrderPage />} />
<Route path="/track/:orderNumber" element={<OrderTrackingPage />} />

// Protected routes (authentication required)
<Route path="/dashboard" element={
  <PrivateRoute>
    <Layout>
      <CafeDashboardPage />
    </Layout>
  </PrivateRoute>
} />
```

## QR Code System Architecture

### QR Code Generation Process

```javascript
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

### QR Code URL Structure

```
https://yourdomain.com/menu/{cafeId}?table={tableNumber}
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

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**: Lazy load components
2. **Image Optimization**: Compress and optimize images
3. **Bundle Analysis**: Monitor bundle size
4. **Caching**: Implement service workers
5. **React Query**: Efficient data fetching and caching

### Backend Optimization

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Connection Pooling**: Optimize database connections
3. **Caching**: Implement Redis for session storage
4. **Compression**: Enable gzip compression
5. **Rate Limiting**: Prevent abuse

### Database Optimization

```sql
-- Indexes for performance
CREATE INDEX idx_orders_cafe_id ON orders(cafe_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_menu_cafe_id ON menus(cafe_id);
CREATE INDEX idx_tables_cafe_id ON tables(cafe_id);
```

## Security Architecture

### Authentication & Authorization

1. **JWT Tokens**: Secure token-based authentication
2. **Password Hashing**: bcrypt for password security
3. **Role-Based Access**: Different permissions for different user types
4. **Token Expiration**: Automatic token expiration
5. **Secure Storage**: Proper token storage on client

### Data Protection

1. **Input Validation**: Sanitize all user inputs
2. **SQL Injection Prevention**: Use parameterized queries
3. **XSS Prevention**: Sanitize output data
4. **CSRF Protection**: Implement CSRF tokens
5. **HTTPS**: Secure communication

### API Security

1. **Rate Limiting**: Prevent abuse
2. **CORS Policy**: Control cross-origin requests
3. **Security Headers**: Implement security headers
4. **Request Validation**: Validate all incoming requests
5. **Error Handling**: Secure error messages

## Deployment Architecture

### Development Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vite Dev)    │◄──►│   (Node Dev)    │◄──►│  (SQLite)       │
│   Port: 5173    │    │   Port: 5000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│  (PostgreSQL)   │
│   CDN           │    │   Load Balancer │    │   Managed DB    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Docker Architecture

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

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

## Monitoring & Logging

### Application Monitoring

1. **Health Checks**: Regular health check endpoints
2. **Error Tracking**: Comprehensive error logging
3. **Performance Monitoring**: API response time tracking
4. **User Analytics**: Usage pattern analysis
5. **Database Monitoring**: Query performance tracking

### Logging Strategy

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Scalability Considerations

### Horizontal Scaling

1. **Load Balancing**: Distribute traffic across multiple instances
2. **Database Sharding**: Partition data across multiple databases
3. **CDN**: Use CDN for static assets
4. **Microservices**: Break down into smaller services
5. **Caching**: Implement distributed caching

### Vertical Scaling

1. **Resource Optimization**: Optimize memory and CPU usage
2. **Database Optimization**: Optimize queries and indexes
3. **Code Optimization**: Optimize application code
4. **Infrastructure**: Upgrade server resources

## Future Enhancements

### Technical Improvements

1. **Real-time Updates**: WebSocket implementation
2. **Mobile Apps**: Native iOS and Android applications
3. **Payment Integration**: Online payment processing
4. **Analytics Dashboard**: Advanced analytics and reporting
5. **Multi-language Support**: Internationalization
6. **Offline Support**: Service worker implementation

### Architecture Evolution

1. **Microservices**: Break down into smaller services
2. **Event-Driven Architecture**: Implement event sourcing
3. **GraphQL**: Replace REST with GraphQL
4. **Serverless**: Move to serverless architecture
5. **Edge Computing**: Implement edge computing for better performance

This technical architecture provides a solid foundation for the QR Scanner Trios system, ensuring scalability, security, and maintainability while supporting future enhancements and growth.
