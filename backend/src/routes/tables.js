const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const { Table, Cafe } = require('../models');
const { authenticateToken, requireCafeOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all tables for a cafe
router.get('/cafe/:cafeId', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const tables = await Table.findAll({
      where: { cafe_id: req.params.cafeId },
      order: [['table_number', 'ASC']]
    });

    res.json({
      tables: tables.map(table => ({
        id: table.id,
        table_number: table.table_number,
        table_name: table.table_name,
        capacity: table.capacity,
        is_active: table.is_active,
        status: table.status,
        location: table.location,
        qr_code_url: table.qr_code_url,
        created_at: table.created_at
      }))
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      error: 'Failed to fetch tables',
      message: 'An error occurred while fetching tables'
    });
  }
});

// Create multiple tables for a cafe
router.post('/cafe/:cafeId/bulk', authenticateToken, requireCafeOwnership, [
  body('total_tables').isInt({ min: 1, max: 1000 }).withMessage('Total tables must be between 1 and 1000'),
  body('start_number').optional().isInt({ min: 1 }).withMessage('Start number must be at least 1'),
  body('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const { total_tables, start_number = 1, capacity = 4, location = 'Main Area' } = req.body;
    const cafeId = req.params.cafeId;

    // Check if cafe exists
    const cafe = await Cafe.findByPk(cafeId);
    if (!cafe) {
      return res.status(404).json({
        error: 'Cafe not found',
        message: 'The requested cafe does not exist'
      });
    }

    // Check for existing tables
    const existingTables = await Table.findAll({
      where: { cafe_id: cafeId },
      attributes: ['table_number']
    });

    const existingNumbers = existingTables.map(t => t.table_number);
    const newTables = [];

    // Create tables
    for (let i = 0; i < total_tables; i++) {
      const tableNumber = start_number + i;
      
      // Skip if table number already exists
      if (existingNumbers.includes(tableNumber)) {
        continue;
      }

      // Generate QR code for table
      const qrData = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu/${cafeId}?table=${tableNumber}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const table = await Table.create({
        cafe_id: cafeId,
        table_number: tableNumber,
        table_name: `Table ${tableNumber}`,
        capacity: capacity,
        location: location,
        qr_code_data: qrCodeDataUrl,
        qr_code_url: qrData,
        is_active: true,
        status: 'available'
      });

      newTables.push({
        id: table.id,
        table_number: table.table_number,
        table_name: table.table_name,
        capacity: table.capacity,
        location: table.location,
        qr_code_url: table.qr_code_url,
        qr_code_data: table.qr_code_data,
        status: table.status
      });
    }

    // Update cafe with total tables count
    await cafe.update({
      total_tables: existingTables.length + newTables.length
    });

    res.status(201).json({
      message: `Successfully created ${newTables.length} tables`,
      tables: newTables,
      total_tables: existingTables.length + newTables.length
    });
  } catch (error) {
    console.error('Create tables error:', error);
    res.status(500).json({
      error: 'Failed to create tables',
      message: 'An error occurred while creating tables'
    });
  }
});

// Update table status
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['available', 'occupied', 'reserved', 'maintenance']).withMessage('Invalid table status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const { status } = req.body;
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      return res.status(404).json({
        error: 'Table not found',
        message: 'The requested table does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: table.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this table'
      });
    }

    await table.update({ status });

    res.json({
      message: 'Table status updated successfully',
      table: {
        id: table.id,
        table_number: table.table_number,
        table_name: table.table_name,
        status: table.status
      }
    });
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(500).json({
      error: 'Failed to update table status',
      message: 'An error occurred while updating table status'
    });
  }
});

// Delete a table
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      return res.status(404).json({
        error: 'Table not found',
        message: 'The requested table does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: table.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this table'
      });
    }

    await table.destroy();

    // Update cafe total tables count
    const remainingTables = await Table.count({ where: { cafe_id: table.cafe_id } });
    await cafe.update({ total_tables: remainingTables });

    res.json({
      message: 'Table deleted successfully',
      remaining_tables: remainingTables
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      error: 'Failed to delete table',
      message: 'An error occurred while deleting the table'
    });
  }
});

// Get table QR code
router.get('/:id/qr', authenticateToken, async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id, {
      include: [{
        model: Cafe,
        as: 'cafe',
        attributes: ['id', 'name']
      }]
    });

    if (!table) {
      return res.status(404).json({
        error: 'Table not found',
        message: 'The requested table does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: table.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this table'
      });
    }

    res.json({
      table: {
        id: table.id,
        table_number: table.table_number,
        table_name: table.table_name,
        qr_code_url: table.qr_code_url,
        qr_code_data: table.qr_code_data
      }
    });
  } catch (error) {
    console.error('Get table QR error:', error);
    res.status(500).json({
      error: 'Failed to fetch table QR code',
      message: 'An error occurred while fetching the table QR code'
    });
  }
});

// Regenerate QR code for a table
router.post('/:id/regenerate-qr', authenticateToken, async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        error: 'Table not found',
        message: 'The requested table does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: table.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to regenerate QR code for this table'
      });
    }

    // Generate new QR code data
    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu/${table.cafe_id}?table=${table.table_number}`;
    
    // Generate new QR code image
    const qrImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Update table with new QR code
    await table.update({
      qr_code_data: qrImage,
      qr_code_url: qrData
    });

    res.json({
      message: 'QR code regenerated successfully',
      table: {
        id: table.id,
        table_number: table.table_number,
        name: table.name,
        qr_code_url: table.qr_code_url,
        qr_code_data: table.qr_code_data,
        qr_code_image: table.qr_code_image
      }
    });
  } catch (error) {
    console.error('Regenerate QR code error:', error);
    res.status(500).json({
      error: 'Failed to regenerate QR code',
      message: 'An error occurred while regenerating the QR code'
    });
  }
});

module.exports = router;
