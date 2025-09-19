const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getTicketsByUserId, addTicket } = require('../storage/tickets');

// GET support tickets for café
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Support tickets requested by user:', userId);
    
    // Get tickets for the current user
    const userTickets = getTicketsByUserId(userId);
    
    console.log('Returning tickets:', userTickets.length);
    res.json(userTickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets', message: error.message });
  }
});

// POST create new support ticket
router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const { category, description } = req.body;
    const userId = req.user.id;
    console.log('Creating ticket for user:', userId, 'with data:', { category, description });
    console.log('User cafe info:', req.user.cafe);
    console.log('Cafe ID:', req.user.cafe?.id);

    if (!category || !description) {
      return res.status(400).json({ error: 'Category and description are required' });
    }

    // Validate category
    const validCategories = ['payment', 'technical', 'menu', 'order_dispute', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Create new ticket
    const newTicket = {
      id: `ticket-${Date.now()}`,
      ticket_number: `TKT-${String(Date.now()).slice(-6)}`,
      subject: `${category.charAt(0).toUpperCase() + category.slice(1)} Issue`,
      description,
      category,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
      user_id: userId,
      cafe_id: req.user.cafe?.id || null,
      timeline: [
        {
          type: 'status_change',
          message: 'Ticket created',
          created_at: new Date()
        }
      ]
    };

    // Add to shared storage
    addTicket(newTicket);

    console.log('Ticket created successfully:', newTicket.id);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket', message: error.message });
  }
});

// GET single support ticket
router.get('/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Mock ticket data - in a real system, this would fetch from database
    const ticket = {
      id,
      ticket_number: `TKT-${id.slice(-6)}`,
      subject: 'Payment Issue',
      description: 'Unable to process payments through the system',
      category: 'payment',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
      timeline: [
        {
          type: 'status_change',
          message: 'Ticket created',
          created_at: new Date()
        }
      ]
    };

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ error: 'Failed to fetch support ticket', message: error.message });
  }
});

module.exports = router;
