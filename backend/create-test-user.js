const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ where: { email: 'test@cafe.com' } });
    
    if (existingUser) {
      console.log('ℹ️  Test user already exists:', existingUser.email);
      return;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = await User.create({
      name: 'Test Cafe Owner',
      email: 'test@cafe.com',
      password: hashedPassword,
      role: 'cafe_owner'
    });
    
    console.log('✅ Test user created successfully!');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: password123`);
    console.log(`   Role: ${testUser.role}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await sequelize.close();
  }
}

createTestUser();
