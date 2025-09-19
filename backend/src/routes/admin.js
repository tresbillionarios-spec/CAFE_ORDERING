const express = require('express');
const { Cafe, User, Order, OrderItem, Menu } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const router = express.Router();

// Get all café registration requests
router.get('/cafe-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cafes = await Cafe.findAll({
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    const formattedRequests = cafes.map(cafe => ({
      id: cafe.id,
      cafe_name: cafe.name,
      owner_name: cafe.owner?.name || 'N/A',
      owner_email: cafe.owner?.email || 'N/A',
      owner_phone: cafe.owner?.phone || 'N/A',
      registration_date: cafe.created_at,
      status: cafe.is_approved === null ? 'Pending' : 
              cafe.is_approved === true ? 'Approved' : 'Rejected',
      description: cafe.description,
      address: cafe.address,
      phone: cafe.phone,
      email: cafe.email
    }));

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Get café requests error:', error);
    res.status(500).json({
      error: 'Failed to fetch café requests',
      message: 'An error occurred while fetching café registration requests'
    });
  }
});

// Approve a café registration request
router.put('/cafe-requests/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const cafe = await Cafe.findByPk(id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'Café not found',
        message: 'The requested café registration was not found'
      });
    }

    await cafe.update({ is_approved: true });

    res.json({
      success: true,
      message: `Café "${cafe.name}" has been approved successfully`,
      cafe: {
        id: cafe.id,
        name: cafe.name,
        owner_name: cafe.owner?.name,
        status: 'Approved'
      }
    });
  } catch (error) {
    console.error('Approve café request error:', error);
    res.status(500).json({
      error: 'Failed to approve café request',
      message: 'An error occurred while approving the café registration'
    });
  }
});

// Reject a café registration request
router.put('/cafe-requests/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const cafe = await Cafe.findByPk(id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'Café not found',
        message: 'The requested café registration was not found'
      });
    }

    await cafe.update({ is_approved: false });

    res.json({
      success: true,
      message: `Café "${cafe.name}" has been rejected`,
      cafe: {
        id: cafe.id,
        name: cafe.name,
        owner_name: cafe.owner?.name,
        status: 'Rejected'
      }
    });
  } catch (error) {
    console.error('Reject café request error:', error);
    res.status(500).json({
      error: 'Failed to reject café request',
      message: 'An error occurred while rejecting the café registration'
    });
  }
});

// Get café request details
router.get('/cafe-requests/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const cafe = await Cafe.findByPk(id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone', 'created_at']
      }]
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'Café not found',
        message: 'The requested café registration was not found'
      });
    }

    const requestDetails = {
      id: cafe.id,
      cafe_name: cafe.name,
      description: cafe.description,
      address: cafe.address,
      phone: cafe.phone,
      email: cafe.email,
      owner: {
        id: cafe.owner?.id,
        name: cafe.owner?.name,
        email: cafe.owner?.email,
        phone: cafe.owner?.phone,
        created_at: cafe.owner?.created_at
      },
      registration_date: cafe.created_at,
      status: cafe.is_approved === null ? 'Pending' : 
              cafe.is_approved === true ? 'Approved' : 'Rejected',
      opening_hours: cafe.opening_hours,
      theme_color: cafe.theme_color,
      currency: cafe.currency,
      tax_rate: cafe.tax_rate,
      service_charge: cafe.service_charge
    };

    res.json({
      success: true,
      request: requestDetails
    });
  } catch (error) {
    console.error('Get café request details error:', error);
    res.status(500).json({
      error: 'Failed to fetch café request details',
      message: 'An error occurred while fetching café request details'
    });
  }
});

// GET admin dashboard data
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders and revenue
    const todayOrders = await Order.findAll({
      where: {
        created_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    const totalOrdersToday = todayOrders.length;
    const totalRevenueToday = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Get pending café approvals
    const pendingCafeApprovals = await Cafe.count({
      where: { is_approved: null }
    });

    // Get active cafés
    const activeCafes = await Cafe.count({
      where: { is_approved: true, is_active: true }
    });

    // Get total users
    const totalUsers = await User.count();

    // Get total orders
    const totalOrders = await Order.count();

    // Get sales trend for last 7 days
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });

      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      salesTrend.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayRevenue
      });
    }

    // Get payment method distribution
    const paymentMethods = await Order.findAll({
      attributes: ['payment_method'],
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    const paymentDistribution = {};
    paymentMethods.forEach(order => {
      const method = order.payment_method || 'Unknown';
      paymentDistribution[method] = (paymentDistribution[method] || 0) + 1;
    });

    const paymentDistributionArray = Object.entries(paymentDistribution).map(([method, count]) => ({
      method,
      count
    }));

    // Get top performing cafés
    const topCafes = await Order.findAll({
      attributes: [
        'cafe_id',
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount']
      ],
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['name']
      }],
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      group: ['cafe_id', 'cafe.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Order.id')), 'DESC']],
      limit: 5
    });

    const topPerformingCafes = topCafes.map(cafe => ({
      name: cafe.cafe?.name || 'Unknown Café',
      orders: cafe.dataValues.orderCount
    }));

    res.json({
      metrics: {
        totalOrdersToday,
        totalRevenueToday,
        pendingCafeApprovals,
        activeCafes,
        totalUsers,
        totalOrders
      },
      trends: {
        salesTrend,
        paymentDistribution: paymentDistributionArray,
        topPerformingCafes
      }
    });

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data', message: error.message });
  }
});

// GET all cafés with owner information
router.get('/cafes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cafes = await Cafe.findAll({
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(cafes);
  } catch (error) {
    console.error('Error fetching cafés:', error);
    res.status(500).json({ error: 'Failed to fetch cafés', message: error.message });
  }
});

// PUT toggle café active status
router.put('/cafes/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const cafe = await Cafe.findByPk(id);

    if (!cafe) {
      return res.status(404).json({ error: 'Café not found' });
    }

    await cafe.update({ is_active: !cafe.is_active });
    res.json({ message: 'Café status updated successfully', cafe });
  } catch (error) {
    console.error('Error toggling café status:', error);
    res.status(500).json({ error: 'Failed to update café status', message: error.message });
  }
});

// GET café analytics
router.get('/cafes/:id/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query;
    
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders for the café in the specified period
    const orders = await Order.findAll({
      where: {
        cafe_id: id,
        created_at: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top selling items
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.menu_item_name || 'Unknown Item';
        itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
      });
    });

    const topSellingItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get payment method distribution
    const paymentMethods = {};
    orders.forEach(order => {
      const method = order.payment_method || 'Unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    const paymentDistribution = Object.entries(paymentMethods)
      .map(([method, count]) => ({ method, count }));

    // Get daily sales trend
    const dailySales = {};
    orders.forEach(order => {
      const date = order.created_at.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { orders: 0, revenue: 0 };
      }
      dailySales[date].orders += 1;
      dailySales[date].revenue += order.total_amount || 0;
    });

    const salesTrend = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topSellingItems,
      paymentDistribution,
      salesTrend
    });

  } catch (error) {
    console.error('Error fetching café analytics:', error);
    res.status(500).json({ error: 'Failed to fetch café analytics', message: error.message });
  }
});

// GET all orders with filters
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      cafe_id, 
      status, 
      payment_method, 
      date_from, 
      date_to, 
      search 
    } = req.query;

    const whereClause = {};

    if (cafe_id && cafe_id !== 'all') {
      whereClause.cafe_id = cafe_id;
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (payment_method && payment_method !== 'all') {
      whereClause.payment_method = payment_method;
    }

    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = endDate;
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: Cafe,
          as: 'cafe',
          attributes: ['id', 'name']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
});

// PUT cancel order (admin override)
router.put('/orders/:id/cancel', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByPk(id, {
      include: [{
        model: Cafe,
        as: 'cafe'
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed order' });
    }

    await order.update({
      status: 'cancelled',
      cancellation_reason: reason || 'Cancelled by admin',
      cancelled_at: new Date()
    });

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order', message: error.message });
  }
});

// PUT refund order (admin override)
router.put('/orders/:id/refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByPk(id, {
      include: [{
        model: Cafe,
        as: 'cafe'
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed orders can be refunded' });
    }

    if (order.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Only paid orders can be refunded' });
    }

    await order.update({
      status: 'refunded',
      payment_status: 'refunded',
      cancellation_reason: reason || 'Refunded by admin',
      cancelled_at: new Date()
    });

    res.json({ message: 'Order refunded successfully', order });
  } catch (error) {
    console.error('Error refunding order:', error);
    res.status(500).json({ error: 'Failed to refund order', message: error.message });
  }
});

// GET all menu items with filters
router.get('/menu-items', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      cafe_id, 
      category, 
      is_available, 
      search 
    } = req.query;

    const whereClause = {};

    if (cafe_id && cafe_id !== 'all') {
      whereClause.cafe_id = cafe_id;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (is_available && is_available !== 'all') {
      whereClause.is_available = is_available === 'available';
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const menuItems = await Menu.findAll({
      where: whereClause,
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name', 'address']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items', message: error.message });
  }
});

// GET menu categories
router.get('/menu-categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categories = await Menu.findAll({
      attributes: ['category'],
      where: {
        category: {
          [Op.ne]: null
        }
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(item => item.category).filter(Boolean);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    res.status(500).json({ error: 'Failed to fetch menu categories', message: error.message });
  }
});

// PUT toggle menu item availability
router.put('/menu-items/:id/toggle-availability', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findByPk(id, {
      include: [{
        model: Cafe,
        as: 'cafe'
      }]
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await menuItem.update({ is_available: !menuItem.is_available });
    res.json({ message: 'Menu item availability updated successfully', menuItem });
  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    res.status(500).json({ error: 'Failed to update menu item availability', message: error.message });
  }
});

// DELETE menu item
router.delete('/menu-items/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await menuItem.destroy();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item', message: error.message });
  }
});

// GET inventory alerts
router.get('/inventory-alerts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { threshold = 5 } = req.query;
    
    const lowStockItems = await Menu.findAll({
      where: {
        stock_quantity: {
          [Op.lte]: parseInt(threshold),
          [Op.gt]: 0
        }
      },
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name']
      }]
    });

    const outOfStockItems = await Menu.findAll({
      where: {
        stock_quantity: 0
      },
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      lowStock: lowStockItems,
      outOfStock: outOfStockItems,
      totalAlerts: lowStockItems.length + outOfStockItems.length
    });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({ error: 'Failed to fetch inventory alerts', message: error.message });
  }
});

// PUT update menu item stock
router.put('/menu-items/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    const menuItem = await Menu.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await menuItem.update({ stock_quantity });
    res.json({ message: 'Stock updated successfully', menuItem });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock', message: error.message });
  }
});

// GET all users with filters
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      role, 
      is_active, 
      search 
    } = req.query;

    const whereClause = {};

    if (role && role !== 'all') {
      whereClause.role = role;
    }

    if (is_active && is_active !== 'all') {
      whereClause.is_active = is_active === 'active';
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name', 'address', 'is_active']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

// PUT toggle user status
router.put('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [{
        model: Cafe,
        as: 'cafe'
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating the last admin
    if (user.role === 'admin') {
      const adminCount = await User.count({
        where: { role: 'admin', is_active: true }
      });
      
      if (adminCount <= 1 && user.is_active) {
        return res.status(400).json({ error: 'Cannot deactivate the last admin user' });
      }
    }

    await user.update({ is_active: !user.is_active });
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to update user status', message: error.message });
  }
});

// DELETE user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    // If user is a cafe owner, also delete their cafe
    if (user.role === 'cafe_owner') {
      const cafe = await Cafe.findOne({ where: { owner_id: id } });
      if (cafe) {
        await cafe.destroy();
      }
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

// GET user audit log
router.get('/users/:id/audit-log', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    // This would typically come from an audit log table
    // For now, we'll return basic user activity
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'last_login', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock audit log data - in a real system, this would come from an audit table
    const auditLog = [
      {
        id: 1,
        action: 'login',
        timestamp: user.last_login,
        details: 'User logged in successfully'
      },
      {
        id: 2,
        action: 'profile_update',
        timestamp: user.updated_at,
        details: 'User profile updated'
      },
      {
        id: 3,
        action: 'account_created',
        timestamp: user.created_at,
        details: 'User account created'
      }
    ];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      auditLog: auditLog.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching user audit log:', error);
    res.status(500).json({ error: 'Failed to fetch user audit log', message: error.message });
  }
});

// GET finance overview
router.get('/finance/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30', cafe_id, date_from, date_to } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    const whereClause = {
      created_at: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    };

    if (cafe_id && cafe_id !== 'all') {
      whereClause.cafe_id = cafe_id;
    }

    if (date_from && date_to) {
      whereClause.created_at = {
        [Op.gte]: new Date(date_from),
        [Op.lte]: new Date(date_to)
      };
    }

    // Get total revenue
    const totalRevenue = await Order.sum('total_amount', { where: whereClause }) || 0;
    
    // Get platform commission (assuming 10% commission)
    const platformCommission = totalRevenue * 0.1;
    
    // Get pending settlements (mock data for now)
    const pendingSettlements = [{ count: 0 }];
    const processedSettlements = [{ count: 0 }];

    // Revenue trend (last 7 days)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = await Order.sum('total_amount', {
        where: {
          ...whereClause,
          created_at: {
            [Op.gte]: dayStart,
            [Op.lte]: dayEnd
          }
        }
      }) || 0;

      revenueTrend.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }

    // Payment method distribution
    const paymentDistribution = await Order.findAll({
      attributes: [
        'payment_method',
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'amount']
      ],
      where: whereClause,
      group: ['payment_method']
    });

    // Revenue by cafe
    const cafeRevenue = await Order.findAll({
      attributes: [
        'cafe_id',
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['name']
      }],
      where: whereClause,
      group: ['cafe_id', 'cafe.id']
    });

    res.json({
      totalRevenue,
      platformCommission,
      pendingSettlements: pendingSettlements[0]?.count || 0,
      processedSettlements: processedSettlements[0]?.count || 0,
      revenueTrend,
      paymentDistribution: paymentDistribution.map(p => ({
        method: p.payment_method,
        amount: parseFloat(p.dataValues.amount || 0)
      })),
      cafeRevenue: cafeRevenue.map(c => ({
        cafe_name: c.cafe?.name || 'Unknown Café',
        revenue: parseFloat(c.dataValues.revenue || 0)
      }))
    });
  } catch (error) {
    console.error('Error fetching finance overview:', error);
    res.status(500).json({ error: 'Failed to fetch finance overview', message: error.message });
  }
});

// GET settlements
router.get('/finance/settlements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { cafe_id, status, date_from, date_to } = req.query;
    
    const whereClause = {};
    
    if (cafe_id && cafe_id !== 'all') {
      whereClause.cafe_id = cafe_id;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (date_from && date_to) {
      whereClause.created_at = {
        [Op.gte]: new Date(date_from),
        [Op.lte]: new Date(date_to)
      };
    }

    // Mock settlements data - in a real system, this would come from a settlements table
    const settlements = [
      {
        id: 'settlement-1',
        settlement_id: 'SET-001',
        cafe_id: 'cafe-1',
        total_amount: 15000,
        commission_amount: 1500,
        net_amount: 13500,
        status: 'pending',
        period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        period_end: new Date(),
        created_at: new Date(),
        cafe: {
          id: 'cafe-1',
          name: 'Coffee Corner',
          owner: {
            name: 'John Doe',
            email: 'john@coffeecorner.com'
          }
        }
      }
    ];

    res.json(settlements);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ error: 'Failed to fetch settlements', message: error.message });
  }
});

// PUT process settlement
router.put('/finance/settlements/:id/process', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real system, this would update the settlement status in the database
    res.json({ message: 'Settlement processed successfully' });
  } catch (error) {
    console.error('Error processing settlement:', error);
    res.status(500).json({ error: 'Failed to process settlement', message: error.message });
  }
});

// PUT reject settlement
router.put('/finance/settlements/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real system, this would update the settlement status in the database
    res.json({ message: 'Settlement rejected successfully' });
  } catch (error) {
    console.error('Error rejecting settlement:', error);
    res.status(500).json({ error: 'Failed to reject settlement', message: error.message });
  }
});

// GET system settings
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock settings data - in a real system, this would come from a settings table
    const settings = {
      defaultTaxRate: 18,
      defaultServiceCharge: 5,
      platformCommissionRate: 10,
      paymentMethods: {
        cash: true,
        card: true,
        upi: true,
        wallet: false
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        orderAlerts: true,
        paymentAlerts: true,
        systemAlerts: true
      },
      system: {
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5
      },
      business: {
        businessName: 'OrdeRKaro',
        businessEmail: 'admin@qrordering.com',
        businessPhone: '+91-9876543210',
        businessAddress: '123 Business Street, City, State 12345',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        language: 'en'
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings', message: error.message });
  }
});

// PUT system settings
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    // In a real system, this would save settings to a database table
    res.json({ message: 'Settings saved successfully', settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings', message: error.message });
  }
});

// GET support tickets
router.get('/support/tickets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, category, cafe, search, date_from, date_to } = req.query;
    
    // Get all tickets from shared storage
    const { getAllTickets } = require('../storage/tickets');
    let tickets = getAllTickets();
    
    console.log('Admin fetching tickets:', tickets.length);
    console.log('Sample ticket:', tickets[0]);
    
    // Fetch cafe and user data from database for admin view
    const { Cafe, User } = require('../models');
    
    // Get all unique cafe IDs and user IDs from tickets
    const cafeIds = [...new Set(tickets.map(ticket => ticket.cafe_id).filter(Boolean))];
    const userIds = [...new Set(tickets.map(ticket => ticket.user_id).filter(Boolean))];
    
    console.log('Cafe IDs from tickets:', cafeIds);
    console.log('User IDs from tickets:', userIds);
    
    // Fetch cafe and user data
    const cafes = cafeIds.length > 0 ? await Cafe.findAll({
      where: { id: cafeIds },
      attributes: ['id', 'name', 'address', 'phone', 'email']
    }) : [];
    
    const users = userIds.length > 0 ? await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'email', 'phone']
    }) : [];
    
    console.log('Fetched cafes:', cafes.length);
    console.log('Fetched users:', users.length);
    
    // Create lookup maps
    const cafeMap = new Map(cafes.map(cafe => [cafe.id, cafe]));
    const userMap = new Map(users.map(user => [user.id, user]));
    
    // Transform tickets to include cafe and user info for admin view
    tickets = tickets.map(ticket => {
      const cafe = ticket.cafe_id ? cafeMap.get(ticket.cafe_id) : null;
      const user = ticket.user_id ? userMap.get(ticket.user_id) : null;
      
      console.log(`Ticket ${ticket.id}: cafe_id=${ticket.cafe_id}, user_id=${ticket.user_id}`);
      console.log(`Found cafe:`, cafe ? cafe.name : 'null');
      console.log(`Found user:`, user ? user.name : 'null');
      
      return {
        ...ticket,
        cafe: cafe ? {
          id: cafe.id,
          name: cafe.name,
          address: cafe.address,
          phone: cafe.phone,
          email: cafe.email
        } : {
          id: 'unknown',
          name: 'Unknown Café',
          address: 'N/A',
          phone: 'N/A',
          email: 'N/A'
        },
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        } : {
          id: 'unknown',
          name: 'Unknown User',
          email: 'N/A',
          phone: 'N/A'
        },
        replies: ticket.timeline.filter(item => item.type === 'admin_comment' || item.type === 'reply')
      };
    });

    // Apply filters
    if (status && status !== 'all') {
      tickets = tickets.filter(ticket => ticket.status === status);
    }
    
    if (category && category !== 'all') {
      tickets = tickets.filter(ticket => ticket.category === category);
    }
    
    if (cafe && cafe !== 'all') {
      tickets = tickets.filter(ticket => ticket.cafe.id === cafe);
    }
    
    if (search) {
      tickets = tickets.filter(ticket => 
        ticket.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.cafe.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets', message: error.message });
  }
});

// GET support complaints
router.get('/support/complaints', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock complaints data - in a real system, this would come from a complaints table
    const complaints = [
      {
        id: 'complaint-1',
        subject: 'Poor Service',
        description: 'Very slow service at the café',
        status: 'open',
        created_at: new Date(),
        user: {
          name: 'Customer A',
          email: 'customer@example.com'
        }
      }
    ];

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints', message: error.message });
  }
});

// PUT update ticket status
router.put('/support/tickets/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Update ticket status in shared storage
    const { updateTicketStatus } = require('../storage/tickets');
    const updatedTicket = updateTicketStatus(id, status);
    
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: `Ticket ${status} successfully` });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status', message: error.message });
  }
});

// POST reply to ticket
router.post('/support/tickets/:id/reply', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Add reply to ticket in shared storage
    const { addTicketReply } = require('../storage/tickets');
    const updatedTicket = addTicketReply(id, {
      message,
      is_admin: true
    });
    
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error replying to ticket:', error);
    res.status(500).json({ error: 'Failed to send reply', message: error.message });
  }
});

module.exports = router;
