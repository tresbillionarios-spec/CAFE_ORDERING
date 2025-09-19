import { createContext, useContext, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [state.token])

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await api.get('/auth/me')
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token: state.token
            }
          })
        } catch (error) {
          console.error('Auth check failed:', error)
          // Only logout if it's a real authentication error (401) and not a network error
          if (error.response?.status === 401) {
            // Try to refresh the token first
            try {
              const refreshResponse = await api.post('/auth/refresh')
              const newToken = refreshResponse.data.token
              localStorage.setItem('token', newToken)
              
              // Try to get user data again with new token
              const userResponse = await api.get('/auth/me')
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: userResponse.data.user,
                  token: newToken
                }
              })
            } catch (refreshError) {
              // If refresh also fails, then logout
              console.error('Token refresh failed:', refreshError)
              localStorage.removeItem('token')
              dispatch({ type: 'LOGOUT' })
            }
          } else {
            // For network errors, keep the token and try again later
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/auth/login', { email, password })
      
      const { user, token } = response.data
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/auth/register', userData)
      
      // Don't automatically log in the user after registration
      // Just show success message and redirect to login page
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.success('Registration successful! Please login with your credentials.')
      
      // Use window.location for more reliable redirection
      setTimeout(() => {
        window.location.href = '/login'
      }, 500)
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    navigate('/')
    toast.success('Logged out successfully')
  }

  // Expose logout function globally for API interceptor
  useEffect(() => {
    window.authContext = { logout }
    return () => {
      delete window.authContext
    }
  }, [])

  // Periodic token refresh to prevent expiration
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      const refreshInterval = setInterval(async () => {
        try {
          const response = await api.post('/auth/refresh')
          const newToken = response.data.token
          localStorage.setItem('token', newToken)
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: state.user,
              token: newToken
            }
          })
          console.log('Token refreshed successfully')
        } catch (error) {
          console.error('Periodic token refresh failed:', error)
          // Don't logout immediately, let the API interceptor handle it
        }
      }, 24 * 60 * 60 * 1000) // Refresh every 24 hours

      return () => clearInterval(refreshInterval)
    }
  }, [state.isAuthenticated, state.token, state.user])

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/me', profileData)
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user
      })
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: state.token
        }
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      return { success: false, error: error.message }
    }
  }

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh')
      const { token } = response.data
      localStorage.setItem('token', token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: state.user,
          token: token
        }
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
