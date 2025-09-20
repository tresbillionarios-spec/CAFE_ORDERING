import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Clock, 
  Smartphone,
  QrCode,
  BarChart3,
  Shield,
  Zap,
  Coffee
} from 'lucide-react'

const OnboardingGuide = () => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      id: 1,
      title: "Sign Up & Create Your Cafe",
      description: "Register your cafe account and set up your basic information",
      icon: <Coffee className="h-6 w-6" />,
      details: [
        "Create your cafe account with email and password",
        "Add your cafe name, address, and contact information",
        "Upload your cafe logo and set your brand colors"
      ]
    },
    {
      id: 2,
      title: "Set Up Your Menu",
      description: "Add your food and beverage items with prices and descriptions",
      icon: <QrCode className="h-6 w-6" />,
      details: [
        "Add menu categories (Appetizers, Main Course, Beverages, etc.)",
        "Set prices and mark items as available/unavailable",
        "Add detailed descriptions and allergen information"
      ]
    },
    {
      id: 3,
      title: "Generate QR Codes",
      description: "Create unique QR codes for each table in your cafe",
      icon: <Smartphone className="h-6 w-6" />,
      details: [
        "Generate QR codes for each table number",
        "Print and place QR codes on tables",
        "Test QR codes to ensure they work properly",
        "Customize QR code design with your branding"
      ]
    },
    {
      id: 4,
      title: "Go Live & Start Serving",
      description: "Your cafe is ready! Customers can now scan and order",
      icon: <CheckCircle className="h-6 w-6" />,
      details: [
        "Customers scan QR code with their phone camera",
        "Browse menu and add items to cart",
        "Place orders directly from their table",
        "Track order status in real-time"
      ]
    }
  ]

  const businessBenefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "Increase Revenue by 25-40%",
      description: "Customers order more when they can browse at their own pace without pressure from staff"
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Reduce Wait Times by 60%",
      description: "Eliminate order taking time and reduce kitchen-to-table delivery time"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Improve Customer Experience",
      description: "Contactless ordering, detailed menu descriptions, and instant order confirmation"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Gain Valuable Insights",
      description: "Track popular items, peak hours, and customer preferences with detailed analytics"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Reduce Staff Workload",
      description: "Staff can focus on food preparation and customer service instead of taking orders"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Quick Setup in 30 Minutes",
      description: "Get your QR ordering system up and running in less than an hour"
    }
  ]


  return (
    <div className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How to Get Started with OrdeRKaro
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your cafe in just 4 simple steps. Join thousands of cafes already using our QR ordering system to boost revenue and improve customer experience.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`bg-white rounded-lg p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  activeStep === index ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    activeStep === index ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Step {step.id}: {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why OrdeRKaro Helps Your Business
            </h3>
            <p className="text-lg text-gray-600">
              Join the digital transformation that's revolutionizing the food service industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  {benefit.icon}
                  <h4 className="text-lg font-semibold text-gray-900">{benefit.title}</h4>
                </div>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>


        {/* Contact Information */}
        <div className="mb-16">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help Getting Started?
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Our team is here to help you set up your QR ordering system and answer any questions.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Contact for Support & Payment</h4>
              <p className="text-blue-600 font-medium text-lg">
                Email: <a href="mailto:tresbillionarios@gmail.com" className="hover:text-blue-800 underline">
                  tresbillionarios@gmail.com
                </a>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                We'll help you with setup, pricing, and any technical questions
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Cafe?
          </h3>
          <p className="text-primary-100 mb-6 text-lg">
            Join thousands of cafes already using OrdeRKaro to boost revenue and improve customer experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingGuide
