const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { User, Cafe, Menu, Table } = require('./models');
const authRoutes = require('./routes/auth');
const cafeRoutes = require('./routes/cafes');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const adminRoutes = require('./routes/admin');
const supportRoutes = require('./routes/support');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// Rate limiting - More lenient for development with auto-refresh
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased limit to accommodate auto-refresh (2 seconds = 1800 requests per 15 minutes)
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for health checks and auth endpoints
    return req.path === '/health' || req.path.startsWith('/api/auth/')
  }
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.9:5173',
  'http://127.0.0.1:5173',
  'https://qr-scanner-trios-frontend.onrender.com',
  'https://qr-scanner-trios-frontend.render.com',
  'http://192.168.1.9:3000',
  'http://localhost:3000'
];

// Use CORS_ORIGIN from environment if provided
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin && !allowedOrigins.includes(corsOrigin)) {
  allowedOrigins.push(corsOrigin);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'connected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize sample data
async function initializeSampleData() {
  try {
    // Check if we already have data
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('ℹ️  Database already contains data, skipping initialization.');
      return;
    }

    console.log('📝 Creating sample data...');

    // Create a sample cafe owner
    const sampleUser = await User.create({
      name: 'Demo Cafe Owner',
      email: 'demo@cafe.com',
      password: 'password123',
      role: 'cafe_owner',
      phone: '+1234567890'
    });

    // Create a sample cafe
    const sampleCafe = await Cafe.create({
      name: 'Demo Cafe',
      description: 'A sample cafe for demonstration purposes',
      address: '123 Main Street, Demo City',
      phone: '+1234567890',
      owner_id: sampleUser.id
    });

    // Create sample menu items
    const menuItems = await Menu.bulkCreate([
      {
        name: 'Cappuccino',
        description: 'Rich espresso with steamed milk and foam',
        price: 4.50,
        category: 'Coffee',
        cafe_id: sampleCafe.id,
        is_available: true
      },
      {
        name: 'Latte',
        description: 'Smooth espresso with steamed milk',
        price: 4.00,
        category: 'Coffee',
        cafe_id: sampleCafe.id,
        is_available: true
      },
      {
        name: 'Croissant',
        description: 'Buttery French pastry',
        price: 3.50,
        category: 'Pastry',
        cafe_id: sampleCafe.id,
        is_available: true
      },
      {
        name: 'Sandwich',
        description: 'Fresh deli sandwich with chips',
        price: 8.50,
        category: 'Food',
        cafe_id: sampleCafe.id,
        is_available: true
      }
    ]);

    // Create sample tables
    const tables = await Table.bulkCreate([
      {
        table_number: 1,
        table_name: 'Table 1',
        capacity: 4,
        location: 'main',
        cafe_id: sampleCafe.id,
        is_active: true,
        status: 'available'
      },
      {
        table_number: 2,
        table_name: 'Table 2',
        capacity: 2,
        location: 'window',
        cafe_id: sampleCafe.id,
        is_active: true,
        status: 'available'
      },
      {
        table_number: 3,
        table_name: 'Table 3',
        capacity: 6,
        location: 'patio',
        cafe_id: sampleCafe.id,
        is_active: true,
        status: 'available'
      }
    ]);

    // Create sample orders
    const { Order, OrderItem } = require('./models');
    
    const sampleOrder = await Order.create({
      order_number: 'ORD-001',
      status: 'pending',
      customer_name: 'John Doe',
      customer_phone: '+1234567890',
      customer_email: 'john@example.com',
      subtotal: 12.50,
      tax_amount: 1.25,
      service_charge: 0.00,
      total_amount: 13.75,
      payment_method: 'cash',
      payment_status: 'pending',
      table_id: tables[0].id,
      cafe_id: sampleCafe.id
    });

    await OrderItem.bulkCreate([
      {
        quantity: 2,
        unit_price: 4.50,
        total_price: 9.00,
        menu_item_name: 'Cappuccino',
        menu_item_description: 'Rich espresso with steamed milk and foam',
        menu_item_category: 'Coffee',
        order_id: sampleOrder.id,
        menu_id: menuItems[0].id
      },
      {
        quantity: 1,
        unit_price: 3.50,
        total_price: 3.50,
        menu_item_name: 'Croissant',
        menu_item_description: 'Buttery French pastry',
        menu_item_category: 'Pastry',
        order_id: sampleOrder.id,
        menu_id: menuItems[2].id
      }
    ]);

    console.log('✅ Sample data created successfully.');
    console.log(`   - Created user: ${sampleUser.email}`);
    console.log(`   - Created cafe: ${sampleCafe.name}`);
    console.log(`   - Created ${menuItems.length} menu items`);
    console.log(`   - Created ${tables.length} tables`);
    console.log(`   - Created 1 sample order`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    try {
      await sequelize.sync({ force: false });
      console.log('✅ Database synchronized successfully.');
      
      // Initialize with sample data only if database is empty
      const userCount = await User.count();
      if (userCount === 0) {
        await initializeSampleData();
      }
    } catch (error) {
      console.log('⚠️  Database sync warning:', error.message);
      console.log('ℹ️  Continuing with existing database...');
    }
    
    app.listen(PORT, 'localhost', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
