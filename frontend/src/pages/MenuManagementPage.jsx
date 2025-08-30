import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { menuAPI } from '../services/api'
import AddMenuItemModal from '../components/AddMenuItemModal'
import { useAuth } from '../contexts/AuthContext'

const MenuManagementPage = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [error, setError] = useState(null)
  const { user, isAuthenticated } = useAuth()

  // Get user's cafe info from auth context
  const userCafe = user?.cafe
  
  // Debug logging
  useEffect(() => {
    console.log('User data:', user)
    console.log('User cafe:', userCafe)
    console.log('Is authenticated:', isAuthenticated)
  }, [user, userCafe, isAuthenticated])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated])

  // Fetch menu items
  const fetchMenuItems = async () => {
    if (!userCafe?.id) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await menuAPI.getMenuItems(userCafe.id)
      setMenuItems(response.data.menu_items || [])
    } catch (err) {
      console.error('Error fetching menu items:', err)
      setError('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [userCafe])

  // Add new menu item
  const handleAddMenuItem = async (menuData) => {
    if (!userCafe?.id) {
      setError('No cafe found. Please contact support.')
      return
    }

    try {
      setAddLoading(true)
      setError(null)
      
      const response = await menuAPI.addMenuItem({
        ...menuData,
        cafe_id: userCafe.id
      })
      
      // Add the new item to the list
      setMenuItems(prev => [...prev, response.data.menu_item])
      setShowAddModal(false)
      
      // Show success message (you can add a toast notification here)
      console.log('Menu item added successfully!')
    } catch (err) {
      console.error('Error adding menu item:', err)
      setError(err.response?.data?.message || 'Failed to add menu item')
    } finally {
      setAddLoading(false)
    }
  }

  // Toggle item availability
  const toggleAvailability = async (id) => {
    try {
      const item = menuItems.find(item => item.id === id)
      if (!item) return

      const response = await menuAPI.updateMenuItem(id, {
        is_available: !item.is_available
      })

      setMenuItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, is_available: !item.is_available }
            : item
        )
      )
    } catch (err) {
      console.error('Error updating menu item:', err)
      setError('Failed to update menu item')
    }
  }

  // Delete menu item
  const handleDeleteMenuItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return
    }

    try {
      await menuAPI.deleteMenuItem(id)
      setMenuItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Error deleting menu item:', err)
      setError('Failed to delete menu item')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Checking authentication...</span>
      </div>
    )
  }

  if (!userCafe) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">No cafe found</div>
          <p className="text-gray-600">Please make sure your account is properly set up with a cafe.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading menu items...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your cafe's menu items</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          disabled={!userCafe?.id}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* No Cafe Warning */}
      {!userCafe?.id && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-medium">
                No cafe found. Please create a cafe to manage your menu.
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                You need to set up your cafe profile first.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/create-cafe'}
              className="btn-primary"
            >
              Create Cafe
            </button>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
          <p className="text-sm text-gray-600">
            {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="card-body">
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first menu item.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                  disabled={!userCafe?.id}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.is_available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_available ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Available
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Unavailable
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dietary Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.is_vegetarian).length}
            </div>
            <div className="text-sm text-gray-600">Vegetarian Items</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.is_vegan).length}
            </div>
            <div className="text-sm text-gray-600">Vegan Items</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.is_gluten_free).length}
            </div>
            <div className="text-sm text-gray-600">Gluten Free Items</div>
          </div>
        </div>
      </div>

      {/* Add Menu Item Modal */}
      <AddMenuItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMenuItem}
        loading={addLoading}
      />
    </div>
  )
}

export default MenuManagementPage
