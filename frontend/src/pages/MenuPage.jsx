import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const MenuPage = () => {
  const { cafeId } = useParams()
  const location = useLocation()
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Get table number from URL parameters
  const urlParams = new URLSearchParams(location.search)
  const tableNumber = urlParams.get('table')

  const { data: menuData, isLoading, error } = useQuery(
    ['menu', cafeId],
    () => api.get(`/cafes/${cafeId}/menu`).then(res => res.data),
    {
      enabled: !!cafeId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { 
        ...item, 
        quantity: 1,
        customizations: [],
        special_instructions: ''
      }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId)
      if (existingItem.quantity === 1) {
        return prev.filter(item => item.id !== itemId)
      }
      return prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const categories = menuData?.menu ? Object.keys(menuData.menu) : []
  const filteredItems = selectedCategory === 'all' 
    ? Object.values(menuData?.menu || {}).flat()
    : menuData?.menu?.[selectedCategory] || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu Not Found</h2>
          <p className="text-gray-600 mb-4">The requested cafe menu could not be loaded.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">{menuData?.cafe?.name}</h1>
                <p className="text-sm text-gray-500">{menuData?.cafe?.description}</p>
              </div>
            </div>
            <Link
              to={`/order/${cafeId}`}
              state={{ cart }}
              className="relative btn-primary"
            >
              <ShoppingCart className="h-5 w-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 py-4 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {item.image_url && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-lg font-bold text-primary-600">
                    ₹{parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                )}
                
                {/* Dietary badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.is_vegetarian && (
                    <span className="badge-success">Vegetarian</span>
                  )}
                  {item.is_vegan && (
                    <span className="badge-success">Vegan</span>
                  )}
                  {item.is_gluten_free && (
                    <span className="badge-info">Gluten Free</span>
                  )}
                </div>

                {/* Add to cart */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">
                      {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1 rounded-full bg-primary-100 hover:bg-primary-200"
                    >
                      <Plus className="h-4 w-4 text-primary-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-primary text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try selecting a different category.</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-6 right-6">
          <Link
            to={`/order/${cafeId}`}
            state={{ cart, tableNumber }}
            className="btn-primary shadow-lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart (₹{getCartTotal().toFixed(2)})
            {tableNumber && (
              <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                Table {tableNumber}
              </span>
            )}
          </Link>
        </div>
      )}
    </div>
  )
}

export default MenuPage
