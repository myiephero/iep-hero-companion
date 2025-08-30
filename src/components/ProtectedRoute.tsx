import { ReactElement, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { setRole, getRole } from "@/lib/session";
import { Role } from "@/lib/roles";

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles: ('parent' | 'advocate')[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/auth" }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Derive role consistently before any early returns
  const sessionRole = getRole();
  const routeRoleHint = allowedRoles.length === 1 ? allowedRoles[0] : null;
  const userRole = (profile?.role as 'parent' | 'advocate' | undefined) ?? (sessionRole as 'parent' | 'advocate' | null) ?? (routeRoleHint as 'parent' | 'advocate' | null) ?? 'parent';

  // Always call hooks in the same order
  useEffect(() => {
    if (routeRoleHint && routeRoleHint !== sessionRole) {
      setRole(routeRoleHint as Role);
    }
  }, [routeRoleHint, sessionRole]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Auth guard
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role guard
  if (!allowedRoles.includes(userRole as 'parent' | 'advocate')) {
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

  const userRole = (profile?.role as 'parent' | 'advocate' | undefined) ?? (getRole() as 'parent' | 'advocate' | null) ?? 'parent';

  // Ensure consistent hook order across renders
  useEffect(() => {
    if (userRole !== getRole()) {
      setRole(userRole as Role);
    }
  }, [userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const redirectRoute = userRole === 'advocate' ? advocateRoute : parentRoute;
  return <Navigate to={redirectRoute} replace />;
}