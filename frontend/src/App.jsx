import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

// Public Pages
import HomePage from './pages/HomePage'
import CafeLoginPage from './pages/CafeLoginPage'
import MenuPage from './pages/MenuPage'
import OrderPage from './pages/OrderPage'
import OrderTrackingPage from './pages/OrderTrackingPage'

// Protected Pages (Cafe Owner)
import CafeDashboardPage from './pages/CafeDashboardPage'
import MenuManagementPage from './pages/MenuManagementPage'
import OrderManagementPage from './pages/OrderManagementPage'
import TableManagementPage from './pages/TableManagementPage'
import QRCodeManagementPage from './pages/QRCodeManagementPage'
import QRCodeDemoPage from './pages/QRCodeDemoPage'
import CafeProfilePage from './pages/CafeProfilePage'
import CafeCreationPage from './pages/CafeCreationPage'
import ReportsPage from './pages/ReportsPage'
import CafeSupportPage from './pages/CafeSupportPage'
import AdminCafeApprovalsPage from './pages/AdminCafeApprovalsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminCafeManagementPage from './pages/AdminCafeManagementPage'
import AdminOrderManagementPage from './pages/AdminOrderManagementPage'
import AdminMenuInventoryPage from './pages/AdminMenuInventoryPage'
import AdminUserManagementPage from './pages/AdminUserManagementPage'
import AdminFinancePage from './pages/AdminFinancePage'
import AdminSystemSettingsPage from './pages/AdminSystemSettingsPage'
import AdminSupportPage from './pages/AdminSupportPage'

function App() {

  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<CafeLoginPage />} />
        <Route path="/menu/:cafeId" element={<MenuPage />} />
        <Route path="/order/:cafeId" element={<OrderPage />} />
        <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <CafeDashboardPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/menu-management" element={
          <PrivateRoute>
            <Layout>
              <MenuManagementPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <Layout>
              <OrderManagementPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Layout>
              <CafeProfilePage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/create-cafe" element={
          <PrivateRoute>
            <CafeCreationPage />
          </PrivateRoute>
        } />
        <Route path="/tables" element={
          <PrivateRoute>
            <Layout>
              <TableManagementPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/qr-codes" element={
          <PrivateRoute>
            <Layout>
              <QRCodeManagementPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/qr-demo" element={
          <PrivateRoute>
            <Layout>
              <QRCodeDemoPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/support" element={
          <PrivateRoute>
            <Layout>
              <CafeSupportPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/cafe-approvals" element={
          <PrivateRoute>
            <Layout>
              <AdminCafeApprovalsPage />
            </Layout>
          </PrivateRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute>
            <Layout>
              <AdminDashboardPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/cafe-management" element={
          <PrivateRoute>
            <Layout>
              <AdminCafeManagementPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/order-management" element={
          <PrivateRoute>
            <Layout>
              <AdminOrderManagementPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/menu-inventory" element={
          <PrivateRoute>
            <Layout>
              <AdminMenuInventoryPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/user-management" element={
          <PrivateRoute>
            <Layout>
              <AdminUserManagementPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/finance" element={
          <PrivateRoute>
            <Layout>
              <AdminFinancePage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/settings" element={
          <PrivateRoute>
            <Layout>
              <AdminSystemSettingsPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/support" element={
          <PrivateRoute>
            <Layout>
              <AdminSupportPage />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
