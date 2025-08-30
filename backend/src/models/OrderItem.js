const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customizations: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: JSON.stringify([])
  },
  menu_item_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  menu_item_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  menu_item_category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  menu_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'menus',
      key: 'id'
    }
  }
}, {
  tableName: 'order_items',
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['menu_id']
    }
  ],
  hooks: {
    beforeCreate: (orderItem) => {
      // Calculate total price if not provided
      if (!orderItem.total_price && orderItem.quantity && orderItem.unit_price) {
        orderItem.total_price = orderItem.quantity * orderItem.unit_price;
      }
    },
    beforeUpdate: (orderItem) => {
      // Recalculate total price if quantity or unit price changes
      if (orderItem.changed('quantity') || orderItem.changed('unit_price')) {
        orderItem.total_price = orderItem.quantity * orderItem.unit_price;
      }
    }
  }
});

module.exports = OrderItem;
