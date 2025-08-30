import { useState, useEffect } from 'react'
import { Download, QrCode, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const QRCodeGenerator = ({ tableNumber, cafeId, size = 200, qrCodeData: storedQrCodeData, qrCodeImage: storedQrCodeImage }) => {
  const [qrCodeData, setQrCodeData] = useState(storedQrCodeData || '')
  const [qrCodeImage, setQrCodeImage] = useState(storedQrCodeImage || '')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (storedQrCodeData && storedQrCodeImage) {
      // Use stored QR code data
      setQrCodeData(storedQrCodeData)
      setQrCodeImage(storedQrCodeImage)
    } else if (tableNumber && cafeId) {
      generateQRCode()
    }
  }, [tableNumber, cafeId, storedQrCodeData, storedQrCodeImage])

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Generate the URL that the QR code should point to
      const url = `${window.location.origin}/menu/${cafeId}?table=${tableNumber}`
      setQrCodeData(url)
      
      // For now, we'll use a simple QR code generation
      // In a real implementation, you might want to use a QR code library
      // or call your backend API to generate the QR code
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`
      setQrCodeImage(qrCodeUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeImage) {
      const link = document.createElement('a')
      link.href = qrCodeImage
      link.download = `table-${tableNumber}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('QR code downloaded!')
    }
  }

  const copyQRCodeData = () => {
    if (qrCodeData) {
      navigator.clipboard.writeText(qrCodeData)
      toast.success('QR code data copied to clipboard!')
    }
  }

  if (!tableNumber || !cafeId) {
    return (
      <div className="text-center p-4 text-gray-500">
        <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Table information required</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Table {tableNumber} QR Code
        </h3>
        
        {isGenerating ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Generating QR Code...</span>
          </div>
        ) : qrCodeImage ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCodeImage}
                alt={`QR Code for Table ${tableNumber}`}
                className="border border-gray-200 rounded-lg"
                style={{ width: size, height: size }}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Scan this QR code to order from Table {tableNumber}
              </p>
              
              <div className="flex justify-center space-x-2">
                <button
                  onClick={downloadQRCode}
                  className="btn-secondary flex items-center space-x-1 text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={copyQRCodeData}
                  className="btn-secondary flex items-center space-x-1 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy URL</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">
            <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Failed to generate QR code</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRCodeGenerator
