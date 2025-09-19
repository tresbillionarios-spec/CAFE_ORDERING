import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Coffee, Eye, EyeOff } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const CafeLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cafeName: '',
    cafeDescription: '',
    cafeAddress: ''
  })
  const { login, register, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get the redirect path from location state
  const from = location.state?.from?.pathname || '/dashboard'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLogin) {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        // Redirect to the intended page or dashboard
        navigate(from, { replace: true })
      }
    } else {
      const result = await register(formData)
      if (result.success) {
        // Clear the form immediately after successful registration
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          cafeName: '',
          cafeDescription: '',
          cafeAddress: ''
        })
        
        // Also switch to login mode to show the login form
        setIsLogin(true)
      }
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      cafeName: '',
      cafeDescription: '',
      cafeAddress: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Coffee className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {isLogin ? 'Sign in to your cafe' : 'Create your cafe account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Or{' '}
              <button
                onClick={toggleMode}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                create a new cafe account
              </button>
            </>
          ) : (
            <>
              Or{' '}
              <button
                onClick={toggleMode}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                sign in to existing account
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cafeName" className="block text-sm font-medium text-gray-700">
                    Cafe Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="cafeName"
                      name="cafeName"
                      type="text"
                      required={!isLogin}
                      value={formData.cafeName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Coffee Corner"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cafeDescription" className="block text-sm font-medium text-gray-700">
                    Cafe Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="cafeDescription"
                      name="cafeDescription"
                      rows={3}
                      value={formData.cafeDescription}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="A cozy coffee shop serving the best brews..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cafeAddress" className="block text-sm font-medium text-gray-700">
                    Cafe Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="cafeAddress"
                      name="cafeAddress"
                      type="text"
                      value={formData.cafeAddress}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="cafe@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center items-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CafeLoginPage
