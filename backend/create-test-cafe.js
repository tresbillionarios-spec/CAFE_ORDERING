const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Cafe = require('./src/models/Cafe');
require('dotenv').config();

async function createTestCafe() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Find test user
    const testUser = await User.findOne({ where: { email: 'test@cafe.com' } });
    
    if (!testUser) {
      console.log('❌ Test user not found. Please create test user first.');
      return;
    }
    
    // Check if cafe already exists for this user
    const existingCafe = await Cafe.findOne({ where: { owner_id: testUser.id } });
    
    if (existingCafe) {
      console.log('ℹ️  Cafe already exists for test user:', existingCafe.name);
      return;
    }
    
    // Create test cafe
    const testCafe = await Cafe.create({
      name: 'Test Cafe',
      description: 'A test cafe for demonstration',
      address: '123 Test Street, Test City',
      phone: '+1234567890',
      owner_id: testUser.id
    });
    
    console.log('✅ Test cafe created successfully!');
    console.log(`   Name: ${testCafe.name}`);
    console.log(`   Owner: ${testUser.email}`);
    
  } catch (error) {
    console.error('❌ Error creating test cafe:', error);
  } finally {
    await sequelize.close();
  }
}

createTestCafe();
