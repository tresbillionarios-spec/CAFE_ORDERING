import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Save, Edit, Camera } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const CafeProfilePage = () => {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    currency: 'USD',
    tax_rate: 0,
    service_charge: 0
  })

  // Function to initialize form data from user cafe data
  const initializeFormData = (cafeData) => {
    if (!cafeData) return
    const formData = {
      name: cafeData.name || '',
      description: cafeData.description || '',
      address: cafeData.address || '',
      phone: cafeData.phone || '',
      email: cafeData.email || '',
      currency: cafeData.currency || 'USD',
      tax_rate: parseFloat(cafeData.tax_rate) || 0,
      service_charge: parseFloat(cafeData.service_charge) || 0
    }
    return formData
  }

  // Main form data initialization - this is the primary effect that should always work
  useEffect(() => {
    if (user?.cafe) {
      const newFormData = initializeFormData(user.cafe)
      setFormData(newFormData)
    }
  }, [user?.cafe])

  // Immediate initialization when user data is available
  useEffect(() => {
    if (user?.cafe && user.cafe.id) {
      const newFormData = {
        name: user.cafe.name || '',
        description: user.cafe.description || '',
        address: user.cafe.address || '',
        phone: user.cafe.phone || '',
        email: user.cafe.email || '',
        theme_color: user.cafe.theme_color || '#3B82F6',
        currency: user.cafe.currency || 'USD',
        tax_rate: parseFloat(user.cafe.tax_rate) || 0,
        service_charge: parseFloat(user.cafe.service_charge) || 0
      }
      setFormData(newFormData)
    }
  }, [user?.cafe?.id])

  // Backup effect - this ensures form data is set even if the main effect fails
  useEffect(() => {
    if (user?.cafe && user.cafe.id) {
      const newFormData = initializeFormData(user.cafe)
      setFormData(newFormData)
    }
  }, [user?.cafe?.id])

  // Emergency effect - this runs whenever user.cafe changes at all
  useEffect(() => {
    if (user?.cafe) {
      const newFormData = initializeFormData(user.cafe)
      setFormData(newFormData)
    }
  }, [user?.cafe])


  // Force input field update when form data changes
  useEffect(() => {
    if (formData.phone || formData.email) {
      // Force a re-render by updating the form data again
      setFormData(prev => ({ ...prev }))
    }
  }, [formData.phone, formData.email])

  // Force user data refresh if cafe data is missing
  useEffect(() => {
    if (user && !user.cafe) {
      refreshUser()
    }
  }, [user])

  // Always refresh user data when component becomes visible
  useEffect(() => {
    refreshUser()
  }, []) // Run when component mounts

  // Update form data whenever user data changes
  useEffect(() => {
    if (user?.cafe) {
      const newFormData = initializeFormData(user.cafe)
      setFormData(newFormData)
    }
  }, [user?.cafe])

  // Force form data update if it's empty but user data is available
  useEffect(() => {
    if (user?.cafe && (!formData.phone || !formData.email)) {
      const newFormData = initializeFormData(user.cafe)
      setFormData(newFormData)
    }
  }, [user?.cafe, formData.phone, formData.email])

  // Component mount effect - ensure form data is loaded when component mounts
  useEffect(() => {
    refreshUser()
  }, []) // Run only on mount


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tax_rate' || name === 'service_charge' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.cafe?.id) {
      toast.error('No cafe found to update')
      return
    }

    try {
      setSaving(true)
      
      // Remove phone and email from form data since they're not editable
      const { phone, email, ...updateData } = formData
      
      const response = await api.put(`/cafes/${user.cafe.id}`, updateData)
      
      toast.success('Cafe profile updated successfully!')
      
      // Refresh user data to get updated cafe information
      await refreshUser()
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating cafe:', error)
      toast.error(error.response?.data?.message || 'Failed to update cafe profile')
    } finally {
      setSaving(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }


  if (!user?.cafe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No Cafe Found</h2>
          <p className="mt-2 text-gray-600">Please create a cafe first to manage your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cafe Profile</h1>
          <p className="text-gray-600">Manage your cafe's information and settings</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary"
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

        <form key={`${user?.cafe?.id || 'no-cafe'}-${formData.phone || 'no-phone'}-${formData.email || 'no-email'}`} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Cafe Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Business Settings</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="service_charge" className="block text-sm font-medium text-gray-700">
                  Service Charge (%)
                </label>
                <input
                  type="number"
                  id="service_charge"
                  name="service_charge"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.service_charge}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default CafeProfilePage
