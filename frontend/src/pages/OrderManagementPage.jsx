import { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const OrderManagementPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Fetch orders from API
  const fetchOrders = async (showLoading = false) => {
    if (!user?.cafe?.id) return
    
    try {
      if (showLoading) setLoading(true)
      const response = await api.get(`/orders/cafe/${user.cafe.id}`)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Load orders on component mount
  useEffect(() => {
    if (user?.cafe?.id) {
      fetchOrders(true) // Show loading on initial load
    }
  }, [user?.cafe?.id])

  // Auto-refresh orders every 5 seconds (without loading spinner)
  useEffect(() => {
    if (user?.cafe?.id) {
      const interval = setInterval(() => fetchOrders(false), 5000)
      return () => clearInterval(interval)
    }
  }, [user?.cafe?.id])

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
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'No date available'
    }
    
    try {
      // Handle different date formats
      let date
      if (typeof dateString === 'string') {
        // Try ISO format first
        date = new Date(dateString)
        if (isNaN(date.getTime())) {
          // Try other common formats
          date = new Date(dateString.replace(' ', 'T'))
        }
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date format'
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateString)
      return 'Date error'
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true)
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      })
      
      // Update local state with the updated order
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      )
      
      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Track and manage incoming orders</p>
          <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Auto-refreshing every 5 seconds
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedStatus === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setSelectedStatus('pending')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedStatus === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedStatus('preparing')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedStatus === 'preparing'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Preparing
        </button>
        <button
          onClick={() => setSelectedStatus('ready')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedStatus === 'ready'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ready
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* No Cafe Warning */}
      {!user?.cafe?.id && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            No cafe found. Please make sure your account is properly set up with a cafe.
          </p>
        </div>
      )}

      {/* Orders */}
      {!loading && user?.cafe?.id && (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
          <div key={order.id} className="card">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.order_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customer: {order.customer_name}
                  </p>
                  {order.table_number && (
                    <p className="text-sm text-blue-600 font-medium">
                      Table: {order.table_number}
                      {order.table_name && ` (${order.table_name})`}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Time: {formatDate(order.created_at || order.createdAt || order.updated_at || order.updatedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ₹{order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.menu_item_name}
                      </span>
                      <span className="text-gray-900">
                        ₹{item.total_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="btn-secondary text-sm"
                      >
                        Confirm Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="btn-danger text-sm"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="btn-primary text-sm"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="btn-primary text-sm"
                    >
                      Mark as Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="btn-primary text-sm"
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'all' 
                ? 'No orders have been placed yet.'
                : `No ${selectedStatus} orders at the moment.`
              }
            </p>
          </div>
        )}
        </div>
      )}
    </div>
  )
}

export default OrderManagementPage
