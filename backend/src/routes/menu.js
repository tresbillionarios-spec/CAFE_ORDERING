const express = require('express');
const { body, validationResult } = require('express-validator');
const { Menu, Cafe } = require('../models');
const { authenticateToken, requireCafeOwnership, requireCafeOwner } = require('../middleware/auth');

const router = express.Router();

// Get all menu items for a cafe (cafe owner only)
router.get('/cafe/:cafeId', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const menuItems = await Menu.findAll({
      where: { cafe_id: req.params.cafeId },
      order: [['sort_order', 'ASC'], ['category', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      menu_items: menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      error: 'Failed to fetch menu items',
      message: 'An error occurred while fetching menu items'
    });
  }
});

// Get current user's menu items (cafe owner only)
router.get('/my', authenticateToken, requireCafeOwner, async (req, res) => {
  try {
    // First get the user's cafe
    const cafe = await Cafe.findOne({
      where: { owner_id: req.user.id }
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'No cafe found',
        message: 'Please make sure your account is properly set up with a cafe.'
      });
    }

    const menuItems = await Menu.findAll({
      where: { cafe_id: cafe.id },
      order: [['sort_order', 'ASC'], ['category', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      cafe: {
        id: cafe.id,
        name: cafe.name,
        description: cafe.description
      },
      menu_items: menuItems
    });
  } catch (error) {
    console.error('Get my menu items error:', error);
    res.status(500).json({
      error: 'Failed to fetch menu items',
      message: 'An error occurred while fetching menu items'
    });
  }
});

// Add new menu item (cafe owner only)
router.post('/', authenticateToken, requireCafeOwner, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('image_url').optional().isURL().withMessage('Please provide a valid image URL'),
  body('is_available').optional().isBoolean().withMessage('Availability must be a boolean value'),
  body('is_vegetarian').optional().isBoolean().withMessage('Vegetarian flag must be a boolean value'),
  body('is_vegan').optional().isBoolean().withMessage('Vegan flag must be a boolean value'),
  body('is_gluten_free').optional().isBoolean().withMessage('Gluten-free flag must be a boolean value'),
  body('allergens').optional().isArray().withMessage('Allergens must be an array'),
  body('preparation_time').optional().isInt({ min: 0 }).withMessage('Preparation time must be a positive integer'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
  body('customizations').optional().isArray().withMessage('Customizations must be an array')
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

    // Get the user's cafe
    const cafe = await Cafe.findOne({
      where: { owner_id: req.user.id }
    });

    if (!cafe) {
      return res.status(404).json({
        error: 'No cafe found',
        message: 'Please make sure your account is properly set up with a cafe.'
      });
    }

    const menuItem = await Menu.create({
      ...req.body,
      cafe_id: cafe.id
    });

    res.status(201).json({
      message: 'Menu item added successfully',
      menu_item: menuItem
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      error: 'Failed to add menu item',
      message: 'An error occurred while adding the menu item'
    });
  }
});

// Update menu item (cafe owner only)
router.put('/:id', authenticateToken, requireCafeOwnership, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  body('image_url').optional().isURL().withMessage('Please provide a valid image URL'),
  body('is_available').optional().isBoolean().withMessage('Availability must be a boolean value'),
  body('is_vegetarian').optional().isBoolean().withMessage('Vegetarian flag must be a boolean value'),
  body('is_vegan').optional().isBoolean().withMessage('Vegan flag must be a boolean value'),
  body('is_gluten_free').optional().isBoolean().withMessage('Gluten-free flag must be a boolean value'),
  body('allergens').optional().isArray().withMessage('Allergens must be an array'),
  body('preparation_time').optional().isInt({ min: 0 }).withMessage('Preparation time must be a positive integer'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
  body('customizations').optional().isArray().withMessage('Customizations must be an array')
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

    const menuItem = await Menu.findByPk(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found',
        message: 'The requested menu item does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: menuItem.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this menu item'
      });
    }

    const updateData = { ...req.body };
    delete updateData.id; // Prevent ID update
    delete updateData.cafe_id; // Prevent cafe_id update

    await menuItem.update(updateData);

    res.json({
      message: 'Menu item updated successfully',
      menu_item: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      error: 'Failed to update menu item',
      message: 'An error occurred while updating the menu item'
    });
  }
});

// Delete menu item (cafe owner only)
router.delete('/:id', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const menuItem = await Menu.findByPk(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found',
        message: 'The requested menu item does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: menuItem.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this menu item'
      });
    }

    await menuItem.destroy();

    res.json({
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      error: 'Failed to delete menu item',
      message: 'An error occurred while deleting the menu item'
    });
  }
});

// Get menu item by ID (cafe owner only)
router.get('/:id', authenticateToken, requireCafeOwnership, async (req, res) => {
  try {
    const menuItem = await Menu.findByPk(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found',
        message: 'The requested menu item does not exist'
      });
    }

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: menuItem.cafe_id,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this menu item'
      });
    }

    res.json({
      menu_item: menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      error: 'Failed to fetch menu item',
      message: 'An error occurred while fetching the menu item'
    });
  }
});

// Bulk update menu items (cafe owner only)
router.put('/cafe/:cafeId/bulk', authenticateToken, requireCafeOwnership, [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.id').isUUID().withMessage('Each item must have a valid ID'),
  body('items.*.sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
  body('items.*.is_available').optional().isBoolean().withMessage('Availability must be a boolean value')
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

    const { items } = req.body;
    const cafeId = req.params.cafeId;

    // Verify cafe ownership
    const cafe = await Cafe.findOne({
      where: { 
        id: cafeId,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update menu items for this cafe'
      });
    }

    // Update each menu item
    const updatePromises = items.map(async (item) => {
      const menuItem = await Menu.findOne({
        where: { 
          id: item.id,
          cafe_id: cafeId
        }
      });

      if (menuItem) {
        const updateData = {};
        if (item.sort_order !== undefined) updateData.sort_order = item.sort_order;
        if (item.is_available !== undefined) updateData.is_available = item.is_available;
        
        return menuItem.update(updateData);
      }
      return null;
    });

    await Promise.all(updatePromises);

    res.json({
      message: 'Menu items updated successfully'
    });
  } catch (error) {
    console.error('Bulk update menu items error:', error);
    res.status(500).json({
      error: 'Failed to update menu items',
      message: 'An error occurred while updating the menu items'
    });
  }
});

module.exports = router;
