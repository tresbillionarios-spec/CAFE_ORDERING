const User = require('./User');
const Cafe = require('./Cafe');
const Menu = require('./Menu');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Table = require('./Table');

// User - Cafe relationship (One-to-One)
User.hasOne(Cafe, { foreignKey: 'owner_id', as: 'cafe' });
Cafe.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Cafe - Menu relationship (One-to-Many)
Cafe.hasMany(Menu, { foreignKey: 'cafe_id', as: 'menu_items' });
Menu.belongsTo(Cafe, { foreignKey: 'cafe_id', as: 'cafe' });

// Cafe - Order relationship (One-to-Many)
Cafe.hasMany(Order, { foreignKey: 'cafe_id', as: 'orders' });
Order.belongsTo(Cafe, { foreignKey: 'cafe_id', as: 'cafe' });

// Order - OrderItem relationship (One-to-Many)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Menu - OrderItem relationship (One-to-Many)
Menu.hasMany(OrderItem, { foreignKey: 'menu_id', as: 'order_items' });
OrderItem.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu_item' });

// Cafe - Table relationship (One-to-Many)
Cafe.hasMany(Table, { foreignKey: 'cafe_id', as: 'tables' });
Table.belongsTo(Cafe, { foreignKey: 'cafe_id', as: 'cafe' });

// Table - Order relationship (One-to-Many)
Table.hasMany(Order, { foreignKey: 'table_id', as: 'orders' });
Order.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

module.exports = {
  User,
  Cafe,
  Menu,
  Order,
  OrderItem,
  Table
};
