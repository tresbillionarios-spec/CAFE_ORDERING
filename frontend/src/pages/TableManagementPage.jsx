import { useState, useEffect } from 'react'
import { Plus, Trash2, QrCode, Loader2, RefreshCw } from 'lucide-react'
import { tableAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const TableManagementPage = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    total_tables: 5,
    start_number: 1,
    capacity: 4,
    location: 'Main Area'
  })
  const { user, isAuthenticated } = useAuth()

  const userCafe = user?.cafe

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated])

  const fetchTables = async () => {
    if (!userCafe?.id) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await tableAPI.getTables(userCafe.id)
      setTables(response.data.tables || [])
    } catch (err) {
      console.error('Error fetching tables:', err)
      setError('Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [userCafe])

  const handleCreateTables = async (e) => {
    e.preventDefault()
    if (!userCafe?.id) {
      setError('No cafe found. Please contact support.')
      return
    }

    try {
      setCreateLoading(true)
      setError(null)
      
      // Ensure all numeric values are properly converted to integers
      const validatedData = {
        total_tables: parseInt(formData.total_tables) || 1,
        start_number: parseInt(formData.start_number) || 1,
        capacity: parseInt(formData.capacity) || 4,
        location: formData.location || 'Main Area'
      }
      
      const response = await tableAPI.createTables(userCafe.id, validatedData)
      
      // Add new tables to the list
      setTables(prev => [...prev, ...response.data.tables])
      setShowCreateForm(false)
      setFormData({
        total_tables: 5,
        start_number: 1,
        capacity: 4,
        location: 'Main Area'
      })
      
      console.log('Tables created successfully!')
    } catch (err) {
      console.error('Error creating tables:', err)
      setError(err.response?.data?.message || 'Failed to create tables')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteTable = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) {
      return
    }

    try {
      await tableAPI.deleteTable(id)
      setTables(prev => prev.filter(table => table.id !== id))
    } catch (err) {
      console.error('Error deleting table:', err)
      setError('Failed to delete table')
    }
  }

  const handleRegenerateQR = async (id) => {
    try {
      await tableAPI.regenerateQR(id)
      // Refresh the table data
      fetchTables()
    } catch (err) {
      console.error('Error regenerating QR code:', err)
      setError('Failed to regenerate QR code')
    }
  }

  const updateTableStatus = async (id, newStatus) => {
    try {
      await tableAPI.updateTableStatus(id, { status: newStatus })
      setTables(prev => 
        prev.map(table => 
          table.id === id 
            ? { ...table, status: newStatus }
            : table
        )
      )
    } catch (err) {
      console.error('Error updating table status:', err)
      setError('Failed to update table status')
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
        <span className="ml-2 text-gray-600">Loading tables...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600">Manage your cafe's tables and QR codes</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
          disabled={!userCafe?.id}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tables
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create Tables Form */}
      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Create New Tables</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateTables} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Tables
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.total_tables}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_tables: parseInt(e.target.value) }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.start_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_number: parseInt(e.target.value) }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacity per Table
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="input"
                    placeholder="e.g., Main Area, Patio, Window"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn-primary"
                >
                  {createLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create Tables'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tables List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Tables</h3>
          <p className="text-sm text-gray-600">
            {tables.length} table{tables.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="card-body">
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tables</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first tables.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                  disabled={!userCafe?.id}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tables
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
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
                  {tables.map((table) => (
                    <tr key={table.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {table.table_name || `Table ${table.table_number}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{table.table_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.capacity} seats
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={table.status}
                          onChange={(e) => updateTableStatus(table.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                            table.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' :
                            table.status === 'occupied' ? 'bg-red-100 text-red-800 border-red-200' :
                            table.status === 'reserved' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="reserved">Reserved</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRegenerateQR(table.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Regenerate QR Code"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => window.open(table.qr_code_url, '_blank')}
                            className="text-green-600 hover:text-green-900"
                            title="View QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTable(table.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Table"
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

      {/* QR Code Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">QR Code Instructions</h3>
        </div>
        <div className="card-body">
          <div className="prose prose-sm max-w-none">
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the QR code icon next to any table to view its QR code</li>
              <li>Print the QR code and place it on the corresponding table</li>
              <li>Customers can scan the QR code to view your menu and place orders</li>
              <li>Use the refresh icon to regenerate QR codes if needed</li>
              <li>Update table status to track availability</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableManagementPage
