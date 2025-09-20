import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Coffee, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminCafeManagementPage = () => {
  const { user } = useAuth();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCafes();
    }
  }, [user]);

  const fetchCafes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/cafes');
      setCafes(response.data);
    } catch (error) {
      console.error('Error fetching cafés:', error);
      toast.error('Failed to fetch cafés');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (cafeId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [cafeId]: 'toggle' }));
      await api.put(`/admin/cafes/${cafeId}/toggle-status`);
      toast.success(`Café ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchCafes();
    } catch (error) {
      console.error('Error toggling café status:', error);
      toast.error('Failed to update café status');
    } finally {
      setActionLoading(prev => ({ ...prev, [cafeId]: null }));
    }
  };

  const handleApprove = async (cafeId) => {
    try {
      setActionLoading(prev => ({ ...prev, [cafeId]: 'approve' }));
      await api.put(`/admin/cafe-requests/${cafeId}/approve`);
      toast.success('Café approved successfully');
      fetchCafes();
    } catch (error) {
      console.error('Error approving café:', error);
      toast.error('Failed to approve café');
    } finally {
      setActionLoading(prev => ({ ...prev, [cafeId]: null }));
    }
  };

  const handleReject = async (cafeId) => {
    try {
      setActionLoading(prev => ({ ...prev, [cafeId]: 'reject' }));
      await api.put(`/admin/cafe-requests/${cafeId}/reject`);
      toast.success('Café rejected successfully');
      fetchCafes();
    } catch (error) {
      console.error('Error rejecting café:', error);
      toast.error('Failed to reject café');
    } finally {
      setActionLoading(prev => ({ ...prev, [cafeId]: null }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case true:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Approved</span>;
      case false:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejected</span>;
      case null:
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</span>;
    }
  };

  const getActiveStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" /> Inactive
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
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const openDetails = (cafe) => {
    setSelectedCafe(cafe);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedCafe(null);
    setShowDetails(false);
  };

  const filteredCafes = cafes.filter(cafe => {
    const matchesSearch = cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cafe.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cafe.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && cafe.is_approved === null) ||
                         (statusFilter === 'approved' && cafe.is_approved === true) ||
                         (statusFilter === 'rejected' && cafe.is_approved === false);
    
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold text-gray-900">Café Management</h1>
          <p className="text-gray-600 mt-1">Manage all cafés in your platform</p>
        </div>
        <button
          onClick={fetchCafes}
          className="btn-primary flex items-center"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, owner, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cafés Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Cafés ({filteredCafes.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Café Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCafes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No cafés found.
                  </td>
                </tr>
              ) : (
                filteredCafes.map((cafe) => (
                  <tr key={cafe.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Coffee className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cafe.name}</div>
                          <div className="text-sm text-gray-500">{cafe.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cafe.owner?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {cafe.email || 'N/A'}
                        </span>
                        <span className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {cafe.phone || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(cafe.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(cafe.is_approved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getActiveStatusBadge(cafe.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openDetails(cafe)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {cafe.is_approved === null && (
                          <>
                            <button
                              onClick={() => handleApprove(cafe.id)}
                              className="text-green-600 hover:text-green-900"
                              disabled={actionLoading[cafe.id]}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(cafe.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={actionLoading[cafe.id]}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleToggleStatus(cafe.id, cafe.is_active)}
                          className="text-gray-600 hover:text-gray-900"
                          disabled={actionLoading[cafe.id]}
                          title={cafe.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {cafe.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetails && selectedCafe && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Café Details</h3>
              <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-800 flex items-center">
                  <Coffee className="h-5 w-5 mr-2" /> Café Information
                </h4>
                <div className="ml-7 space-y-2">
                  <p><strong>Name:</strong> {selectedCafe.name}</p>
                  <p><strong>Description:</strong> {selectedCafe.description || 'N/A'}</p>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <strong>Address:</strong> {selectedCafe.address || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <strong>Email:</strong> {selectedCafe.email || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <strong>Phone:</strong> {selectedCafe.phone || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <strong>Registered:</strong> {formatDate(selectedCafe.created_at)}
                  </p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedCafe.is_approved)}</p>
                  <p><strong>Active:</strong> {getActiveStatusBadge(selectedCafe.is_active)}</p>
                </div>
              </div>
              
              {selectedCafe.owner && (
                <div>
                  <h4 className="text-lg font-medium text-gray-800 flex items-center">
                    <Users className="h-5 w-5 mr-2" /> Owner Information
                  </h4>
                  <div className="ml-7 space-y-2">
                    <p><strong>Name:</strong> {selectedCafe.owner.name}</p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <strong>Email:</strong> {selectedCafe.owner.email}
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <strong>Phone:</strong> {selectedCafe.owner.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              {selectedCafe.is_approved === null && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedCafe.id);
                      closeDetails();
                    }}
                    className="btn-primary bg-green-600 hover:bg-green-700 flex items-center"
                    disabled={actionLoading[selectedCafe.id]}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" /> Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedCafe.id);
                      closeDetails();
                    }}
                    className="btn-secondary bg-red-600 hover:bg-red-700 text-white flex items-center"
                    disabled={actionLoading[selectedCafe.id]}
                  >
                    <XCircle className="h-5 w-5 mr-2" /> Reject
                  </button>
                </>
              )}
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

export default AdminCafeManagementPage;
