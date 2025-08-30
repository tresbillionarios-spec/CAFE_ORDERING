import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { QrCode, Download, Plus, Settings, Table, Copy, Play } from 'lucide-react'
import BulkQRCodeGenerator from '../components/BulkQRCodeGenerator'

const QRCodeManagementPage = () => {
  const { user } = useAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBulkGenerator, setShowBulkGenerator] = useState(false)
  const [bulkConfig, setBulkConfig] = useState({
    startTable: 1,
    endTable: 10
  })

  // Fetch tables from API
  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tables/cafe/${user?.cafe?.id}`)
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

  const downloadAllQRCodes = () => {
    tables.forEach(table => {
      if (table.qr_code_image) {
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = table.qr_code_image
          link.download = `table-${table.table_number}-qr.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, 100)
      }
    })
    toast.success('Downloading all QR codes...')
  }

  const copyAllURLs = () => {
    const urls = tables.map(table => 
      `Table ${table.table_number}: ${table.qr_code_data || `${window.location.origin}/menu/${user?.cafe?.id}?table=${table.table_number}`}`
    ).join('\n')
    navigator.clipboard.writeText(urls)
    toast.success('All URLs copied to clipboard!')
  }

  const regenerateQRCode = async (tableId) => {
    try {
      const response = await api.post(`/tables/${tableId}/regenerate-qr`)
      toast.success('QR code regenerated successfully!')
      fetchTables() // Refresh the list
    } catch (error) {
      console.error('Error regenerating QR code:', error)
      toast.error('Failed to regenerate QR code')
    }
  }

  const handleBulkGenerate = async (qrCodes) => {
    try {
      // Create tables for the generated QR codes
      const tableData = qrCodes.map(code => ({
        table_number: code.tableNumber,
        capacity: 4,
        location: 'main'
      }))

      await api.post(`/tables/cafe/${user?.cafe?.id}/bulk`, {
        table_count: qrCodes.length,
        start_number: bulkConfig.startTable,
        capacity: 4,
        location: 'main'
      })

      toast.success(`Successfully created ${qrCodes.length} tables with QR codes!`)
      fetchTables() // Refresh the list
      setShowBulkGenerator(false)
    } catch (error) {
      console.error('Error creating tables:', error)
      toast.error('Failed to create tables')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
          <p className="text-gray-600">Manage QR codes for your cafe tables</p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/qr-demo"
            className="btn-secondary flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>View Demo</span>
          </Link>
          <button
            onClick={() => setShowBulkGenerator(!showBulkGenerator)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Bulk Generate</span>
          </button>
          {tables.length > 0 && (
            <>
              <button
                onClick={downloadAllQRCodes}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download All</span>
              </button>
              <button
                onClick={copyAllURLs}
                className="btn-secondary flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy URLs</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* No Cafe Warning */}
      {!user?.cafe?.id && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            No cafe found. Please make sure your account is properly set up with a cafe.
          </p>
        </div>
      )}

      {/* Bulk QR Code Generator */}
      {showBulkGenerator && user?.cafe?.id && (
        <div className="card">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bulk QR Code Generator</h3>
              <button
                onClick={() => setShowBulkGenerator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Table Number
                </label>
                <input
                  type="number"
                  value={bulkConfig.startTable}
                  onChange={(e) => setBulkConfig(prev => ({ ...prev, startTable: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="form-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Table Number
                </label>
                <input
                  type="number"
                  value={bulkConfig.endTable}
                  onChange={(e) => setBulkConfig(prev => ({ ...prev, endTable: parseInt(e.target.value) || 10 }))}
                  min={bulkConfig.startTable}
                  className="form-input w-full"
                />
              </div>
            </div>
            
            <BulkQRCodeGenerator
              cafeId={user?.cafe?.id}
              startTable={bulkConfig.startTable}
              endTable={bulkConfig.endTable}
              onComplete={handleBulkGenerate}
            />
          </div>
        </div>
      )}

      {/* Tables List */}
      {!loading && user?.cafe?.id && (
        <div className="space-y-4">
          {tables.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div key={table.id} className="card">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Table {table.table_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {table.capacity} seats • {table.location}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => regenerateQRCode(table.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Regenerate QR Code"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        {table.qr_code_image && (
                          <button
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = table.qr_code_image
                              link.download = `table-${table.table_number}-qr.png`
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Download QR Code"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {table.qr_code_data ? (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-center">
                          <img
                            src={table.qr_code_data}
                            alt={`QR Code for Table ${table.table_number}`}
                            className="w-24 h-24"
                          />
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2">
                          Scan to order from Table {table.table_number}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(table.qr_code_url || `${window.location.origin}/menu/${user?.cafe?.id}?table=${table.table_number}`)
                            toast.success('URL copied to clipboard!')
                          }}
                          className="w-full mt-2 btn-secondary text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-center text-gray-500">
                          <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs">No QR code generated</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCode className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first table to generate QR codes.
              </p>
              <button
                onClick={() => setShowBulkGenerator(true)}
                className="mt-4 btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tables
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QRCodeManagementPage
