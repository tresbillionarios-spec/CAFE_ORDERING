import { useState, useEffect } from 'react'
import { QrCode, Download, RefreshCw, Loader2, Printer } from 'lucide-react'
import { tableAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const QRCodeManagementPage = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
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

  const handleViewQR = async (table) => {
    try {
      const response = await tableAPI.getTableQR(table.id)
      setSelectedTable(response.data.table)
      setShowQRModal(true)
    } catch (err) {
      console.error('Error fetching QR code:', err)
      setError('Failed to load QR code')
    }
  }

  const handleRegenerateQR = async (tableId) => {
    try {
      await tableAPI.regenerateQR(tableId)
      // Refresh the table data
      fetchTables()
      setError(null)
    } catch (err) {
      console.error('Error regenerating QR code:', err)
      setError('Failed to regenerate QR code')
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

  const printQRCode = (table) => {
    if (table.qr_code_data) {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Table ${table.table_number}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                display: inline-block;
                padding: 20px;
                border: 2px solid #333;
                border-radius: 8px;
              }
              .qr-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .qr-subtitle {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
              }
              .qr-image {
                max-width: 200px;
                height: auto;
              }
              @media print {
                body { margin: 0; }
                .qr-container { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">Table ${table.table_number}</div>
              <div class="qr-subtitle">Scan to view menu & order</div>
              <img src="${table.qr_code_data}" alt="QR Code" class="qr-image" />
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
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
        <span className="ml-2 text-gray-600">Loading QR codes...</span>
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
        <button 
          onClick={fetchTables}
          className="btn-secondary"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* No Tables Warning */}
      {tables.length === 0 && (
        <div className="card">
          <div className="card-body text-center">
            <QrCode className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create tables first to generate QR codes.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/tables'}
                className="btn-primary"
              >
                Go to Table Management
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Codes Grid */}
      {tables.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div key={table.id} className="card">
              <div className="card-body">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {table.table_name || `Table ${table.table_number}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Capacity: {table.capacity} • Location: {table.location}
                  </p>
                  
                  {/* QR Code Preview */}
                  {table.qr_code_data ? (
                    <div className="mb-4">
                      <img 
                        src={table.qr_code_data} 
                        alt={`QR Code for ${table.table_name}`}
                        className="mx-auto w-32 h-32 border border-gray-200 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center justify-center w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg">
                      <QrCode className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      table.status === 'available' ? 'bg-green-100 text-green-800' :
                      table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                      table.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {table.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleViewQR(table)}
                      className="btn-secondary text-sm"
                      title="View QR Code"
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      View
                    </button>
                    
                    {table.qr_code_data && (
                      <>
                        <button
                          onClick={() => downloadQRCode(table)}
                          className="btn-secondary text-sm"
                          title="Download QR Code"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                        
                        <button
                          onClick={() => printQRCode(table)}
                          className="btn-secondary text-sm"
                          title="Print QR Code"
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleRegenerateQR(table.id)}
                      className="btn-secondary text-sm"
                      title="Regenerate QR Code"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">QR Code Instructions</h3>
        </div>
        <div className="card-body">
          <div className="prose prose-sm max-w-none">
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>View:</strong> Click "View" to see the QR code in a larger format</li>
              <li><strong>Download:</strong> Save the QR code as a PNG image to your device</li>
              <li><strong>Print:</strong> Print the QR code directly from your browser</li>
              <li><strong>Regenerate:</strong> Create a new QR code if needed</li>
              <li><strong>Place:</strong> Print and place QR codes on each table</li>
              <li><strong>Test:</strong> Scan with your phone to verify it works</li>
            </ol>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Pro Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Use high-quality paper for printing</li>
                <li>Laminate QR codes for durability</li>
                <li>Place QR codes where customers can easily scan them</li>
                <li>Test QR codes regularly to ensure they work</li>
                <li>Keep backup copies of your QR codes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                QR Code - {selectedTable.table_name || `Table ${selectedTable.table_number}`}
              </h3>
              
              {selectedTable.qr_code_data && (
                <div className="mb-4">
                  <img 
                    src={selectedTable.qr_code_data} 
                    alt="QR Code"
                    className="mx-auto w-48 h-48 border border-gray-200 rounded-lg"
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to view the menu and place orders
              </p>
              
              <div className="flex justify-center space-x-3">
                {selectedTable.qr_code_data && (
                  <>
                    <button
                      onClick={() => downloadQRCode(selectedTable)}
                      className="btn-secondary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    
                    <button
                      onClick={() => printQRCode(selectedTable)}
                      className="btn-secondary"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowQRModal(false)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRCodeManagementPage
