import { useState } from 'react'
import { X, Table, QrCode, Download } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const TableSetupModal = ({ isOpen, onClose, onSave, cafeId, loading }) => {
  const [formData, setFormData] = useState({
    table_count: 10,
    start_number: 1,
    capacity: 4,
    location: 'main'
  })
  const [errors, setErrors] = useState({})
  const [generatedTables, setGeneratedTables] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'table_count' || name === 'start_number' || name === 'capacity' 
        ? parseInt(value) || 0 
        : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.table_count || formData.table_count < 1 || formData.table_count > 100) {
      newErrors.table_count = 'Table count must be between 1 and 100'
    }
    
    if (!formData.start_number || formData.start_number < 1) {
      newErrors.start_number = 'Start number must be at least 1'
    }
    
    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 20) {
      newErrors.capacity = 'Capacity must be between 1 and 20'
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerateTables = async () => {
    if (!validateForm()) {
      return
    }

    setIsGenerating(true)
    try {
      // Ensure all numeric values are properly converted to integers
      const validatedData = {
        total_tables: parseInt(formData.table_count) || 1,
        start_number: parseInt(formData.start_number) || 1,
        capacity: parseInt(formData.capacity) || 4,
        location: formData.location || 'Main Area'
      }
      
      // Call the API to generate tables with QR codes
      const response = await api.post(`/tables/cafe/${cafeId}/bulk`, validatedData)
      
      setGeneratedTables(response.data.tables)
      toast.success(`Generated ${response.data.tables.length} tables with QR codes!`)
    } catch (error) {
      console.error('Error generating tables:', error)
      toast.error(error.response?.data?.message || 'Failed to generate tables')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (generatedTables.length === 0) {
      setErrors({ table_count: 'Please generate tables first' })
      return
    }
    
    // Tables are already saved when generated, just close the modal
    onSave(generatedTables)
  }

  const handleClose = () => {
    setFormData({
      table_count: 10,
      start_number: 1,
      capacity: 4,
      location: 'main'
    })
    setErrors({})
    setGeneratedTables([])
    onClose()
  }

  const downloadAllQRCodes = () => {
    generatedTables.forEach(table => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = table.qr_code_image
        link.download = `table-${table.table_number}-qr.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, 100)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Setup Tables & QR Codes</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Table Configuration Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Table Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tables *
                </label>
                <input
                  type="number"
                  name="table_count"
                  value={formData.table_count}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.table_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 10"
                />
                {errors.table_count && (
                  <p className="text-red-500 text-sm mt-1">{errors.table_count}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Number *
                </label>
                <input
                  type="number"
                  name="start_number"
                  value={formData.start_number}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.start_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 1"
                />
                {errors.start_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity per Table *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 4"
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., main, outdoor"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleGenerateTables}
                disabled={isGenerating}
                className="btn-primary flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>Generate Tables & QR Codes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Tables Preview */}
          {generatedTables.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Generated Tables ({generatedTables.length})
                </h3>
                <button
                  onClick={downloadAllQRCodes}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download All QR Codes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {generatedTables.map((table) => (
                  <div key={table.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Table {table.table_number}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {table.capacity} seats • {table.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <img
                        src={table.qr_code_image}
                        alt={`QR Code for Table ${table.table_number}`}
                        className="w-20 h-20"
                      />
                    </div>
                    
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Scan to order from Table {table.table_number}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || generatedTables.length === 0}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Tables'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableSetupModal
