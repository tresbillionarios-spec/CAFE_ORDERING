const { sequelize } = require('../config/database');
const User = require('../models/User');
const Cafe = require('../models/Cafe');
const Menu = require('../models/Menu');
const Table = require('../models/Table');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Sync all models (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized.');
    
    // Check if we need to create initial data
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('📝 Creating initial data...');
      
      // Create a sample cafe owner
      const sampleUser = await User.create({
        name: 'Demo Cafe Owner',
        email: 'demo@cafe.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'cafe_owner'
      });
      
      // Create a sample cafe
      const sampleCafe = await Cafe.create({
        name: 'Demo Cafe',
        address: '123 Main Street, Demo City',
        phone: '+1234567890',
        description: 'A sample cafe for demonstration purposes',
        owner_id: sampleUser.id
      });
      
      // Create sample menu items
      const menuItems = await Menu.bulkCreate([
        {
          name: 'Cappuccino',
          description: 'Rich espresso with steamed milk and foam',
          price: 4.50,
          category: 'Coffee',
          cafe_id: sampleCafe.id
        },
        {
          name: 'Latte',
          description: 'Smooth espresso with steamed milk',
          price: 4.00,
          category: 'Coffee',
          cafe_id: sampleCafe.id
        },
        {
          name: 'Croissant',
          description: 'Buttery French pastry',
          price: 3.50,
          category: 'Pastry',
          cafe_id: sampleCafe.id
        },
        {
          name: 'Sandwich',
          description: 'Fresh deli sandwich with chips',
          price: 8.50,
          category: 'Food',
          cafe_id: sampleCafe.id
        }
      ]);
      
      // Create sample tables
      const tables = await Table.bulkCreate([
        {
          table_number: 1,
          name: 'Table 1',
          capacity: 4,
          location: 'main',
          cafe_id: sampleCafe.id
        },
        {
          table_number: 2,
          name: 'Table 2',
          capacity: 2,
          location: 'window',
          cafe_id: sampleCafe.id
        },
        {
          table_number: 3,
          name: 'Table 3',
          capacity: 6,
          location: 'patio',
          cafe_id: sampleCafe.id
        }
      ]);
      
      console.log('✅ Initial data created successfully.');
      console.log(`   - Created user: ${sampleUser.email}`);
      console.log(`   - Created cafe: ${sampleCafe.name}`);
      console.log(`   - Created ${menuItems.length} menu items`);
      console.log(`   - Created ${tables.length} tables`);
    } else {
      console.log('ℹ️  Database already contains data, skipping initial data creation.');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
