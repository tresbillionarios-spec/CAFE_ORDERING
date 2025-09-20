const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function createSimpleUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Create a test user directly with SQL
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const [result] = await sequelize.query(`
      INSERT INTO users (id, email, password, name, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        require('uuid').v4(),
        'admin@qrordering.com',
        hashedPassword,
        'Admin User',
        'cafe_owner',
        1,
        new Date(),
        new Date()
      ]
    });
    
    console.log('✅ Simple user created successfully');
    console.log('Email: admin@qrordering.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await sequelize.close();
  }
}

createSimpleUser();
