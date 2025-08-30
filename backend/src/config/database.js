const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite for local development if no PostgreSQL is available
const useSQLite = process.env.USE_SQLITE === 'true' || !process.env.DB_HOST;

let sequelize;

if (useSQLite) {
  // SQLite configuration for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  // PostgreSQL configuration for production
  sequelize = new Sequelize(
    process.env.DB_NAME || 'qr_ordering_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  );
}

module.exports = { sequelize };
