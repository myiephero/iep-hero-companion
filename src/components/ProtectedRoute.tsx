import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && !allowedRoles.includes(user.role || 'parent')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Allow access
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