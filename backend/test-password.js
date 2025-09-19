const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function testPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Find the test user
    const user = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('Password hash:', user.password);
    
    // Test password comparison
    const isMatch = await user.comparePassword('password123');
    console.log('Password match:', isMatch);
    
    // Test direct bcrypt comparison
    const directMatch = await bcrypt.compare('password123', user.password);
    console.log('Direct bcrypt match:', directMatch);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testPassword();

