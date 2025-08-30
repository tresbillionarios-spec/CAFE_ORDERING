const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Table = sequelize.define('Table', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  table_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  table_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: 1,
      max: 20
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  qr_code_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qr_code_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance'),
    defaultValue: 'available'
  },
  cafe_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cafes',
      key: 'id'
    }
  }
}, {
  tableName: 'tables',
  indexes: [
    {
      fields: ['cafe_id', 'table_number'],
      unique: true
    },
    {
      fields: ['cafe_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Table;
