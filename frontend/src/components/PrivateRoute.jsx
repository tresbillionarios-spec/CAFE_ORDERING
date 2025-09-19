import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, token } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If no token or not authenticated, redirect to login
  if (!token || !isAuthenticated) {
    // Store the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute
