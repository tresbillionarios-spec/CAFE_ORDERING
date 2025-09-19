const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Create an admin user directly with SQL
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const [result] = await sequelize.query(`
      INSERT INTO users (id, email, password, name, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        require('uuid').v4(),
        'admin@qrordering.com',
        hashedPassword,
        'System Administrator',
        'admin',
        1,
        new Date(),
        new Date()
      ]
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@qrordering.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAdminUser();
