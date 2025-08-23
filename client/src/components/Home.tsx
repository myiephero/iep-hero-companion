import React from 'react'

interface HomeProps {
  healthStatus: any
}

const Home: React.FC<HomeProps> = ({ healthStatus }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to My IEP Hero
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive tools for gifted & special education support
        </p>
        
        {/* System Status Card */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          {healthStatus ? (
            <div className={`p-2 rounded ${healthStatus.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {healthStatus.ok ? '✅ System Online' : '❌ System Offline'}
              {healthStatus.supabase && (
                <div className="text-sm mt-1">
                  Database: {healthStatus.supabase}
                </div>
              )}
              {healthStatus.timestamp && (
                <div className="text-xs mt-1 text-gray-600">
                  Last checked: {new Date(healthStatus.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
              🔄 Checking system status...
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Gifted Snapshot</h3>
            <p className="text-gray-600 mb-4">
              Capture student strengths, interests, sensitivities, and enrichment goals
            </p>
            <a 
              href="/gifted" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
            <p className="text-gray-600 mb-4">
              Monitor enrichment goals and track student development over time
            </p>
            <button 
              className="inline-block bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-semibold mb-3">Resource Library</h3>
            <p className="text-gray-600 mb-4">
              Curated educational resources and materials for gifted learners
            </p>
            <button 
              className="inline-block bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h3>
          <div className="text-blue-800 space-y-2">
            <p>1. Click on "Gifted Snapshot" to create your first student profile</p>
            <p>2. Add strength assessments and enrichment goals</p>
            <p>3. Track progress and collaborate with advocates</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home