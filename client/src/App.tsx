import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Home from './components/Home'
import GiftedDashboard from './pages/GiftedDashboard'

function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null)

  useEffect(() => {
    // Test API connectivity
    const checkHealth = async () => {
      try {
        const response = await axios.get('/api/health')
        setHealthStatus(response.data)
        console.log('✅ API Health Check:', response.data)
      } catch (error) {
        console.error('❌ API Health Check Failed:', error)
        setHealthStatus({ ok: false, error: 'Connection failed' })
      }
    }
    
    checkHealth()
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-900">My IEP Hero</h1>
                <div className="hidden md:flex space-x-6">
                  <a 
                    href="/" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Home
                  </a>
                  <a 
                    href="/gifted" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Gifted Snapshot
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                {healthStatus && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    healthStatus.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {healthStatus.ok ? '● Online' : '● Offline'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home healthStatus={healthStatus} />} />
          <Route path="/gifted" element={<GiftedDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App