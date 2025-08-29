import { ReactElement, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { setRole } from "@/lib/session";
import { Role } from "@/lib/roles";

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles: ('parent' | 'advocate')[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/auth" }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Determine user role from profile or route context
  const userRole = profile?.role || 'parent'; // Default to parent if no role set
  
  // Set role in session storage when visiting role-specific routes
  useEffect(() => {
    if (allowedRoles.length === 1) {
      setRole(allowedRoles[0] as Role);
    }
  }, [allowedRoles]);
  
  // Check if user role is allowed for this route
  if (!allowedRoles.includes(userRole as 'parent' | 'advocate')) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute = userRole === 'advocate' ? '/advocate/dashboard' : '/parent/dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
}

interface RoleBasedRedirectProps {
  parentRoute: string;
  advocateRoute: string;
}

export function RoleBasedRedirect({ parentRoute, advocateRoute }: RoleBasedRedirectProps) {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userRole = profile?.role || 'parent';
  const redirectRoute = userRole === 'advocate' ? advocateRoute : parentRoute;
  
  // Set role in session when redirecting
  useEffect(() => {
    setRole(userRole as Role);
  }, [userRole]);
  
  return <Navigate to={redirectRoute} replace />;
}