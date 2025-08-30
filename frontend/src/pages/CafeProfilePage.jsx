import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Save, Edit, Camera } from 'lucide-react'

const CafeProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.cafe?.name || '',
    description: user?.cafe?.description || '',
    address: user?.cafe?.address || '',
    phone: user?.cafe?.phone || '',
    email: user?.cafe?.email || '',
    theme_color: user?.cafe?.theme_color || '#3B82F6',
    currency: user?.cafe?.currency || 'USD',
    tax_rate: user?.cafe?.tax_rate || 0,
    service_charge: user?.cafe?.service_charge || 0
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement save functionality
    setIsEditing(false)
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

      <form onSubmit={handleSubmit}>
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input mt-1"
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

          {/* Appearance */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label htmlFor="theme_color" className="block text-sm font-medium text-gray-700">
                  Theme Color
                </label>
                <div className="flex items-center space-x-3 mt-1">
                  <input
                    type="color"
                    id="theme_color"
                    name="theme_color"
                    value={formData.theme_color}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.theme_color}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div 
                  className="h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: formData.theme_color + '20' }}
                >
                  <span 
                    className="text-sm font-medium"
                    style={{ color: formData.theme_color }}
                  >
                    Your cafe theme color
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default CafeProfilePage
