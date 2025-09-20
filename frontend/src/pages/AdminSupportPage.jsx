import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  FileText,
  Shield,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Send,
  Archive,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminSupportPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    cafe: 'all',
    date_from: '',
    date_to: ''
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTickets();
      fetchComplaints();
      fetchCafes();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.cafe !== 'all') params.append('cafe', filters.cafe);
      if (searchTerm) params.append('search', searchTerm);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/admin/support/tickets?${params.toString()}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCafes = async () => {
    try {
      const response = await api.get('/admin/cafes');
      setCafes(response.data);
    } catch (error) {
      console.error('Error fetching cafes:', error);
      toast.error('Failed to fetch cafes');
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/admin/support/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      setActionLoading(prev => ({ ...prev, [ticketId]: 'status' }));
      await api.put(`/admin/support/tickets/${ticketId}/status`, { status });
      toast.success(`Ticket ${status} successfully`);
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    } finally {
      setActionLoading(prev => ({ ...prev, [ticketId]: null }));
    }
  };

  const handleReplyTicket = async (ticketId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [ticketId]: 'reply' }));
      await api.post(`/admin/support/tickets/${ticketId}/reply`, { message: replyText });
      toast.success('Reply sent successfully');
      setReplyText('');
      fetchTickets();
      closeDetails();
    } catch (error) {
      console.error('Error replying to ticket:', error);
      toast.error('Failed to send reply');
    } finally {
      setActionLoading(prev => ({ ...prev, [ticketId]: null }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'open': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'in_progress': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      'resolved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'closed': { color: 'bg-gray-100 text-gray-800', icon: Archive }
    };

    const config = statusConfig[status] || statusConfig['open'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'low': { color: 'bg-green-100 text-green-800' },
      'medium': { color: 'bg-yellow-100 text-yellow-800' },
      'high': { color: 'bg-orange-100 text-orange-800' },
      'urgent': { color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority] || priorityConfig['medium'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
    setReplyText('');
  };

  const closeDetails = () => {
    setSelectedTicket(null);
    setShowDetails(false);
    setReplyText('');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.cafe?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (filters.status === 'all' || ticket.status === filters.status) &&
      (filters.category === 'all' || ticket.category === filters.category) &&
      (filters.cafe === 'all' || ticket.cafe?.id === filters.cafe);
    
    return matchesSearch && matchesFilters;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-800">Access Denied</h2>
        <p className="text-gray-600 mt-2">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support & Compliance</h1>
          <p className="text-gray-600 mt-1">Manage support tickets, complaints, and compliance issues</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchTickets}
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">{tickets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'open' || t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Urgent Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Flag className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Complaints</p>
              <p className="text-2xl font-semibold text-gray-900">{complaints.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="payment">Payment</option>
              <option value="technical">Technical</option>
              <option value="menu">Menu</option>
              <option value="order_dispute">Order Dispute</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Café</label>
            <select
              value={filters.cafe}
              onChange={(e) => setFilters(prev => ({ ...prev, cafe: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cafés</option>
              {cafes.map(cafe => (
                <option key={cafe.id} value={cafe.id}>{cafe.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchTickets}
            className="btn-primary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Support Tickets ({filteredTickets.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Café
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{ticket.ticket_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">{ticket.cafe?.name || 'Unknown Café'}</div>
                          <div className="text-xs text-gray-400">{ticket.user?.name || 'Unknown User'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {ticket.category?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openDetails(ticket)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {/* Status Change Buttons */}
                        {ticket.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                            className="text-yellow-600 hover:text-yellow-900"
                            disabled={actionLoading[ticket.id]}
                            title="Mark In Progress"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        
                        {ticket.status === 'open' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                            className="text-yellow-600 hover:text-yellow-900"
                            disabled={actionLoading[ticket.id]}
                            title="Mark In Progress"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        
                        {ticket.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                            className="text-green-600 hover:text-green-900"
                            disabled={actionLoading[ticket.id]}
                            title="Mark Resolved"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {ticket.status === 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                            className="text-gray-600 hover:text-gray-900"
                            disabled={actionLoading[ticket.id]}
                            title="Close Ticket"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Ticket #{selectedTicket.ticket_number}</h3>
              <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">
                <AlertTriangle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Ticket Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800">Ticket Information</h4>
                  <p><strong>Subject:</strong> {selectedTicket.subject || 'N/A'}</p>
                  <p><strong>Category:</strong> {selectedTicket.category || 'N/A'}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedTicket.status)}</p>
                  <p><strong>Created:</strong> {formatDate(selectedTicket.created_at)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Café Information</h4>
                  <p><strong>Café Name:</strong> {selectedTicket.cafe?.name || 'Unknown Café'}</p>
                  <p><strong>Address:</strong> {selectedTicket.cafe?.address || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedTicket.cafe?.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedTicket.cafe?.email || 'N/A'}</p>
                </div>
              </div>
              
              {/* User Information */}
              <div>
                <h4 className="font-medium text-gray-800">User Information</h4>
                <p><strong>Name:</strong> {selectedTicket.user?.name || 'Unknown User'}</p>
                <p><strong>Email:</strong> {selectedTicket.user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedTicket.user?.phone || 'N/A'}</p>
              </div>
              
              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-800">Description</h4>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Replies */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800">Conversation</h4>
                  <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
                    {selectedTicket.replies.map((reply, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        reply.is_admin ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {reply.is_admin ? 'Admin' : selectedTicket.user?.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{reply.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div>
                <h4 className="font-medium text-gray-800">Reply to Ticket</h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your reply here..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleReplyTicket(selectedTicket.id)}
                className="btn-primary flex items-center"
                disabled={actionLoading[selectedTicket.id] || !replyText.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {actionLoading[selectedTicket.id] === 'reply' ? 'Sending...' : 'Send Reply'}
              </button>
              <button onClick={closeDetails} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportPage;
