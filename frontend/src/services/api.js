import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token')
        // Use a more graceful logout instead of immediate redirect
        if (window.authContext) {
          window.authContext.logout()
        } else {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Menu API functions
export const menuAPI = {
  // Get all menu items for a cafe
  getMenuItems: (cafeId) => api.get(`/menu/cafe/${cafeId}`),
  
  // Add new menu item
  addMenuItem: (menuData) => api.post('/menu', menuData),
  
  // Update menu item
  updateMenuItem: (id, menuData) => api.put(`/menu/${id}`, menuData),
  
  // Delete menu item
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  
  // Get specific menu item
  getMenuItem: (id) => api.get(`/menu/${id}`),
  
  // Bulk update menu items
  bulkUpdateMenuItems: (cafeId, items) => api.put(`/menu/cafe/${cafeId}/bulk`, { items })
}

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/me', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  refreshToken: () => api.post('/auth/refresh')
}

// Cafe API functions
export const cafeAPI = {
  getCafes: () => api.get('/cafes'),
  getCafe: (id) => api.get(`/cafes/${id}`),
  updateCafe: (id, cafeData) => api.put(`/cafes/${id}`, cafeData)
}

// Order API functions
export const orderAPI = {
  getOrders: (cafeId, params) => api.get(`/orders/cafe/${cafeId}`, { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  getOrderStats: (cafeId, period) => api.get(`/orders/cafe/${cafeId}/stats`, { params: { period } }),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`)
}

// Table API functions
export const tableAPI = {
  getTables: (cafeId) => api.get(`/tables/cafe/${cafeId}`),
  createTables: (cafeId, tableData) => api.post(`/tables/cafe/${cafeId}/bulk`, tableData),
  updateTableStatus: (id, statusData) => api.put(`/tables/${id}/status`, statusData),
  deleteTable: (id) => api.delete(`/tables/${id}`),
  getTableQR: (id) => api.get(`/tables/${id}/qr`),
  regenerateQR: (id) => api.post(`/tables/${id}/regenerate-qr`)
}

export default api
