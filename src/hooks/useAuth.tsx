import { createContext, useContext, useEffect, useState } from "react";

// Real User types for Replit Auth
interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  role?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profile: null,
  signOut: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Skip auth check only for pricing pages (not home page)
        const currentPath = window.location.pathname;
        const publicPaths = ['/parent/pricing', '/advocate/pricing'];
        
        // Only skip auth for truly public pages, NOT for the home page or dashboard routes
        if (publicPaths.some(path => currentPath.includes(path))) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Get token and make authenticated request
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setProfile(userData);
          
          // Check if this is a new user without a role/subscription
          // If so, redirect to onboarding
          if (userData && !userData.role && !userData.subscriptionStatus && !userData.subscriptionPlan) {
            // This is a new user who just authenticated but hasn't completed onboarding
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/onboarding') && !currentPath.includes('/subscribe')) {
              window.location.href = '/onboarding';
            }
          } else if (userData && userData.role) {
            // User has a role - handle plan-specific routing
            const currentPath = window.location.pathname;
            
            // Define all supported plans
            const supportedParentPlans = ['free', 'basic', 'plus', 'explorer', 'premium', 'hero'];
            const supportedAdvocatePlans = ['starter', 'pro', 'agency', 'agency-plus'];
            
            // Generate correct dashboard path based on role and plan
            let correctDashboardPath;
            if (userData.role === 'parent') {
              const planSlug = userData.subscriptionPlan?.toLowerCase().replace(/\s+/g, '') || 'free';
              const normalizedPlan = supportedParentPlans.includes(planSlug) ? planSlug : 'free';
              correctDashboardPath = `/parent/dashboard-${normalizedPlan}`;
            } else if (userData.role === 'advocate') {
              // Map advocate subscription plans to dashboard routes
              const advocatePlanMapping = {
                'starter': 'starter',
                'pro': 'pro',
                'agency': 'agency', 
                'agency plus': 'agency-plus',
                'agencyplus': 'agency-plus'
              };
              const planKey = userData.subscriptionPlan?.toLowerCase() || 'starter';
              const planSlug = advocatePlanMapping[planKey] || 'starter';
              correctDashboardPath = `/advocate/dashboard-${planSlug}`;
            } else {
              correctDashboardPath = '/'; // Fallback for unknown roles
            }
            
            // Redirect scenarios
            if (currentPath === '/auth' || currentPath === '/onboarding') {
              // Post-authentication/onboarding redirect
              window.location.href = correctDashboardPath;
            } else if (userData.role === 'parent') {
              // Handle parent dashboard redirections
              const isOnGenericDashboard = currentPath === '/parent/dashboard';
              const isOnWrongPlanDashboard = currentPath.startsWith('/parent/dashboard-') && 
                                           currentPath !== correctDashboardPath;
              
              if (isOnGenericDashboard || isOnWrongPlanDashboard) {
                window.location.href = correctDashboardPath;
              }
            } else if (userData.role === 'advocate') {
              // Handle advocate dashboard redirections
              const isOnGenericDashboard = currentPath === '/advocate/dashboard';
              const isOnWrongRoleDashboard = currentPath.startsWith('/parent/dashboard');
              const isOnWrongPlanDashboard = currentPath.startsWith('/advocate/dashboard-') && 
                                           currentPath !== correctDashboardPath;
              
              if (isOnGenericDashboard || isOnWrongRoleDashboard || isOnWrongPlanDashboard) {
                window.location.href = correctDashboardPath;
              }
            }
          }
        } else {
          // User not authenticated - this is OK for public pages
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        // Silently handle auth errors for public pages
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    try {
      // Clear the authentication token from localStorage first
      localStorage.removeItem('authToken');
      
      // Clear user state immediately
      setUser(null);
      setProfile(null);
      
      // Call server logout endpoint in background without redirect
      fetch('/api/logout', { credentials: 'include' }).catch(() => {
        // Ignore errors - we've already cleared local state
      });
      
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setProfile(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    loading,
    profile,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};