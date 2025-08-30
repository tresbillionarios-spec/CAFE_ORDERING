const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Find test user
    const testUser = await User.findOne({ where: { email: 'test@cafe.com' } });
    
    if (!testUser) {
      console.log('❌ Test user not found.');
      return;
    }
    
    console.log('User found:', testUser.email);
    console.log('Stored password hash:', testUser.password);
    
    // Test password comparison
    const isPasswordValid = await testUser.comparePassword('password123');
    console.log('Password comparison result:', isPasswordValid);
    
    // Test direct bcrypt comparison
    const directComparison = await bcrypt.compare('password123', testUser.password);
    console.log('Direct bcrypt comparison:', directComparison);
    
    // Test with wrong password
    const wrongPassword = await testUser.comparePassword('wrongpassword');
    console.log('Wrong password test:', wrongPassword);
    
  } catch (error) {
    console.error('❌ Error testing password:', error);
  } finally {
    await sequelize.close();
  }
}

testPassword();

