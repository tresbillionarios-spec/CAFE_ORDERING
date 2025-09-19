import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { CheckCircle, Clock, AlertCircle, XCircle, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const OrderTrackingPage = () => {
  const { orderNumber } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch order data
  const fetchOrderData = async (showLoading = false) => {
    if (!orderNumber) {
      setError('No order number provided')
      return
    }
    
    try {
      if (showLoading) setIsLoading(true)
      setIsFetching(true)
      const response = await api.get(`/orders/track/${orderNumber}`)
      setOrderData(response.data)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching order:', err)
      setError(err.response?.data?.message || 'Failed to fetch order')
    } finally {
      if (showLoading) setIsLoading(false)
      setIsFetching(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (orderNumber) {
      fetchOrderData(true)
    }
  }, [orderNumber])

  // Auto-refresh every 5 seconds (without loading spinner)
  useEffect(() => {
    if (orderNumber) {
      const interval = setInterval(() => fetchOrderData(false), 5000)
      return () => clearInterval(interval)
    }
  }, [orderNumber])

  // Manual refresh function
  const refetch = () => fetchOrderData(true)

  const formatDateTime = (input) => {
    if (!input) return '—'
    const tryParse = (val) => {
      const d = new Date(val)
      return isNaN(d) ? null : d
    }

    // Try direct parsing
    let date = tryParse(input)
    if (!date && typeof input === 'string') {
      // Handle common non-ISO format: "YYYY-MM-DD HH:mm:ss"
      date = tryParse(input.replace(' ', 'T'))
    }
    if (!date) {
      const asNumber = Number(input)
      if (!Number.isNaN(asNumber)) {
        date = tryParse(asNumber)
      }
    }
    return date ? date.toLocaleString() : '—'
  }

  const sanitizeName = (name) => {
    const value = name || ''
    const normalized = String(value).trim().toLowerCase()
    if (!normalized || normalized === 'na' || normalized === 'n/a') return 'Guest'
    return value
  }

  const getStatusStep = (status) => {
    const steps = [
      { key: 'pending', label: 'Order Received', icon: Clock, color: 'text-yellow-600' },
      { key: 'confirmed', label: 'Order Confirmed', icon: AlertCircle, color: 'text-blue-600' },
      { key: 'preparing', label: 'Preparing', icon: AlertCircle, color: 'text-orange-600' },
      { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle, color: 'text-green-600' },
      { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-600' },
      { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600' }
    ]
    
    const currentIndex = steps.findIndex(step => step.key === status)
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !orderData?.order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Not Found</h2>
          <p className="mt-2 text-gray-600">
            {error || 'The order you\'re looking for doesn\'t exist.'}
          </p>
          {orderNumber && (
            <p className="mt-1 text-sm text-gray-500">
              Order Number: {orderNumber}
            </p>
          )}
        </div>
      </div>
    )
  }

  const order = orderData.order
  const steps = getStatusStep(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.order_number}
              </h1>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh order status"
              >
                <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-gray-600">{order.cafe?.name}</p>
            {isFetching && (
              <p className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Auto-refreshing every 5 seconds...
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  <step.icon className={`h-5 w-5 ${
                    step.completed ? step.color : 'text-gray-400'
                  }`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {step.current && (
                  <span className="text-xs text-primary-600 font-medium">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{sanitizeName(order.customer_name || order.customerName)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Time:</span>
              <span className="font-medium">
                {formatDateTime(order.created_at ?? order.createdAt ?? order.updated_at ?? order.updatedAt)}
              </span>
            </div>
            
            {order.estimated_preparation_time && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Time:</span>
                <span className="font-medium">{order.estimated_preparation_time} minutes</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.menu_item_name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  {item.special_instructions && (
                    <p className="text-sm text-gray-500 italic">
                      Note: {item.special_instructions}
                    </p>
                  )}
                </div>
                <span className="font-medium text-gray-900">
                  ₹{parseFloat(item.total_price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary-600">
                ₹{parseFloat(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h2>
            <p className="text-gray-700">{order.special_instructions}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage
