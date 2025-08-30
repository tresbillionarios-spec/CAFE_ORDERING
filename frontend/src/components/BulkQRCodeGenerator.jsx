import { useState, useEffect } from 'react'
import { Download, QrCode, Copy, FileDown } from 'lucide-react'
import toast from 'react-hot-toast'

const BulkQRCodeGenerator = ({ cafeId, startTable = 1, endTable = 10, onComplete }) => {
  const [qrCodes, setQrCodes] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCount, setGeneratedCount] = useState(0)

  useEffect(() => {
    if (cafeId && startTable && endTable) {
      generateBulkQRCodes()
    }
  }, [cafeId, startTable, endTable])

  const generateBulkQRCodes = async () => {
    setIsGenerating(true)
    setGeneratedCount(0)
    
    const codes = []
    const totalTables = endTable - startTable + 1
    
    for (let i = startTable; i <= endTable; i++) {
      try {
        const url = `${window.location.origin}/menu/${cafeId}?table=${i}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
        
        codes.push({
          tableNumber: i,
          url: url,
          qrCodeUrl: qrCodeUrl
        })
        
        setGeneratedCount(prev => prev + 1)
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error generating QR code for table ${i}:`, error)
      }
    }
    
    setQrCodes(codes)
    setIsGenerating(false)
    
    if (onComplete) {
      onComplete(codes)
    }
    
    toast.success(`Generated ${codes.length} QR codes!`)
  }

  const downloadAllQRCodes = () => {
    qrCodes.forEach((code, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = code.qrCodeUrl
        link.download = `table-${code.tableNumber}-qr.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 100) // Stagger downloads
    })
    
    toast.success('Downloading all QR codes...')
  }

  const downloadAsZip = async () => {
    try {
      // This would require a backend endpoint to create a ZIP file
      // For now, we'll just download them individually
      downloadAllQRCodes()
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      toast.error('Failed to create ZIP file')
    }
  }

  const copyAllURLs = () => {
    const urls = qrCodes.map(code => `Table ${code.tableNumber}: ${code.url}`).join('\n')
    navigator.clipboard.writeText(urls)
    toast.success('All URLs copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Bulk QR Code Generator
          </h3>
          <p className="text-sm text-gray-600">
            Tables {startTable} to {endTable} ({endTable - startTable + 1} total)
          </p>
        </div>
        
        {qrCodes.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={downloadAllQRCodes}
              className="btn-secondary flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Download All</span>
            </button>
            
            <button
              onClick={copyAllURLs}
              className="btn-secondary flex items-center space-x-1"
            >
              <Copy className="h-4 w-4" />
              <span>Copy URLs</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Generating QR codes...</span>
            </div>
            <span className="text-blue-800 font-medium">
              {generatedCount} / {endTable - startTable + 1}
            </span>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(generatedCount / (endTable - startTable + 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* QR Codes Grid */}
      {qrCodes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {qrCodes.map((code) => (
            <div key={code.tableNumber} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Table {code.tableNumber}
                </h4>
                
                <div className="flex justify-center mb-3">
                  <img
                    src={code.qrCodeUrl}
                    alt={`QR Code for Table ${code.tableNumber}`}
                    className="w-24 h-24 border border-gray-200 rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = code.qrCodeUrl
                      link.download = `table-${code.tableNumber}-qr.png`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      toast.success(`Downloaded Table ${code.tableNumber} QR code`)
                    }}
                    className="w-full btn-secondary text-sm"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code.url)
                      toast.success(`Table ${code.tableNumber} URL copied`)
                    }}
                    className="w-full btn-secondary text-sm"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && qrCodes.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No QR codes generated</h3>
          <p className="mt-1 text-sm text-gray-500">
            QR codes will be generated automatically for the specified table range.
          </p>
        </div>
      )}
    </div>
  )
}

export default BulkQRCodeGenerator
