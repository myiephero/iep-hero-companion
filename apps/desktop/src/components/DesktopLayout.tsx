import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { DesktopDashboard } from '../pages/DesktopDashboard';
import ParentMessages from '../pages/ParentMessages';

export function DesktopLayout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold">IEP Hero - Desktop</h1>
              <div className="flex space-x-4">
                <Link 
                  to="/" 
                  className={`transition-colors ${
                    location.pathname === '/' 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/messages" 
                  className={`transition-colors ${
                    location.pathname === '/messages' 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Messages
                </Link>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Desktop Experience - Independent Routing
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<DesktopDashboard />} />
          <Route path="/messages" element={<ParentMessages />} />
        </Routes>
      </main>
    </div>
  );
}