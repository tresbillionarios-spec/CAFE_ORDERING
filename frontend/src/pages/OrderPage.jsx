import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeft, CreditCard, DollarSign, Smartphone } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const OrderPage = () => {
  const { cafeId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    special_instructions: '',
    payment_method: 'cash'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cart = location.state?.cart || []
  const tableNumber = location.state?.tableNumber

  const { data: cafeData, isLoading } = useQuery(
    ['cafe', cafeId],
    () => api.get(`/cafes/${cafeId}`).then(res => res.data),
    {
      enabled: !!cafeId,
    }
  )

  useEffect(() => {
    if (cart.length === 0) {
      navigate(`/menu/${cafeId}`)
    }
  }, [cart, cafeId, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * (cafeData?.cafe?.tax_rate || 0)) / 100
  }

  const calculateServiceCharge = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * (cafeData?.cafe?.service_charge || 0)) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateServiceCharge()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    if (!formData.customer_name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (formData.customer_name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long')
      return
    }

    if (formData.customer_phone && formData.customer_phone.trim()) {
      // Basic phone validation - allow common formats
      const cleanPhone = formData.customer_phone.replace(/[\s\-\(\)\+]/g, '')
      const phoneRegex = /^[1-9]\d{9,14}$/
      if (!phoneRegex.test(cleanPhone)) {
        toast.error('Please enter a valid phone number (10-15 digits)')
        return
      }
    }

    if (formData.customer_email && formData.customer_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.customer_email)) {
        toast.error('Please enter a valid email address')
        return
      }
    }

    if (cart.length === 0) {
      toast.error('Please add items to your cart')
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        cafe_id: cafeId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        special_instructions: formData.special_instructions,
        payment_method: formData.payment_method,
        table_number: tableNumber,
        items: cart.map(item => ({
          menu_id: item.id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || '',
          customizations: Array.isArray(item.customizations) ? item.customizations : []
        }))
      }

      const response = await api.post('/orders', orderData)
      
      toast.success('Order placed successfully!')
      navigate(`/track/${response.data.order.order_number}`)
    } catch (error) {
      if (error.response?.data?.details) {
        // Show specific validation errors
        const validationErrors = error.response.data.details
        validationErrors.forEach(err => {
          toast.error(`${err.path}: ${err.msg}`)
        })
      } else {
        const message = error.response?.data?.message || 'Failed to place order'
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/menu/${cafeId}`)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Complete Order</h1>
                <p className="text-sm text-gray-500">{cafeData?.cafe?.name}</p>
                {tableNumber && (
                  <p className="text-sm text-blue-600 font-medium">Table {tableNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Details</h2>
              
              {tableNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Table {tableNumber}</strong> - Your order will be delivered to this table
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    required
                    minLength="2"
                    maxLength="100"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="input mt-1"
                    placeholder="John Doe"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 2 characters long</p>
                </div>

                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className="input mt-1"
                    placeholder="1234567890"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - 10-15 digits (e.g., 1234567890)</p>
                </div>

                <div>
                  <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="input mt-1"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700">
                    Special Instructions
                  </label>
                  <textarea
                    id="special_instructions"
                    name="special_instructions"
                    rows={3}
                    value={formData.special_instructions}
                    onChange={handleInputChange}
                    className="input mt-1"
                    placeholder="Any special requests or dietary requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash"
                        checked={formData.payment_method === 'cash'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-3 flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        Cash
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="card"
                        checked={formData.payment_method === 'card'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-3 flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                        Card
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `Place Order - ₹${calculateTotal().toFixed(2)}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                {calculateTax() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">₹{calculateTax().toFixed(2)}</span>
                  </div>
                )}
                {calculateServiceCharge() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Charge</span>
                    <span className="text-gray-900">₹{calculateServiceCharge().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-600">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderPage
