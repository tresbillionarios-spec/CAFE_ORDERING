const express = require('express');
const { body, validationResult } = require('express-validator');
const { Order, OrderItem, Menu, Cafe, Table } = require('../models');
const { authenticateToken, requireCafeOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all orders for the authenticated cafe owner
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get the cafe owned by the authenticated user
    const cafe = await Cafe.findOne({
      where: { owner_id: req.user.id }
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'Cafe not found',
        message: 'No cafe found for this user'
      });
    }

    // Get orders for this cafe
    const orders = await Order.findAll({
      where: { cafe_id: cafe.id },
      include: [{
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'quantity', 'unit_price', 'total_price', 'special_instructions', 'menu_item_name', 'menu_item_description', 'menu_item_category']
      }, {
        model: Table,
        as: 'table',
        attributes: ['id', 'table_number', 'table_name']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      orders: orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email,
        special_instructions: order.special_instructions,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        service_charge: order.service_charge,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        table_number: order.table?.table_number,
        table_name: order.table?.table_name,
        items: order.items
      }))
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'An error occurred while fetching orders'
    });
  }
});

// Create new order (public)
router.post('/', [
  body('cafe_id').isUUID().withMessage('Please provide a valid cafe ID'),
  body('customer_name').trim().isLength({ min: 2, max: 100 }).withMessage('Customer name must be between 2 and 100 characters'),
  body('customer_phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('customer_email').optional().isEmail().withMessage('Please provide a valid email'),
  body('special_instructions').optional().trim(),
  body('payment_method').isIn(['cash', 'card', 'online']).withMessage('Payment method must be cash, card, or online'),
  body('table_number').optional().isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.menu_id').isUUID().withMessage('Each item must have a valid menu ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.special_instructions').optional().trim(),
  body('items.*.customizations').optional().isArray().withMessage('Customizations must be an array')
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

    const { cafe_id, customer_name, customer_phone, customer_email, special_instructions, payment_method, table_number, items } = req.body;

    // Find table by table_number if provided
    let tableId = null;
    if (table_number) {
      const { Table } = require('../models');
      const table = await Table.findOne({
        where: {
          cafe_id: cafe_id,
          table_number: table_number,
          is_active: true
        }
      });
      
      if (!table) {
        return res.status(400).json({
          error: 'Invalid table number',
          message: `Table ${table_number} does not exist or is not available`
        });
      }
      
      tableId = table.id;
    }

    // Verify cafe exists and is active
    const cafe = await Cafe.findByPk(cafe_id, { where: { is_active: true } });
    if (!cafe) {
      return res.status(404).json({
        error: 'Cafe not found',
        message: 'The requested cafe does not exist or is inactive'
      });
    }

    // Verify all menu items exist and are available
    const menuIds = items.map(item => item.menu_id);
    const menuItems = await Menu.findAll({
      where: {
        id: menuIds,
        cafe_id: cafe_id,
        is_available: true
      }
    });

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        error: 'Invalid menu items',
        message: 'Some menu items are not available or do not exist'
      });
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menu_id);
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menu_id: item.menu_id,
        quantity: item.quantity,
        unit_price: menuItem.price,
        total_price: itemTotal,
        special_instructions: item.special_instructions,
        customizations: JSON.stringify(item.customizations || []),
        menu_item_name: menuItem.name,
        menu_item_description: menuItem.description,
        menu_item_category: menuItem.category
      });
    }

    // Handle table number if provided
    if (table_number) {
      const { Table } = require('../models');
      const table = await Table.findOne({
        where: { 
          cafe_id: cafe_id,
          table_number: table_number,
          is_active: true 
        }
      });
      
      if (table) {
        tableId = table.id;
      }
    }

    // Calculate taxes and charges
    const taxAmount = (subtotal * cafe.tax_rate) / 100;
    const serviceCharge = (subtotal * cafe.service_charge) / 100;
    const totalAmount = subtotal + taxAmount + serviceCharge;

    // Generate order number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp}${random}`;

    // Create order
    const order = await Order.create({
      order_number: orderNumber,
      cafe_id,
      table_id: tableId,
      customer_name,
      customer_phone,
      customer_email,
      special_instructions,
      payment_method,
      subtotal,
      tax_amount: taxAmount,
      service_charge: serviceCharge,
      total_amount: totalAmount
    });

    // Create order items
    const createdOrderItems = await Promise.all(
      orderItems.map(item => 
        OrderItem.create({
          ...item,
          order_id: order.id
        })
      )
    );

    // Fetch table information if table_id exists
    let tableInfo = null;
    if (tableId) {
      const { Table } = require('../models');
      const table = await Table.findByPk(tableId);
      if (table) {
        tableInfo = {
          table_number: table.table_number,
          table_name: table.table_name
        };
      }
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        estimated_preparation_time: order.estimated_preparation_time,
        table_number: tableInfo?.table_number,
        table_name: tableInfo?.table_name
      },
      items: createdOrderItems
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: 'An error occurred while creating the order'
    });
  }
});

// Get orders for a cafe (cafe owner only)
router.get('/cafe/:cafeId', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const cafeId = req.params.cafeId;

    const whereClause = { cafe_id: cafeId };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items'
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      orders: orders.rows,
      total: orders.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'An error occurred while fetching orders'
    });
  }
});

// Get specific order (cafe owner only)
router.get('/:id', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        as: 'items'
      }, {
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name', 'theme_color', 'currency']
      }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: order.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this order'
      });
    }

    res.json({
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: 'An error occurred while fetching the order'
    });
  }
});

// Update order status (cafe owner only)
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).withMessage('Invalid order status'),
  body('cancellation_reason').optional().trim().isLength({ min: 5, max: 500 }).withMessage('Cancellation reason must be between 5 and 500 characters')
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

    const { status, cancellation_reason } = req.body;

    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: order.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this order'
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status transition',
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Update order
    const updateData = { status };
    
    if (status === 'cancelled' && cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason;
      updateData.cancelled_at = new Date();
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await order.update(updateData);

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: 'An error occurred while updating the order status'
    });
  }
});

// Get order by order number (public)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { order_number: req.params.orderNumber },
      include: [{
        model: OrderItem,
        as: 'items'
      }, {
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name', 'theme_color', 'currency']
      }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order does not exist'
      });
    }

    res.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        created_at: order.created_at || order.createdAt,
        estimated_preparation_time: order.estimated_preparation_time,
        items: order.items,
        cafe: order.cafe
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      error: 'Failed to track order',
      message: 'An error occurred while tracking the order'
    });
  }
});

// Get order statistics for cafe (cafe owner only)
router.get('/cafe/:cafeId/stats', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const cafeId = req.params.cafeId;
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
        cafe_id: cafeId,
        created_at: {
          [require('sequelize').Op.gte]: startDate
        }
      }
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    res.json({
      stats: {
        period,
        total_orders: totalOrders,
        total_revenue: totalRevenue.toFixed(2),
        average_order_value: averageOrderValue.toFixed(2),
        status_breakdown: statusCounts
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch order statistics',
      message: 'An error occurred while fetching order statistics'
    });
  }
});

module.exports = router;
