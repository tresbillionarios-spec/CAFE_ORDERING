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

    await req.cafe.update(updateData);

    res.json({
      message: 'Cafe profile updated successfully',
      cafe: req.cafe
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Get orders for the period
    const orders = await Order.findAll({
      where: {
        cafe_id: id,
        created_at: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      include: [{
        model: require('../models').OrderItem,
        as: 'items'
      }]
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const pendingOrders = orders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status)).length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;

    // Get menu statistics
    const menuItems = await Menu.findAll({
      where: { cafe_id: id }
    });

    const totalMenuItems = menuItems.length;
    const availableItems = menuItems.filter(item => item.is_available).length;

    res.json({
      dashboard: {
        period,
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        revenue: {
          total: totalRevenue.toFixed(2)
        },
        menu: {
          total: totalMenuItems,
          available: availableItems
        },
        recent_orders: orders.slice(0, 10).map(order => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          customer_name: order.customer_name,
          created_at: order.created_at
        }))
      }
    });
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

module.exports = router;
