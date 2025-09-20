import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Download,
  Eye,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Clock,
  Coffee,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminFinancePage = () => {
  const { user } = useAuth();
  const [financeData, setFinanceData] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: '30',
    cafe_id: 'all',
    status: 'all',
    date_from: '',
    date_to: ''
  });
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchFinanceData();
      fetchSettlements();
      fetchCafes();
    }
  }, [user]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.cafe_id !== 'all') params.append('cafe_id', filters.cafe_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/admin/finance/overview?${params.toString()}`);
      setFinanceData(response.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast.error('Failed to fetch finance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.cafe_id !== 'all') params.append('cafe_id', filters.cafe_id);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/admin/finance/settlements?${params.toString()}`);
      setSettlements(response.data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
      toast.error('Failed to fetch settlements');
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

  const handleProcessSettlement = async (settlementId) => {
    try {
      setActionLoading(prev => ({ ...prev, [settlementId]: 'process' }));
      await api.put(`/admin/finance/settlements/${settlementId}/process`);
      toast.success('Settlement processed successfully');
      fetchSettlements();
    } catch (error) {
      console.error('Error processing settlement:', error);
      toast.error('Failed to process settlement');
    } finally {
      setActionLoading(prev => ({ ...prev, [settlementId]: null }));
    }
  };

  const handleRejectSettlement = async (settlementId) => {
    try {
      setActionLoading(prev => ({ ...prev, [settlementId]: 'reject' }));
      await api.put(`/admin/finance/settlements/${settlementId}/reject`);
      toast.success('Settlement rejected');
      fetchSettlements();
    } catch (error) {
      console.error('Error rejecting settlement:', error);
      toast.error('Failed to reject settlement');
    } finally {
      setActionLoading(prev => ({ ...prev, [settlementId]: null }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'processed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
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

  const openDetails = (settlement) => {
    setSelectedSettlement(settlement);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedSettlement(null);
    setShowDetails(false);
  };

  const applyFilters = () => {
    fetchFinanceData();
    fetchSettlements();
  };

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

  // Chart Data
  const revenueChartData = {
    labels: financeData?.revenueTrend?.map(data => data.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: financeData?.revenueTrend?.map(data => data.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      }
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)',
        },
      },
    },
  };

  const paymentMethodData = {
    labels: financeData?.paymentDistribution?.map(data => data.method) || [],
    datasets: [
      {
        data: financeData?.paymentDistribution?.map(data => data.amount) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentMethodOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Payment Method Distribution',
      },
    },
  };

  const cafeRevenueData = {
    labels: financeData?.cafeRevenue?.map(data => data.cafe_name) || [],
    datasets: [
      {
        label: 'Revenue',
        data: financeData?.cafeRevenue?.map(data => data.revenue) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const cafeRevenueOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue by Café',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)',
        },
      },
    },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance & Settlements</h1>
          <p className="text-gray-600 mt-1">Manage revenue, settlements, and financial reports</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={applyFilters}
            className="btn-primary flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {/* Export functionality */}}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Café</label>
            <select
              value={filters.cafe_id}
              onChange={(e) => setFilters(prev => ({ ...prev, cafe_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cafés</option>
              {cafes.map(cafe => (
                <option key={cafe.id} value={cafe.id}>{cafe.name}</option>
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
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
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
            onClick={applyFilters}
            className="btn-primary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(financeData?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Platform Commission</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(financeData?.platformCommission || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Settlements</p>
              <p className="text-2xl font-semibold text-gray-900">
                {financeData?.pendingSettlements || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Processed Settlements</p>
              <p className="text-2xl font-semibold text-gray-900">
                {financeData?.processedSettlements || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <Line data={revenueChartData} options={revenueChartOptions} />
        </div>
        <div className="bg-white shadow rounded-lg p-6 flex justify-center items-center">
          <div className="w-full max-w-md">
            <Doughnut data={paymentMethodData} options={paymentMethodOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Bar data={cafeRevenueData} options={cafeRevenueOptions} />
      </div>

      {/* Settlements Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settlements ({settlements.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settlement ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Café
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No settlements found.
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => (
                  <tr key={settlement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {settlement.settlement_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                        {settlement.cafe?.name || 'Unknown Café'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(settlement.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(settlement.commission_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(settlement.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(settlement.period_start)} - {formatDate(settlement.period_end)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openDetails(settlement)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {settlement.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleProcessSettlement(settlement.id)}
                              className="text-green-600 hover:text-green-900"
                              disabled={actionLoading[settlement.id]}
                              title="Process Settlement"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectSettlement(settlement.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={actionLoading[settlement.id]}
                              title="Reject Settlement"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          </>
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

      {/* Settlement Details Modal */}
      {showDetails && selectedSettlement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Settlement Details</h3>
              <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">
                <AlertCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800">Settlement Information</h4>
                  <p><strong>ID:</strong> {selectedSettlement.settlement_id}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedSettlement.status)}</p>
                  <p><strong>Period:</strong> {formatDate(selectedSettlement.period_start)} - {formatDate(selectedSettlement.period_end)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Financial Details</h4>
                  <p><strong>Total Amount:</strong> {formatCurrency(selectedSettlement.total_amount)}</p>
                  <p><strong>Commission:</strong> {formatCurrency(selectedSettlement.commission_amount)}</p>
                  <p><strong>Net Amount:</strong> {formatCurrency(selectedSettlement.net_amount)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800">Café Information</h4>
                <p><strong>Café:</strong> {selectedSettlement.cafe?.name || 'Unknown'}</p>
                <p><strong>Owner:</strong> {selectedSettlement.cafe?.owner?.name || 'N/A'}</p>
                <p><strong>Contact:</strong> {selectedSettlement.cafe?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              {selectedSettlement.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleProcessSettlement(selectedSettlement.id);
                      closeDetails();
                    }}
                    className="btn-primary bg-green-600 hover:bg-green-700"
                    disabled={actionLoading[selectedSettlement.id]}
                  >
                    Process Settlement
                  </button>
                  <button
                    onClick={() => {
                      handleRejectSettlement(selectedSettlement.id);
                      closeDetails();
                    }}
                    className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
                    disabled={actionLoading[selectedSettlement.id]}
                  >
                    Reject Settlement
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

export default AdminFinancePage;
