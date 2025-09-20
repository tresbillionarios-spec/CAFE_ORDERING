import { Link } from 'react-router-dom'
import { Coffee, QrCode, Smartphone, TrendingUp } from 'lucide-react'
import OnboardingGuide from '../components/OnboardingGuide'

const HomePage = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">OrdeRKaro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="btn-primary"
              >
                Cafe Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-20 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your Cafe with
              <span className="text-primary-600"> OrdeRKaro</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Streamline your cafe operations with OrdeRKaro's innovative QR code ordering system. 
              Let customers scan, order, and enjoy - all from their smartphones.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="btn-primary text-lg px-8 py-3"
              >
                Get Started
              </Link>
              <button
                onClick={() => scrollToSection('onboarding-guide')}
                className="text-lg font-semibold leading-6 text-gray-900 hover:text-primary-600"
              >
                How it Works <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to modernize your cafe
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                From QR code generation to order management, we've got you covered.
              </p>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <QrCode className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">QR Code Generation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Unique QR codes for each cafe that customers can scan to access your menu.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <Smartphone className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">Mobile-First Design</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Optimized for mobile devices with a beautiful, intuitive interface.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <Coffee className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">Menu Management</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Easy-to-use interface to manage your menu items, prices, and availability.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">Order Analytics</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track orders, revenue, and customer preferences with detailed analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Guide Section */}
        <div id="onboarding-guide">
          <OnboardingGuide />
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Join hundreds of cafes already using our QR ordering system.
              </p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary-600 shadow-sm hover:bg-gray-50"
                >
                  Start Your Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="text-center">
              <Coffee className="mx-auto h-8 w-8 text-primary-400" />
              <p className="mt-4 text-sm text-gray-400">
                © 2024 QR Ordering System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
