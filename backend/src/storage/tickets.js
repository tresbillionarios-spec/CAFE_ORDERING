// Shared in-memory storage for tickets (in a real app, this would be a database)
let tickets = [];

// Helper function to get all tickets
const getAllTickets = () => {
  return tickets;
};

// Helper function to get tickets by user ID
const getTicketsByUserId = (userId) => {
  return tickets.filter(ticket => ticket.user_id === userId || ticket.user_id === null);
};

// Helper function to add a new ticket
const addTicket = (ticket) => {
  tickets.push(ticket);
  return ticket;
};

// Helper function to update ticket status
const updateTicketStatus = (ticketId, status) => {
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.status = status;
    ticket.updated_at = new Date();
    ticket.timeline.push({
      type: 'status_change',
      message: `Status changed to ${status}`,
      created_at: new Date()
    });
    return ticket;
  }
  return null;
};

// Helper function to add reply to ticket
const addTicketReply = (ticketId, reply) => {
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.timeline.push({
      id: `reply-${Date.now()}`,
      ...reply,
      created_at: new Date()
    });
    ticket.updated_at = new Date();
    return ticket;
  }
  return null;
};

// Helper function to get ticket by ID
const getTicketById = (ticketId) => {
  return tickets.find(t => t.id === ticketId);
};

// Clear all tickets from memory
const clearAllTickets = () => {
  tickets.length = 0; // Clear the array
  console.log('🗑️  All support tickets cleared from memory');
};

module.exports = {
  getAllTickets,
  getTicketsByUserId,
  addTicket,
  updateTicketStatus,
  addTicketReply,
  getTicketById,
  clearAllTickets
};
