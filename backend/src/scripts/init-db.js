const { sequelize } = require('../config/database');
const { User, Cafe } = require('../models');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user = await User.create({
      name: 'Test Cafe Owner',
      email: 'test@cafe.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'cafe_owner',
      is_active: true
    });
    
    console.log('✅ Test user created:', user.email);
    
    // Create test cafe
    const cafe = await Cafe.create({
      name: 'Test Cafe',
      description: 'A test cafe for development',
      address: '123 Test Street, Test City',
      phone: '+1234567890',
      email: 'test@cafe.com',
      owner_id: user.id,
      is_active: true
    });
    
    console.log('✅ Test cafe created:', cafe.name);
    
    console.log('\n🎉 Database initialization completed!');
    console.log('\nTest credentials:');
    console.log('Email: test@cafe.com');
    console.log('Password: password123');
    console.log('\nYou can now start the server and login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
