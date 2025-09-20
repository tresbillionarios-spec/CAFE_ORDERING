import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingCart, 
  DollarSign, 
  Coffee,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Package,
  Bell,
  Trophy,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
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
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

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
)

const CafeDashboardPage = () => {
  const { user } = useAuth()
  const cafeId = user?.cafe?.id

  const { data: dashboardData, isLoading, isFetching } = useQuery(
    ['dashboard', cafeId],
    () => api.get(`/cafes/${cafeId}/dashboard`).then(res => res.data),
    {
      enabled: !!cafeId,
      refetchInterval: 5000, // Refresh every 5 seconds
      refetchIntervalInBackground: true, // Continue refreshing even when tab is not active
    }
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'confirmed':
        return 'text-blue-600 bg-blue-100'
      case 'preparing':
        return 'text-orange-600 bg-orange-100'
      case 'ready':
        return 'text-green-600 bg-green-100'
      case 'completed':
        return 'text-gray-600 bg-gray-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
      case 'preparing':
        return <AlertCircle className="h-4 w-4" />
      case 'ready':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatChangePercent = (percent) => {
    const isPositive = percent >= 0
    return {
      value: Math.abs(percent),
      isPositive,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const dashboard = dashboardData?.dashboard || {}
  const metrics = dashboard.metrics || {}
  const trends = dashboard.trends || {}
  const operations = dashboard.operations || {}
  const engagement = dashboard.engagement || {}
  const recentOrders = dashboard.recent_orders || []

  // Debug logging to see what data we're getting
  // console.log('Dashboard Data:', dashboardData)
  // console.log('Dashboard:', dashboard)
  // console.log('Metrics:', metrics)
  // console.log('Trends:', trends)
  // console.log('Operations:', operations)
  // console.log('Engagement:', engagement)

  // Fallback data for when API doesn't return expected structure
  const fallbackMetrics = {
    total_orders_today: 0,
    order_change_percent: 0,
    total_revenue_today: 0,
    revenue_change_percent: 0,
    pending_orders_count: 0,
    active_cafes_count: 1
  }

  const fallbackTrends = {
    sales_trend: [],
    top_selling_items: [],
    payment_distribution: [],
    peak_hours: []
  }

  const fallbackOperations = {
    orders_in_progress: [],
    inventory_alerts: []
  }

  const fallbackEngagement = {
    achievement_percent: 0,
    achievement_message: "Keep up the great work!"
  }

  // Use fallback data if API data is missing
  const safeMetrics = Object.keys(metrics).length > 0 ? metrics : fallbackMetrics
  const safeTrends = Object.keys(trends).length > 0 ? trends : fallbackTrends
  const safeOperations = Object.keys(operations).length > 0 ? operations : fallbackOperations
  const safeEngagement = Object.keys(engagement).length > 0 ? engagement : fallbackEngagement

  // Chart data preparation using safe data
  const salesTrendData = {
    labels: safeTrends.sales_trend?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'Orders',
        data: safeTrends.sales_trend?.map(item => item.orders) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Revenue (₹)',
        data: safeTrends.sales_trend?.map(item => item.revenue) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  }

  const topItemsData = {
    labels: safeTrends.top_selling_items?.map(item => item.name) || [],
    datasets: [
      {
        data: safeTrends.top_selling_items?.map(item => item.quantity) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      }
    ]
  }

  const paymentData = {
    labels: safeTrends.payment_distribution?.map(item => item.method) || [],
    datasets: [
      {
        data: safeTrends.payment_distribution?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      }
    ]
  }

  const peakHoursData = {
    labels: safeTrends.peak_hours?.map(item => `${item.hour}:00`) || [],
    datasets: [
      {
        label: 'Orders',
        data: safeTrends.peak_hours?.map(item => item.orders) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ]
  }

  const orderChange = formatChangePercent(safeMetrics.order_change_percent || 0)
  const revenueChange = formatChangePercent(safeMetrics.revenue_change_percent || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Auto-refreshing every 5 seconds</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders Today */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Orders Today</p>
                  <p className="text-2xl font-semibold text-gray-900">{safeMetrics.total_orders_today || 0}</p>
                </div>
              </div>
              <div className={`flex items-center text-sm ${orderChange.color}`}>
                {orderChange.icon}
                <span className="ml-1">{orderChange.value}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs yesterday</p>
          </div>
        </div>

        {/* Total Revenue Today */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                    ₹{(safeMetrics.total_revenue_today || 0).toFixed(2)}
                </p>
                </div>
              </div>
              <div className={`flex items-center text-sm ${revenueChange.color}`}>
                {revenueChange.icon}
                <span className="ml-1">{revenueChange.value}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs yesterday</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{safeMetrics.pending_orders_count || 0}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </div>
        </div>

        {/* Active Cafes */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Coffee className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Café</p>
                <p className="text-2xl font-semibold text-gray-900">{safeMetrics.active_cafes_count || 1}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Your café</p>
          </div>
        </div>
      </div>

      {/* Visual Insights - Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Sales Trend (7 Days)</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64">
              <Line 
                data={salesTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Orders'
                      }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Revenue (₹)'
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Top Selling Items</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64">
              <Doughnut 
                data={topItemsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64">
              <Pie 
                data={paymentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Peak Order Hours */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Peak Order Hours</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="h-64">
              <Bar 
                data={peakHoursData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Orders'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operations Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders in Progress */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Orders in Progress</h3>
            </div>
          </div>
          <div className="card-body">
            {safeOperations.orders_in_progress?.length > 0 ? (
              <div className="space-y-3">
                {safeOperations.orders_in_progress.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">
                        {order.items?.map(item => `${item.name} (${item.quantity})`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
                <p className="mt-1 text-sm text-gray-500">No orders in progress right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Alerts & Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Alerts & Notifications</h3>
            </div>
          </div>
          <div className="card-body">
            {safeOperations.inventory_alerts?.length > 0 ? (
              <div className="space-y-3">
                {safeOperations.inventory_alerts.map((alert, index) => (
                  <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-900">{alert.message}</p>
                      <p className="text-sm text-red-600">Action needed</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">All good!</h3>
                <p className="mt-1 text-sm text-gray-500">No alerts at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement & Gamification */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Achievement</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{safeEngagement.achievement_message || "Keep up the great work!"}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${safeEngagement.achievement_percent || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{safeEngagement.achievement_percent || 0}% of monthly target</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="card-body">
          {recentOrders.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Coffee className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Orders will appear here once customers start placing them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CafeDashboardPage
