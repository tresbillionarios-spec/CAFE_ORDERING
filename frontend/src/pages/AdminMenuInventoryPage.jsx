import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Coffee,
  Utensils,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminMenuInventoryPage = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cafe: 'all',
    category: 'all',
    status: 'all',
    stockStatus: 'all'
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMenuItems();
      fetchCafes();
      fetchCategories();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.cafe !== 'all') params.append('cafe_id', filters.cafe);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.status !== 'all') params.append('is_available', filters.status);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/admin/menu-items?${params.toString()}`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCafes = async () => {
    try {
      const response = await api.get('/admin/cafes');
      setCafes(response.data);
    } catch (error) {
      console.error('Error fetching cafés:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/menu-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [itemId]: 'toggle' }));
      await api.put(`/admin/menu-items/${itemId}/toggle-availability`);
      toast.success(`Menu item ${currentStatus ? 'disabled' : 'enabled'} successfully`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      toast.error('Failed to update menu item status');
    } finally {
      setActionLoading(prev => ({ ...prev, [itemId]: null }));
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [itemId]: 'delete' }));
      await api.delete(`/admin/menu-items/${itemId}`);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    } finally {
      setActionLoading(prev => ({ ...prev, [itemId]: null }));
    }
  };

  const getStockStatus = (item) => {
    if (!item.stock_quantity) return { status: 'unlimited', color: 'text-gray-600', icon: Package };
    if (item.stock_quantity <= 0) return { status: 'out_of_stock', color: 'text-red-600', icon: XCircle };
    if (item.stock_quantity <= 5) return { status: 'low_stock', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'in_stock', color: 'text-green-600', icon: CheckCircle };
  };

  const getStockStatusBadge = (item) => {
    const stockInfo = getStockStatus(item);
    const Icon = stockInfo.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockInfo.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {stockInfo.status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" /> Available
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" /> Unavailable
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const openDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedItem(null);
    setShowDetails(false);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.cafe?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (filters.cafe === 'all' || item.cafe_id === filters.cafe) &&
      (filters.category === 'all' || item.category === filters.category) &&
      (filters.status === 'all' || item.is_available === (filters.status === 'available'));
    
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
          <h1 className="text-3xl font-bold text-gray-900">Menu & Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage menu items and inventory across all cafés</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchMenuItems}
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-sm font-medium text-yellow-800">Inventory Alerts</h3>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          {menuItems.filter(item => getStockStatus(item).status === 'low_stock').length} items are running low on stock
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="in_stock">In Stock</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchMenuItems}
            className="btn-primary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Menu Items ({filteredItems.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Café
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {item.image_url ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={item.image_url} alt={item.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Utensils className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                        {item.cafe?.name || 'Unknown Café'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getStockStatusBadge(item)}
                        {item.stock_quantity && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({item.stock_quantity} units)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getAvailabilityBadge(item.is_available)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openDetails(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          className="text-gray-600 hover:text-gray-900"
                          disabled={actionLoading[item.id]}
                          title={item.is_available ? 'Disable' : 'Enable'}
                        >
                          {item.is_available ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={actionLoading[item.id]}
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Item Details Modal */}
      {showDetails && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Menu Item Details</h3>
              <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800">Item Information</h4>
                  <p><strong>Name:</strong> {selectedItem.name}</p>
                  <p><strong>Description:</strong> {selectedItem.description || 'N/A'}</p>
                  <p><strong>Category:</strong> {selectedItem.category || 'N/A'}</p>
                  <p><strong>Price:</strong> {formatCurrency(selectedItem.price)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Inventory & Status</h4>
                  <p><strong>Stock:</strong> {selectedItem.stock_quantity || 'Unlimited'}</p>
                  <p><strong>Status:</strong> {getAvailabilityBadge(selectedItem.is_available)}</p>
                  <p><strong>Stock Status:</strong> {getStockStatusBadge(selectedItem)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800">Café Information</h4>
                <p><strong>Café:</strong> {selectedItem.cafe?.name || 'Unknown'}</p>
                <p><strong>Address:</strong> {selectedItem.cafe?.address || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  handleToggleAvailability(selectedItem.id, selectedItem.is_available);
                  closeDetails();
                }}
                className="btn-secondary"
                disabled={actionLoading[selectedItem.id]}
              >
                {selectedItem.is_available ? 'Disable' : 'Enable'} Item
              </button>
              <button onClick={closeDetails} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuInventoryPage;
