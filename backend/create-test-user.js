const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Create a test user with password "password123"
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'cafe_owner'
    });
    
    console.log('✅ Test user created successfully');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: password123`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestUser();
