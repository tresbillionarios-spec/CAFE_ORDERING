import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Coffee, Save, Table } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import TableSetupModal from '../components/TableSetupModal'
import toast from 'react-hot-toast'

const CafeCreationPage = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    theme_color: '#3B82F6',
    currency: 'USD',
    tax_rate: 8.5,
    service_charge: 10
  })
  const [showTableSetup, setShowTableSetup] = useState(false)
  const [createdCafeId, setCreatedCafeId] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const response = await api.post('/cafes', formData)
      
      toast.success('Cafe created successfully!')
      
      // Store the created cafe ID for table setup
      setCreatedCafeId(response.data.cafe.id)
      
      // Show table setup modal
      setShowTableSetup(true)
    } catch (error) {
      console.error('Error creating cafe:', error)
      toast.error(error.response?.data?.message || 'Failed to create cafe')
    } finally {
      setLoading(false)
    }
  }

  const handleTableSetupComplete = async (tables) => {
    try {
      setLoading(true)
      
      // Create tables in bulk
      await api.post(`/tables/cafe/${createdCafeId}/bulk`, {
        table_count: tables.length,
        start_number: tables[0]?.table_number || 1,
        capacity: tables[0]?.capacity || 4,
        location: tables[0]?.location || 'main'
      })
      
      toast.success(`Successfully created ${tables.length} tables with QR codes!`)
      
      // Refresh user data to include the new cafe
      await refreshUser()
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating tables:', error)
      toast.error('Cafe created but failed to create tables. You can add tables later.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Coffee className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create Your Cafe
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Set up your cafe profile to start managing your menu and orders
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Cafe Name *
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="My Amazing Cafe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Tell customers about your cafe..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1">
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="123 Main Street, City, State"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="cafe@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <div className="mt-1">
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="theme_color" className="block text-sm font-medium text-gray-700">
                  Theme Color
                </label>
                <div className="mt-1">
                  <input
                    id="theme_color"
                    name="theme_color"
                    type="color"
                    value={formData.theme_color}
                    onChange={handleInputChange}
                    className="input h-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <div className="mt-1">
                  <input
                    id="tax_rate"
                    name="tax_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.tax_rate}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="8.5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service_charge" className="block text-sm font-medium text-gray-700">
                  Service Charge (%)
                </label>
                <div className="mt-1">
                  <input
                    id="service_charge"
                    name="service_charge"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.service_charge}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center items-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Cafe
                  </>
                )}
              </button>
            </div>
            
            {/* Table Setup Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Table className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">QR Code Tables</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    After creating your cafe, you'll be able to set up tables with QR codes for easy ordering.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Table Setup Modal */}
      <TableSetupModal
        isOpen={showTableSetup}
        onClose={() => {
          setShowTableSetup(false)
          // Refresh user data and redirect to dashboard
          refreshUser().then(() => navigate('/dashboard'))
        }}
        onSave={handleTableSetupComplete}
        cafeId={createdCafeId}
        loading={loading}
      />
    </div>
  )
}

export default CafeCreationPage
