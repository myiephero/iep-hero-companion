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

        // 🔒 SECURITY FIX: Clear any potentially contaminated localStorage data first
        const clearContaminatedStorage = () => {
          // Clear all auth-related localStorage items to prevent contamination
          const authKeys = ['authToken', 'user', 'profile', 'lastAuthCheck'];
          authKeys.forEach(key => {
            if (localStorage.getItem(key)) {
              console.log(`🧹 Cleared potentially contaminated localStorage key: ${key}`);
              localStorage.removeItem(key);
            }
          });
          
          // 🔒 ADDITIONAL SECURITY: Clear session storage as well
          if (window.sessionStorage) {
            console.log('🧹 Clearing sessionStorage to prevent session contamination');
            window.sessionStorage.clear();
          }
        };

        // Get token and make authenticated request
        let token = localStorage.getItem('authToken');
        
        // 🔒 SECURITY FIX: Validate token format before using
        if (token) {
          // Check if token format is valid (should contain user ID prefix)
          const tokenParts = token.split('-');
          if (tokenParts.length < 3 || tokenParts[0].length < 8) {
            console.log('⚠️ useAuth: Invalid token format detected - clearing localStorage');
            clearContaminatedStorage();
            token = null;
          } else {
            console.log('✅ useAuth: Found valid token format in localStorage:', `${token.substring(0,20)}...`);
          }
        }
        
        // If no stored token, check for Replit Auth session
        if (!token) {
          console.log('🔍 useAuth: No stored token, checking Replit Auth session...');
          try {
            const authResponse = await fetch('/api/auth/me', {
              credentials: 'include',
              headers: {
                // 🔒 SECURITY FIX: Add cache-busting to prevent stale responses
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            });
            
            console.log('🔍 useAuth: Auth response status:', authResponse.status);
            
            if (authResponse.ok) {
              const authData = await authResponse.json();
              console.log('✅ useAuth: Replit Auth session found, response data:', authData);
              
              // 🔒 SECURITY FIX: Validate auth token before storing
              if (authData.authToken && authData.user && authData.user.id) {
                // Verify token format matches expected pattern
                const tokenParts = authData.authToken.split('-');
                if (tokenParts.length >= 3 && tokenParts[0] === authData.user.id.substring(0, 8)) {
                  localStorage.setItem('authToken', authData.authToken);
                  token = authData.authToken;
                  console.log('✅ useAuth: Validated and stored auth token:', `${authData.authToken.substring(0,20)}...`);
                } else {
                  console.log('⚠️ useAuth: Token validation failed - token does not match user ID');
                  clearContaminatedStorage();
                }
              } else {
                console.log('⚠️ useAuth: No valid authToken or user data in response');
              }
            } else {
              console.log('❌ useAuth: No Replit Auth session found, status:', authResponse.status);
            }
          } catch (error) {
            console.log('❌ useAuth: Error checking Replit Auth session:', error);
          }
        }
        
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
          console.log('🔍 useAuth - Received user data:', userData);
          console.log('🔍 useAuth - subscriptionPlan from server:', userData.subscriptionPlan);
          
          // 🔒 CRITICAL SECURITY FIX: Validate token ownership before accepting user data
          if (token && userData.id) {
            const tokenUserId = token.split('-')[0];
            const actualUserId = userData.id; // 🔒 FIXED: Use full user ID, no truncation
            
            if (tokenUserId !== actualUserId) {
              console.error('🚨 SECURITY ALERT: Token user ID mismatch!');
              console.error(`🚨 Token belongs to: ${tokenUserId}, but received data for: ${actualUserId}`);
              console.error('🚨 This indicates potential authentication bypass - clearing all auth data');
              
              clearContaminatedStorage();
              setUser(null);
              setProfile(null);
              setLoading(false);
              
              // Redirect to login to force re-authentication
              window.location.href = '/auth';
              return;
            } else {
              console.log('✅ Token ownership validated - user ID matches');
            }
          }
          
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
            
            // Redirect scenarios (EXCLUDE homepage - let users stay on /)
            // CRITICAL FIX: Never redirect users away from the homepage
            if (currentPath === '/' || currentPath === '/index.html') {
              // Users on homepage can stay there - no automatic redirect
              console.log('✅ User on homepage - skipping automatic redirect');
              return; // CRITICAL: Return early to prevent any other redirects
            } else if (currentPath === '/auth' || currentPath === '/onboarding') {
              // Post-authentication/onboarding redirect (but NOT from homepage)
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
              // Handle advocate dashboard redirections - NO GENERIC DASHBOARDS ALLOWED
              const isOnWrongRoleDashboard = currentPath.startsWith('/parent/dashboard');
              const isOnWrongPlanDashboard = currentPath.startsWith('/advocate/dashboard-') && 
                                           currentPath !== correctDashboardPath;
              
              if (isOnWrongRoleDashboard || isOnWrongPlanDashboard) {
                window.location.href = correctDashboardPath;
              }
            }
          }
        } else if (response.status === 401) {
          // Token is expired or invalid
          console.log('🚫 Authentication failed - clearing expired token');
          localStorage.removeItem('authToken');
          setUser(null);
          setProfile(null);
          
          // Only redirect to login if we're on a protected route
          const currentPath = window.location.pathname;
          const publicPaths = ['/parent/pricing', '/advocate/pricing', '/', '/auth', '/login'];
          const isProtectedRoute = !publicPaths.some(path => currentPath === path || currentPath.includes(path));
          
          if (isProtectedRoute) {
            console.log('🔄 Redirecting to login due to expired authentication');
            window.location.href = '/auth';
          }
        } else {
          // Other error - clear auth state but don't redirect
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