const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Menu = sequelize.define('Menu', {
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
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  cafe_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cafes',
      key: 'id'
    }
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_vegetarian: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_vegan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_gluten_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allergens: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: JSON.stringify([])
  },
  preparation_time: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    validate: {
      min: 0
    }
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  customizations: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: JSON.stringify([])
  }
}, {
  tableName: 'menus',
  indexes: [
    {
      fields: ['cafe_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_available']
    }
  ]
});

module.exports = Menu;
