import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { QrCode, Download, Copy, Smartphone, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const QRCodeDemoPage = () => {
  const { user } = useAuth()
  const [selectedTable, setSelectedTable] = useState(1)
  const [tableRange, setTableRange] = useState({ start: 1, end: 10 })

  const generateQRCodeUrl = (tableNumber) => {
    return `${window.location.origin}/menu/${user?.cafe?.id}?table=${tableNumber}`
  }

  const downloadQRCode = (tableNumber) => {
    const url = generateQRCodeUrl(tableNumber)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `table-${tableNumber}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Downloaded QR code for Table ${tableNumber}`)
  }

  const copyQRCodeUrl = (tableNumber) => {
    const url = generateQRCodeUrl(tableNumber)
    navigator.clipboard.writeText(url)
    toast.success(`URL for Table ${tableNumber} copied to clipboard!`)
  }

  const downloadAllQRCodes = () => {
    for (let i = tableRange.start; i <= tableRange.end; i++) {
      setTimeout(() => downloadQRCode(i), i * 100)
    }
    toast.success(`Downloading QR codes for Tables ${tableRange.start}-${tableRange.end}...`)
  }

  const copyAllURLs = () => {
    const urls = []
    for (let i = tableRange.start; i <= tableRange.end; i++) {
      urls.push(`Table ${i}: ${generateQRCodeUrl(i)}`)
    }
    navigator.clipboard.writeText(urls.join('\n'))
    toast.success('All URLs copied to clipboard!')
  }

  if (!user?.cafe?.id) {
    return (
      <div className="text-center py-12">
        <QrCode className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No cafe found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please make sure your account is properly set up with a cafe.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">QR Code Demo</h1>
        <p className="text-gray-600 mt-2">
          See how QR codes work for your cafe tables
        </p>
      </div>

      {/* Demo Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Single Table QR Code */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Single Table QR Code</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Table Number
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(parseInt(e.target.value))}
                className="form-select w-full"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Table {num}</option>
                ))}
              </select>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQRCodeUrl(selectedTable))}`}
                  alt={`QR Code for Table ${selectedTable}`}
                  className="mx-auto border border-gray-200 rounded-lg"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to order from Table {selectedTable}
              </p>
              
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => downloadQRCode(selectedTable)}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => copyQRCodeUrl(selectedTable)}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk QR Codes */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk QR Code Generation</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Table
                </label>
                <input
                  type="number"
                  value={tableRange.start}
                  onChange={(e) => setTableRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="form-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Table
                </label>
                <input
                  type="number"
                  value={tableRange.end}
                  onChange={(e) => setTableRange(prev => ({ ...prev, end: parseInt(e.target.value) || 10 }))}
                  min={tableRange.start}
                  className="form-input w-full"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Generate QR codes for Tables {tableRange.start} to {tableRange.end} ({tableRange.end - tableRange.start + 1} tables)
              </p>
              
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={downloadAllQRCodes}
                  className="btn-primary flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download All</span>
                </button>
                <button
                  onClick={copyAllURLs}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy All URLs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How QR Code Ordering Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Generate QR Codes</h3>
              <p className="text-sm text-gray-600">
                Create unique QR codes for each table in your cafe
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Customers Scan</h3>
              <p className="text-sm text-gray-600">
                Customers scan the QR code with their phone to access your menu
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Place Orders</h3>
              <p className="text-sm text-gray-600">
                Orders are automatically associated with the correct table number
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits of QR Code Ordering</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Contactless Ordering</h4>
                <p className="text-sm text-gray-600">Reduce physical contact and improve hygiene</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Faster Service</h4>
                <p className="text-sm text-gray-600">Orders go directly to the kitchen without waiting</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Accurate Orders</h4>
                <p className="text-sm text-gray-600">Eliminate order mistakes and miscommunication</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Table Tracking</h4>
                <p className="text-sm text-gray-600">Automatically track which table placed each order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeDemoPage
