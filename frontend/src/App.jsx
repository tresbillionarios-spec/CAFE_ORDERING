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
      </Routes>
    </AuthProvider>
  )
}

export default App
