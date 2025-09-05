import { ReactElement, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { setRole, getRole } from "@/lib/session";
import { Role } from "@/lib/roles";

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles: ('parent' | 'advocate')[];
  redirectTo?: string;
  requiredPlan?: string; // Enforce plan-specific access
  allowedPlans?: string[]; // Alternative: allow multiple plans
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/auth", requiredPlan, allowedPlans }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  console.log('🛡️ ProtectedRoute check:', {
    path: location.pathname,
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    userRole: user?.role
  });

  // Derive role consistently before any early returns
  const sessionRole = getRole();
  const routeRoleHint = allowedRoles.length === 1 ? allowedRoles[0] : null;
  // Prioritize route hint over stored role for navigation
  const userRole = (routeRoleHint as 'parent' | 'advocate' | null) ?? (sessionRole as 'parent' | 'advocate' | null) ?? (profile?.role as 'parent' | 'advocate' | undefined) ?? 'parent';

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
    console.log('🚨 ProtectedRoute: No user found, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role guard
  if (!allowedRoles.includes(userRole as 'parent' | 'advocate')) {
    // FAIL-SAFE: Redirect to correct plan-specific dashboard
    const userPlan = user.subscriptionPlan?.toLowerCase().replace(/\s+/g, '') || 'free';
    const planMapping = {
      'starter': 'starter', 'pro': 'pro', 'agency': 'agency', 'agencyplus': 'agency-plus'
    };
    const normalizedPlan = planMapping[userPlan] || userPlan;
    
    const dashboardRoute = userRole === 'advocate' 
      ? `/advocate/dashboard-${normalizedPlan}` 
      : `/parent/dashboard-${normalizedPlan}`;
    return <Navigate to={dashboardRoute} replace />;
  }

  // Plan-specific access control (tier-based security)
  if (requiredPlan || allowedPlans) {
    const userPlan = user.subscriptionPlan?.toLowerCase().replace(/\s+/g, '') || 'free';
    const planMapping = {
      'starter': 'starter', 'pro': 'pro', 'agency': 'agency', 'agencyplus': 'agency-plus'
    };
    const normalizedUserPlan = planMapping[userPlan] || userPlan;
    
    // Check if user has required plan
    if (requiredPlan && normalizedUserPlan !== requiredPlan) {
      // FAIL-SAFE: Redirect to correct plan dashboard
      const correctDashboard = user.role === 'parent' 
        ? `/parent/dashboard-${normalizedUserPlan}`
        : `/advocate/dashboard-${normalizedUserPlan}`;
      return <Navigate to={correctDashboard} replace />;
    }
    
    // Check if user has one of allowed plans
    if (allowedPlans && !allowedPlans.includes(normalizedUserPlan)) {
      // FAIL-SAFE: Redirect to correct plan dashboard
      const correctDashboard = user.role === 'parent' 
        ? `/parent/dashboard-${normalizedUserPlan}`
        : `/advocate/dashboard-${normalizedUserPlan}`;
      return <Navigate to={correctDashboard} replace />;
    }
  }

  return children;
}

interface RoleBasedRedirectProps {
  parentRoute: string;
  advocateRoute: string;
}

export function RoleBasedRedirect({ parentRoute, advocateRoute }: RoleBasedRedirectProps) {
  const { profile, loading } = useAuth();

  const userRole = (getRole() as 'parent' | 'advocate' | null) ?? (profile?.role as 'parent' | 'advocate' | undefined) ?? 'parent';

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