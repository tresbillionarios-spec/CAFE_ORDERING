import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const OrderTrackingPage = () => {
  const { orderNumber } = useParams()

  const { data: orderData, isLoading, error } = useQuery(
    ['order-tracking', orderNumber],
    () => api.get(`/orders/track/${orderNumber}`).then(res => res.data),
    {
      enabled: !!orderNumber,
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  )

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
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600">{order.cafe?.name}</p>
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
              <span className="font-medium">{order.customer_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Time:</span>
              <span className="font-medium">
                {new Date(order.created_at).toLocaleString()}
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
