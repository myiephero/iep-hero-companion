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
        // Skip auth check for public pages and prevent infinite loops
        const currentPath = window.location.pathname;
        const publicPaths = ['/parent/pricing', '/advocate/pricing'];
        
        // 🚨 CRITICAL FIX: Prevent infinite auth loops
        if (publicPaths.some(path => currentPath.includes(path))) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Get token and validate format
        let token = localStorage.getItem('authToken');
        
        // Simple token validation without excessive clearing
        if (token) {
          const tokenParts = token.split('-');
          if (tokenParts.length < 3 || tokenParts[0].length < 8) {
            console.log('⚠️ useAuth: Invalid token format - clearing');
            localStorage.removeItem('authToken');
            token = null;
          }
        }
        
        // If no token, set unauthenticated state and exit
        if (!token) {
          console.log('❌ useAuth: No auth token found');
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ useAuth: Authenticated user loaded:', userData.email);
          
          // Simple token validation - just check that token user ID matches
          if (token && userData.id) {
            const tokenUserId = token.split('-')[0];
            if (tokenUserId !== userData.id) {
              console.error('🚨 Token mismatch - clearing auth');
              localStorage.removeItem('authToken');
              setUser(null);
              setProfile(null);
              setLoading(false);
              return;
            }
          }
          
          setUser(userData);
          setProfile(userData);
          
          // 🚨 CRITICAL FIX: Simplified routing logic to prevent infinite loops
          // Only redirect if user is on specific auth/onboarding pages
          const currentPath = window.location.pathname;
          const shouldRedirect = currentPath === '/auth' || 
                                currentPath === '/onboarding' || 
                                currentPath === '/' ||
                                currentPath === '/m' ||
                                currentPath === '/m/';
          
          if (shouldRedirect) {
            if (!userData.role || (!userData.subscriptionStatus && !userData.subscriptionPlan)) {
              // New user needs onboarding
              if (currentPath !== '/onboarding') {
                window.location.href = '/onboarding';
              }
            } else {
              // Existing user - redirect to appropriate dashboard
              let dashboardPath = '/';
              
              if (userData.role === 'parent') {
                const plan = userData.subscriptionPlan?.toLowerCase().replace(/\s+/g, '') || 'free';
                const supportedPlans = ['free', 'basic', 'plus', 'explorer', 'premium', 'hero'];
                const normalizedPlan = supportedPlans.includes(plan) ? plan : 'free';
                dashboardPath = `/parent/dashboard-${normalizedPlan}`;
              } else if (userData.role === 'advocate') {
                const planMapping = {
                  'starter': 'starter', 'pro': 'pro', 'agency': 'agency', 
                  'agency plus': 'agency-plus', 'agencyplus': 'agency-plus'
                };
                const plan = userData.subscriptionPlan?.toLowerCase() || 'starter';
                const normalizedPlan = planMapping[plan] || 'starter';
                dashboardPath = `/advocate/dashboard-${normalizedPlan}`;
              }
              
              window.location.href = dashboardPath;
            }
          }
          
          setLoading(false);
        } else if (response.status === 401) {
          // Invalid token - clear and set unauthenticated
          console.log('❌ useAuth: Invalid token, clearing auth');
          localStorage.removeItem('authToken');
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else {
          // Other error - log but don't clear auth
          console.error('❌ useAuth: Server error:', response.status);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ useAuth: Network error:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // 🚨 CRITICAL: Empty dependency array to prevent re-runs

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