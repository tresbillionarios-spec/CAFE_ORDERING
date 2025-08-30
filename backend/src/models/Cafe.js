const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cafe = sequelize.define('Cafe', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [10, 15]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  banner_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  opening_hours: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: JSON.stringify({
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false }
    })
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
  theme_color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
    validate: {
      len: [3, 3]
    }
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  service_charge: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  total_tables: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1000
    }
  },
  table_configuration: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: JSON.stringify([])
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'cafes',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Cafe;
