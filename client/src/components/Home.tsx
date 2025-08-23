import React from 'react'

interface HomeProps {
  healthStatus: any
}

const Home: React.FC<HomeProps> = ({ healthStatus }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Gifted Snapshot
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A lightweight tool for gifted & 2e learners
        </p>
        
        {/* Health Status Indicator */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          {healthStatus ? (
            <div className={`p-2 rounded ${healthStatus.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {healthStatus.ok ? '✅ System Online' : '❌ System Offline'}
              {healthStatus.supabase && (
                <div className="text-sm mt-1">
                  Supabase: {healthStatus.supabase}
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
              🔄 Checking system status...
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Student Snapshot</h3>
            <p className="text-gray-600 mb-4">
              Capture strengths, interests, and sensitivities
            </p>
            <a 
              href="/gifted/snapshot" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Create Snapshot
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Enrichment Goals</h3>
            <p className="text-gray-600 mb-4">
              Set and track learning objectives
            </p>
            <button 
              className="inline-block bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home