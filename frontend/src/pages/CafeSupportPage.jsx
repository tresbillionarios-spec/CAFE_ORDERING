import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  RefreshCw,
  FileText,
  Send,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CafeSupportPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [newTicket, setNewTicket] = useState({
    category: '',
    description: ''
  });

  useEffect(() => {
    if (user?.role === 'cafe_owner') {
      console.log('User is café owner, fetching tickets');
      fetchTickets();
    } else {
      console.log('User is not café owner:', user?.role);
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log('Fetching support tickets for user:', user);
      const response = await api.get('/support/tickets');
      console.log('Support tickets response:', response.data);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to view support tickets');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Only café owners can view support tickets');
      } else {
        toast.error(`Failed to fetch support tickets: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.category || !newTicket.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, create: true }));
      const response = await api.post('/support/tickets', newTicket);
      toast.success('Support ticket created successfully');
      setNewTicket({ category: '', description: '' });
      setShowCreateModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to create support tickets');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Only café owners can create support tickets');
      } else {
        toast.error(`Failed to create support ticket: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setActionLoading(prev => ({ ...prev, create: false }));
    }
  };

  const openDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTicket(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><AlertTriangle className="h-3 w-3 mr-1" /> In Progress</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Resolved</span>;
      case 'closed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" /> Closed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">N/A</span>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'payment':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'technical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'menu':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'order_dispute':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-800">Please Log In</h2>
        <p className="text-gray-600 mt-2">You must be logged in to view support tickets.</p>
      </div>
    );
  }

  if (user?.role !== 'cafe_owner') {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-800">Access Denied</h2>
        <p className="text-gray-600 mt-2">You must be a café owner to view this page.</p>
        <p className="text-sm text-gray-500 mt-1">Current role: {user?.role}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>
          <p className="text-gray-600 mt-1">Get help with your café operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Raise Ticket
          </button>
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

      {/* Support Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">{tickets.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Your Support Tickets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No support tickets found. Click "Raise Ticket" to create your first ticket.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{ticket.ticket_number || ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getCategoryIcon(ticket.category)}
                        <span className="ml-2 capitalize">{ticket.category?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {ticket.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailsModal(ticket)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Raise Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="payment">Payment</option>
                  <option value="technical">Technical</option>
                  <option value="menu">Menu</option>
                  <option value="order_dispute">Order Dispute</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                  disabled={actionLoading.create}
                >
                  {actionLoading.create ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4 mr-2" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Ticket #{selectedTicket.ticket_number || selectedTicket.id}</h3>
              <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedTicket.category?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedTicket.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedTicket.updated_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedTicket.description}</p>
              </div>
              
              {/* Timeline */}
              {selectedTicket.timeline && selectedTicket.timeline.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Timeline</p>
                  <div className="space-y-2">
                    {selectedTicket.timeline.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex-shrink-0">
                          {entry.type === 'status_change' ? (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{entry.message}</p>
                          <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeSupportPage;
