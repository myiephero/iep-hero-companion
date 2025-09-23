import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [authMonitoring, setAuthMonitoring] = useState({
    lastCheck: Date.now(),
    consecutiveFailures: 0,
    tokenPresent: false
  });

  // 🛡️ DEFENSIVE MONITORING: Track auth state and detect issues
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isTokenPresent = !!token;
    
    setAuthMonitoring(prev => ({
      lastCheck: Date.now(),
      consecutiveFailures: !user && !loading ? prev.consecutiveFailures + 1 : 0,
      tokenPresent: isTokenPresent
    }));

    // 🚨 ALERT: Detect potential auth issues
    if (!loading && !user && token && authMonitoring.consecutiveFailures > 3) {
      console.error('🚨 AUTH MONITORING: Repeated auth failures detected!');
      console.error('🚨 Token present but user is null - potential auth system issue');
      console.error('🚨 Consecutive failures:', authMonitoring.consecutiveFailures);
    }

    // 🔍 LOG: Track routing decisions for debugging
    if (!loading) {
      console.log('🔍 ProtectedRoute Decision:', {
        hasUser: !!user,
        hasToken: isTokenPresent,
        userRole: user?.role,
        allowedRoles,
        redirectAttempts,
        consecutiveFailures: authMonitoring.consecutiveFailures
      });
    }
  }, [user, loading, allowedRoles, redirectAttempts, authMonitoring.consecutiveFailures]);

  // 🛡️ ENHANCED LOADING: Extended wait for auth resolution
  if (loading || (authMonitoring.consecutiveFailures === 0 && Date.now() - authMonitoring.lastCheck < 1000)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 🛡️ DEFENSIVE REDIRECT: Track redirect attempts to prevent loops
  if (!user) {
    // Increment redirect attempts to prevent infinite loops
    if (redirectAttempts < 3) {
      setTimeout(() => setRedirectAttempts(prev => prev + 1), 100);
      
      // 🔍 LOG: Track why we're redirecting
      console.log('🔄 ProtectedRoute: Redirecting to auth', {
        reason: 'No user data',
        hasToken: authMonitoring.tokenPresent,
        redirectAttempt: redirectAttempts + 1,
        consecutiveFailures: authMonitoring.consecutiveFailures
      });
    }
    
    return <Navigate to="/auth" replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && !allowedRoles.includes(user.role || 'parent')) {
    console.log('🔄 ProtectedRoute: Role-based redirect to dashboard', {
      userRole: user.role,
      allowedRoles
    });
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ SUCCESS: Allow access
  console.log('✅ ProtectedRoute: Access granted', {
    userRole: user.role,
    allowedRoles: allowedRoles || 'any'
  });
  
  return <>{children}</>;
}

// Simplified component for any remaining legacy redirects
export function RoleBasedRedirect({ parentRoute, advocateRoute }: { parentRoute: string; advocateRoute: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Simple role-based redirect to new unified routes
  const targetRoute = user.role === 'advocate' ? advocateRoute : parentRoute;
  return <Navigate to={targetRoute} replace />;
}