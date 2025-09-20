import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  Coffee, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';
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
  Legend,
} from 'chart.js';

// Register Chart.js components
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

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatChangePercent = (current, previous) => {
    if (!previous || previous === 0) return { value: '0%', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      isPositive: change >= 0
    };
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

  const data = dashboardData || {
    metrics: {
      totalOrdersToday: 0,
      totalRevenueToday: 0,
      pendingCafeApprovals: 0,
      activeCafes: 0,
      totalUsers: 0,
      totalOrders: 0
    },
    trends: {
      salesTrend: [],
      paymentDistribution: [],
      topPerformingCafes: []
    }
  };

  // Sales Trend Chart Data
  const salesTrendData = {
    labels: data.trends.salesTrend.map(item => item.date),
    datasets: [
      {
        label: 'Orders',
        data: data.trends.salesTrend.map(item => item.orders),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Revenue',
        data: data.trends.salesTrend.map(item => item.revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Payment Distribution Chart Data
  const paymentData = {
    labels: data.trends.paymentDistribution.map(item => item.method),
    datasets: [
      {
        data: data.trends.paymentDistribution.map(item => item.count),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ]
      }
    ]
  };

  // Top Performing Cafes Chart Data
  const topCafesData = {
    labels: data.trends.topPerformingCafes.map(cafe => cafe.name),
    datasets: [
      {
        label: 'Orders',
        data: data.trends.topPerformingCafes.map(cafe => cafe.orders),
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }
    ]
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your café ordering platform</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="text-sm text-gray-500 flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={fetchDashboardData}
            className="btn-primary flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders Today</p>
              <p className="text-2xl font-semibold text-gray-900">{data.metrics.totalOrdersToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue Today</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.metrics.totalRevenueToday)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-semibold text-gray-900">{data.metrics.pendingCafeApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Coffee className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Cafés</p>
              <p className="text-2xl font-semibold text-gray-900">{data.metrics.activeCafes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{data.metrics.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{data.metrics.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h3>
          <div className="h-64">
            <Line 
              data={salesTrendData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Payment Distribution Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={paymentData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Performing Cafes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Cafés</h3>
        <div className="h-64">
          <Bar 
            data={topCafesData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Review Pending Approvals</h4>
            <p className="text-sm text-gray-500">Manage café registration requests</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Coffee className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Cafés</h4>
            <p className="text-sm text-gray-500">View and edit café information</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">View All Orders</h4>
            <p className="text-sm text-gray-500">Monitor orders across all cafés</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Users className="h-6 w-6 text-indigo-600 mb-2" />
            <h4 className="font-medium text-gray-900">User Management</h4>
            <p className="text-sm text-gray-500">Manage users and permissions</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
