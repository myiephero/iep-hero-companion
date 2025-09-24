import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    console.log('🔄 ProtectedRoute: Redirecting to auth - no user');
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

  // Allow access
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