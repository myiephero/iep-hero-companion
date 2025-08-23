import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Home from './components/Home'

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
        <Routes>
          <Route path="/" element={<Home healthStatus={healthStatus} />} />
          {/* Gifted Snapshot route will be added here */}
          <Route path="/gifted/snapshot" element={<div className="p-8 text-center">Gifted Snapshot - Coming Soon!</div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App