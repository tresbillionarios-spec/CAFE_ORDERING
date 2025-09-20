const express = require('express');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { Cafe, Menu, Order } = require('../models');
const { authenticateToken, requireCafeOwner, requireCafeOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all cafes (public)
router.get('/', async (req, res) => {
  try {
    const cafes = await Cafe.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'description', 'address', 'phone', 'logo_url', 'theme_color'],
      include: [{
        model: Menu,
        as: 'menu_items',
        where: { is_available: true },
        required: false,
        attributes: ['id', 'name', 'price', 'category']
      }]
    });

    res.json({
      cafes: cafes.map(cafe => ({
        ...cafe.toJSON(),
        menu_items: cafe.menu_items || []
      }))
    });
  } catch (error) {
    console.error('Get cafes error:', error);
    res.status(500).json({
      error: 'Failed to fetch cafes',
      message: 'An error occurred while fetching cafes'
    });
  }
});

// Get specific cafe (public)
router.get('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id, {
      where: { is_active: true },
      include: [{
        model: Menu,
        as: 'menu_items',
        where: { is_available: true },
        required: false,
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      }]
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'Cafe not found',
        message: 'The requested cafe does not exist or is inactive'
      });
    }

    res.json({
      cafe: {
        ...cafe.toJSON(),
        menu_items: cafe.menu_items || []
      }
    });
  } catch (error) {
    console.error('Get cafe error:', error);
    res.status(500).json({
      error: 'Failed to fetch cafe',
      message: 'An error occurred while fetching the cafe'
    });
  }
});

// Update cafe profile (cafe owner only)
router.put('/:id', authenticateToken, requireCafeOwnership, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim(),
  body('address').optional().trim(),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('theme_color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Please provide a valid hex color'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('tax_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('service_charge').optional().isFloat({ min: 0, max: 100 }).withMessage('Service charge must be between 0 and 100')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const updateData = { ...req.body };
    delete updateData.id; // Prevent ID update

    console.log('Updating cafe with data:', updateData);
    console.log('Cafe ID:', req.cafe.id);

    await req.cafe.update(updateData);

    // Fetch updated cafe data
    const updatedCafe = await Cafe.findByPk(req.cafe.id);
    console.log('Updated cafe data:', updatedCafe.toJSON());

    res.json({
      message: 'Cafe profile updated successfully',
      cafe: updatedCafe
    });
  } catch (error) {
    console.error('Update cafe error:', error);
    res.status(500).json({
      error: 'Failed to update cafe',
      message: 'An error occurred while updating the cafe profile'
    });
  }
});

// Generate QR code for cafe
router.post('/:id/qr', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrData = `${frontendUrl}/menu/${req.cafe.id}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: req.cafe.theme_color || '#3B82F6',
        light: '#FFFFFF'
      }
    });

    // Update cafe with QR code data
    await req.cafe.update({
      qr_code_data: qrData,
      qr_code_url: qrCodeDataUrl
    });

    res.json({
      message: 'QR code generated successfully',
      qr_code: {
        data: qrData,
        image: qrCodeDataUrl
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      error: 'Failed to generate QR code',
      message: 'An error occurred while generating the QR code'
    });
  }
});

// Get cafe dashboard data (cafe owner only)
router.get('/:id/dashboard', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'today' } = req.query;
    const { Op } = require('sequelize');

    // Calculate date ranges
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Get today's orders
    const todayOrders = await Order.findAll({
      where: {
        cafe_id: id,
        created_at: {
          [Op.gte]: today
        }
      },
      include: [{
        model: require('../models').OrderItem,
        as: 'items'
      }]
    });

    // Get yesterday's orders for comparison
    const yesterdayOrders = await Order.findAll({
      where: {
        cafe_id: id,
        created_at: {
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      }
    });

    // Get last 7 days orders for trends
    const weekOrders = await Order.findAll({
      where: {
        cafe_id: id,
        created_at: {
          [Op.gte]: weekAgo
        }
      },
      include: [{
        model: require('../models').OrderItem,
        as: 'items'
      }]
    });

    // Get last 30 days orders for trends
    const monthOrders = await Order.findAll({
      where: {
        cafe_id: id,
        created_at: {
          [Op.gte]: monthAgo
        }
      },
      include: [{
        model: require('../models').OrderItem,
        as: 'items'
      }]
    });

    // Calculate today's metrics
    const todayTotalOrders = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const todayPendingOrders = todayOrders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status)).length;
    
    // Calculate yesterday's metrics for comparison
    const yesterdayTotalOrders = yesterdayOrders.length;
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    
    // Calculate percentage changes
    const orderChangePercent = yesterdayTotalOrders > 0 
      ? ((todayTotalOrders - yesterdayTotalOrders) / yesterdayTotalOrders * 100).toFixed(1)
      : todayTotalOrders > 0 ? 100 : 0;
    
    const revenueChangePercent = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : todayRevenue > 0 ? 100 : 0;

    // Get menu statistics
    const menuItems = await Menu.findAll({
      where: { cafe_id: id }
    });

    const totalMenuItems = menuItems.length;
    const availableItems = menuItems.filter(item => item.is_available).length;
    const lowStockItems = menuItems.filter(item => item.is_available && (item.stock_quantity || 0) <= 5).length;

    // Calculate sales trends (last 7 days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = weekOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= date && orderDate < nextDate;
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      
      salesTrend.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayRevenue
      });
    }

    // Top selling items (last 30 days)
    const itemSales = {};
    monthOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.menu_item_name;
        if (!itemSales[key]) {
          itemSales[key] = { name: key, quantity: 0, revenue: 0 };
        }
        itemSales[key].quantity += item.quantity;
        itemSales[key].revenue += parseFloat(item.total_price || 0);
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Payment methods distribution (last 30 days)
    const paymentMethods = {};
    monthOrders.forEach(order => {
      const method = order.payment_method || 'Unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { method, count: 0, revenue: 0 };
      }
      paymentMethods[method].count++;
      paymentMethods[method].revenue += parseFloat(order.total_amount || 0);
    });

    const paymentDistribution = Object.values(paymentMethods);

    // Peak order hours (last 30 days)
    const hourlyStats = {};
    for (let i = 0; i < 24; i++) {
      hourlyStats[i] = { hour: i, orders: 0, revenue: 0 };
    }

    monthOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourlyStats[hour].orders++;
      hourlyStats[hour].revenue += parseFloat(order.total_amount || 0);
    });

    const peakHours = Object.values(hourlyStats)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Orders in progress (today)
    const ordersInProgress = todayOrders
      .filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status))
      .map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        created_at: order.created_at,
        items: order.items.map(item => ({
          name: item.menu_item_name,
          quantity: item.quantity
        }))
      }));

    // Gamification metrics
    const lastMonthRevenue = monthOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const currentMonthRevenue = todayRevenue; // This would be better calculated for the full month
    const achievementPercent = lastMonthRevenue > 0 ? Math.min((currentMonthRevenue / lastMonthRevenue * 100), 100) : 0;

    const response = {
      dashboard: {
        period,
        metrics: {
          total_orders_today: todayTotalOrders,
          order_change_percent: parseFloat(orderChangePercent),
          total_revenue_today: todayRevenue,
          revenue_change_percent: parseFloat(revenueChangePercent),
          pending_orders_count: todayPendingOrders,
          active_cafes_count: 1 // For single cafe owner
        },
        menu: {
          total: totalMenuItems,
          available: availableItems,
          low_stock: lowStockItems
        },
        trends: {
          sales_trend: salesTrend,
          top_selling_items: topSellingItems,
          payment_distribution: paymentDistribution,
          peak_hours: peakHours
        },
        operations: {
          orders_in_progress: ordersInProgress,
          inventory_alerts: lowStockItems > 0 ? [
            { type: 'low_stock', message: `${lowStockItems} items running low on stock`, count: lowStockItems }
          ] : []
        },
        engagement: {
          achievement_percent: Math.round(achievementPercent),
          achievement_message: achievementPercent >= 90 ? 
            `🎉 You achieved ${Math.round(achievementPercent)}% of last month's sales!` :
            `Keep going! You're at ${Math.round(achievementPercent)}% of last month's sales.`
        },
        recent_orders: todayOrders.slice(0, 10).map(order => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          customer_name: order.customer_name,
          created_at: order.created_at
        }))
      }
    };

    // console.log('Dashboard API Response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: 'An error occurred while fetching dashboard data'
    });
  }
});

// Get cafe menu (public)
router.get('/:id/menu', async (req, res) => {
  try {
    const cafe = await Cafe.findByPk(req.params.id, {
      where: { is_active: true },
      include: [{
        model: Menu,
        as: 'menu_items',
        where: { is_available: true },
        required: false,
        order: [['sort_order', 'ASC'], ['category', 'ASC'], ['name', 'ASC']]
      }]
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'Cafe not found',
        message: 'The requested cafe does not exist or is inactive'
      });
    }

    // Group menu items by category
    const menuByCategory = {};
    cafe.menu_items.forEach(item => {
      if (!menuByCategory[item.category]) {
        menuByCategory[item.category] = [];
      }
      menuByCategory[item.category].push(item);
    });

    res.json({
      cafe: {
        id: cafe.id,
        name: cafe.name,
        description: cafe.description,
        theme_color: cafe.theme_color,
        currency: cafe.currency,
        tax_rate: cafe.tax_rate,
        service_charge: cafe.service_charge
      },
      menu: menuByCategory
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      error: 'Failed to fetch menu',
      message: 'An error occurred while fetching the menu'
    });
  }
});

// Create new cafe (authenticated users only)
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim(),
  body('address').optional().trim(),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('theme_color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Please provide a valid hex color'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('tax_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('service_charge').optional().isFloat({ min: 0, max: 100 }).withMessage('Service charge must be between 0 and 100')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    // Check if user already has a cafe
    const existingCafe = await Cafe.findOne({ where: { owner_id: req.user.id } });
    if (existingCafe) {
      return res.status(400).json({
        error: 'Cafe already exists',
        message: 'You already have a cafe associated with your account'
      });
    }

    const cafeData = {
      ...req.body,
      owner_id: req.user.id,
      is_active: true
    };

    const cafe = await Cafe.create(cafeData);

    res.status(201).json({
      message: 'Cafe created successfully',
      cafe: {
        id: cafe.id,
        name: cafe.name,
        description: cafe.description,
        address: cafe.address,
        phone: cafe.phone,
        email: cafe.email,
        theme_color: cafe.theme_color,
        currency: cafe.currency,
        tax_rate: cafe.tax_rate,
        service_charge: cafe.service_charge,
        is_active: cafe.is_active
      }
    });
  } catch (error) {
    console.error('Create cafe error:', error);
    res.status(500).json({
      error: 'Failed to create cafe',
      message: 'An error occurred while creating the cafe'
    });
  }
});

// Get current user's cafe (authenticated users only)
router.get('/my/cafe', authenticateToken, requireCafeOwner, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({
      where: { owner_id: req.user.id },
      include: [{
        model: Menu,
        as: 'menu_items',
        required: false,
        order: [['sort_order', 'ASC'], ['category', 'ASC'], ['name', 'ASC']]
      }]
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'No cafe found',
        message: 'Please make sure your account is properly set up with a cafe.'
      });
    }

    res.json({
      cafe: {
        id: cafe.id,
        name: cafe.name,
        description: cafe.description,
        address: cafe.address,
        phone: cafe.phone,
        email: cafe.email,
        logo_url: cafe.logo_url,
        banner_url: cafe.banner_url,
        opening_hours: cafe.opening_hours,
        is_active: cafe.is_active,
        qr_code_url: cafe.qr_code_url,
        qr_code_data: cafe.qr_code_data,
        theme_color: cafe.theme_color,
        currency: cafe.currency,
        tax_rate: cafe.tax_rate,
        service_charge: cafe.service_charge,
        total_tables: cafe.total_tables,
        table_configuration: cafe.table_configuration,
        menu_items: cafe.menu_items || []
      }
    });
  } catch (error) {
    console.error('Get my cafe error:', error);
    res.status(500).json({
      error: 'Failed to fetch cafe',
      message: 'An error occurred while fetching your cafe'
    });
  }
});

module.exports = router;
