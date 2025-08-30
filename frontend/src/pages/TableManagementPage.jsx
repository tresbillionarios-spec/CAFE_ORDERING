import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { Table, Plus, QrCode, Trash2, RefreshCw, Download } from 'lucide-react'

const TableManagementPage = () => {
  const { user } = useAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    total_tables: 10,
    start_number: 1,
    capacity: 4,
    location: 'Main Area'
  })

  // Fetch tables from API
  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tables/cafe/${user.cafe.id}`)
      setTables(response.data.tables || [])
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast.error('Failed to fetch tables')
    } finally {
      setLoading(false)
    }
  }

  // Load tables on component mount
  useEffect(() => {
    if (user?.cafe?.id) {
      fetchTables()
    }
  }, [user?.cafe?.id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_tables' || name === 'start_number' || name === 'capacity' 
        ? parseInt(value) || 0 
        : value
    }))
  }

  const createTables = async (e) => {
    e.preventDefault()
    try {
      setCreating(true)
      const response = await api.post(`/tables/cafe/${user.cafe.id}/bulk`, formData)
      toast.success(`Successfully created ${response.data.tables.length} tables`)
      fetchTables()
      setFormData({
        total_tables: 10,
        start_number: 1,
        capacity: 4,
        location: 'Main Area'
      })
    } catch (error) {
      console.error('Error creating tables:', error)
      toast.error(error.response?.data?.message || 'Failed to create tables')
    } finally {
      setCreating(false)
    }
  }

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      await api.put(`/tables/${tableId}/status`, { status: newStatus })
      toast.success('Table status updated')
      fetchTables()
    } catch (error) {
      console.error('Error updating table status:', error)
      toast.error('Failed to update table status')
    }
  }

  const deleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) {
      return
    }

    try {
      await api.delete(`/tables/${tableId}`)
      toast.success('Table deleted successfully')
      fetchTables()
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error('Failed to delete table')
    }
  }

  const downloadQRCode = (table) => {
    if (table.qr_code_data) {
      const link = document.createElement('a')
      link.href = table.qr_code_data
      link.download = `table-${table.table_number}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100'
      case 'occupied':
        return 'text-red-600 bg-red-100'
      case 'reserved':
        return 'text-yellow-600 bg-yellow-100'
      case 'maintenance':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'occupied':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      case 'reserved':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      case 'maintenance':
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600">Manage your restaurant tables and QR codes</p>
        </div>
        <button
          onClick={fetchTables}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Create Tables Form */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Tables</h2>
          <form onSubmit={createTables} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tables
                </label>
                <input
                  type="number"
                  name="total_tables"
                  value={formData.total_tables}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Number
                </label>
                <input
                  type="number"
                  name="start_number"
                  value={formData.start_number}
                  onChange={handleInputChange}
                  min="1"
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity per Table
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{creating ? 'Creating...' : 'Create Tables'}</span>
            </button>
          </form>
        </div>
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

      {/* Tables List */}
      {!loading && user?.cafe?.id && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Tables ({tables.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div key={table.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {table.table_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Capacity: {table.capacity} people
                      </p>
                      <p className="text-sm text-gray-600">
                        Location: {table.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(table.status)}
                      <span className={`text-sm font-medium ${getStatusColor(table.status)} px-2 py-1 rounded-full`}>
                        {table.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <select
                      value={table.status}
                      onChange={(e) => updateTableStatus(table.id, e.target.value)}
                      className="form-select text-sm"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    
                    <button
                      onClick={() => downloadQRCode(table)}
                      className="btn-secondary text-sm flex items-center space-x-1"
                      title="Download QR Code"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="btn-danger text-sm flex items-center space-x-1"
                      title="Delete Table"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tables.length === 0 && (
            <div className="text-center py-12">
              <Table className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first table using the form above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TableManagementPage
