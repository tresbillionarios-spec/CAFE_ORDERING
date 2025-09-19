import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Search,
  RefreshCw,
  FileText
} from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const ReportsPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const tableRef = useRef(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next_page: false,
    has_prev_page: false,
    limit: 10
  })

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    payment_method: 'all',
    start_date: '',
    end_date: ''
  })

  // Fetch orders with current filters and pagination
  const fetchOrders = async (page = 1, showLoading = true) => {
    if (!user?.cafe?.id) return

    try {
      if (showLoading) setLoading(true)
      setIsFetching(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      })

      const response = await api.get(`/orders/reports?${params}`)
      
      
      setOrders(response.data.orders)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch orders')
    } finally {
      if (showLoading) setLoading(false)
      setIsFetching(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (user?.cafe?.id) {
      fetchOrders(1, true)
    }
  }, [user?.cafe?.id])

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Apply filters
  const applyFilters = () => {
    fetchOrders(1, true)
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      payment_method: 'all',
      start_date: '',
      end_date: ''
    })
    fetchOrders(1, true)
  }

  // Pagination handlers
  const goToPage = (page) => {
    fetchOrders(page, true)
  }

  const goToNextPage = () => {
    if (pagination.has_next_page) {
      goToPage(pagination.current_page + 1)
    }
  }

  const goToPrevPage = () => {
    if (pagination.has_prev_page) {
      goToPage(pagination.current_page - 1)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateString)
      return 'Date Error'
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return '💵'
      case 'card':
        return '💳'
      case 'upi':
        return '📱'
      case 'online':
        return '🌐'
      default:
        return '💰'
    }
  }

  // Export to PDF
  const exportToPDF = async () => {
    try {
      if (!tableRef.current) {
        toast.error('No data to export')
        return
      }

      toast.loading('Generating PDF...', { id: 'pdf-export' })
      
      // Create a temporary container for the PDF content
      const pdfContainer = document.createElement('div')
      pdfContainer.style.position = 'absolute'
      pdfContainer.style.left = '-9999px'
      pdfContainer.style.top = '0'
      pdfContainer.style.width = '800px'
      pdfContainer.style.backgroundColor = 'white'
      pdfContainer.style.padding = '20px'
      pdfContainer.style.fontFamily = 'Arial, sans-serif'
      
      // Add header
      const header = document.createElement('div')
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="color: #1f2937; font-size: 24px; margin: 0;">Order Reports</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">${user?.cafe?.name || 'Cafe'}</p>
          <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      `
      pdfContainer.appendChild(header)
      
      // Clone the table
      const tableClone = tableRef.current.cloneNode(true)
      
      // Remove action buttons and make table print-friendly
      const actionCells = tableClone.querySelectorAll('td:last-child')
      actionCells.forEach(cell => {
        cell.innerHTML = ''
        cell.style.display = 'none'
      })
      
      // Style the table for PDF
      tableClone.style.width = '100%'
      tableClone.style.borderCollapse = 'collapse'
      tableClone.style.fontSize = '12px'
      
      // Style table headers
      const headers = tableClone.querySelectorAll('th')
      headers.forEach(header => {
        header.style.backgroundColor = '#f3f4f6'
        header.style.border = '1px solid #d1d5db'
        header.style.padding = '8px'
        header.style.fontWeight = 'bold'
        header.style.color = '#374151'
      })
      
      // Style table cells
      const cells = tableClone.querySelectorAll('td')
      cells.forEach(cell => {
        cell.style.border = '1px solid #d1d5db'
        cell.style.padding = '6px'
        cell.style.color = '#374151'
      })
      
      // Hide the last column (actions)
      const lastColumnCells = tableClone.querySelectorAll('td:last-child, th:last-child')
      lastColumnCells.forEach(cell => {
        cell.style.display = 'none'
      })
      
      pdfContainer.appendChild(tableClone)
      
      // Add summary
      const summary = document.createElement('div')
      summary.style.marginTop = '20px'
      summary.style.padding = '15px'
      summary.style.backgroundColor = '#f9fafb'
      summary.style.border = '1px solid #e5e7eb'
      summary.style.borderRadius = '6px'
      // Calculate total amount
      const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
      
      summary.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Summary</h3>
        <p style="margin: 5px 0; color: #374151; font-size: 14px;">Total Orders: ${pagination.total_count}</p>
        <p style="margin: 5px 0; color: #374151; font-size: 14px;">Total Amount: ₹${totalAmount.toFixed(2)}</p>
        <p style="margin: 5px 0; color: #374151; font-size: 14px;">Page: ${pagination.current_page} of ${pagination.total_pages}</p>
        <p style="margin: 5px 0; color: #374151; font-size: 14px;">Generated: ${new Date().toLocaleString()}</p>
      `
      pdfContainer.appendChild(summary)
      
      document.body.appendChild(pdfContainer)
      
      // Generate PDF
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Clean up
      document.body.removeChild(pdfContainer)
      
      // Save the PDF
      const fileName = `order-reports-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('PDF exported successfully!', { id: 'pdf-export' })
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF', { id: 'pdf-export' })
    }
  }

  // Format items for display
  const formatItems = (items) => {
    if (!items || items.length === 0) return 'No items'
    
    const itemCount = items.length
    const firstItem = items[0]
    
    if (itemCount === 1) {
      return `${firstItem.quantity}x ${firstItem.name}`
    } else {
      return `${firstItem.quantity}x ${firstItem.name} +${itemCount - 1} more`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user?.cafe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No Cafe Found</h2>
          <p className="mt-2 text-gray-600">Please create a cafe first to view reports.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Reports</h1>
          <p className="mt-2 text-gray-600">
            View and filter your cafe's order history
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToPDF}
                  className="btn-secondary flex items-center"
                  disabled={isFetching || orders.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
                <button
                  onClick={applyFilters}
                  className="btn-primary flex items-center"
                  disabled={isFetching}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="btn-secondary flex items-center"
                  disabled={isFetching}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.payment_method}
                  onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                  className="input"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="input"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {orders.length} of {pagination.total_count} orders
            {isFetching && (
              <span className="ml-2 flex items-center">
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                Refreshing...
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm">Try adjusting your filters to see more results</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_name || 'Guest'}
                          </div>
                          {order.customer_phone && (
                            <div className="text-sm text-gray-500">
                              {order.customer_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatItems(order.items)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-2">{getPaymentIcon(order.payment_method)}</span>
                          <span className="capitalize">
                            {order.payment_method || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="capitalize">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={goToPrevPage}
                disabled={!pagination.has_prev_page}
                className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                const pageNum = i + 1
                const isCurrentPage = pageNum === pagination.current_page
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isCurrentPage
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              {pagination.total_pages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <button
                    onClick={() => goToPage(pagination.total_pages)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    {pagination.total_pages}
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center">
              <button
                onClick={goToNextPage}
                disabled={!pagination.has_next_page}
                className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
