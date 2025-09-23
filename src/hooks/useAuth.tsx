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
        // 🛡️ AUTH STATE VALIDATION: Check for inconsistencies
        const validateAuthState = () => {
          const token = localStorage.getItem('authToken');
          const hasUser = !!user;
          const timestamp = Date.now();
          
          // Store validation result for monitoring
          const validationResult = {
            timestamp,
            hasToken: !!token,
            hasUser,
            isConsistent: (!token && !hasUser) || (token && hasUser),
            tokenFormat: token ? (token.split('-').length >= 3 ? 'valid' : 'invalid') : 'none'
          };
          
          console.log('🔍 AUTH VALIDATION:', validationResult);
          
          // Auto-fix inconsistent states
          if (token && !hasUser && !loading) {
            console.log('🔧 AUTO-FIX: Token exists but no user - will re-validate');
          } else if (!token && hasUser) {
            console.log('🔧 AUTO-FIX: User exists but no token - clearing user state');
            setUser(null);
            setProfile(null);
          }
          
          return validationResult;
        };

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

        // Run validation first
        validateAuthState();

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
        
        // If no stored token, silently skip session check - DON'T make API calls
        // This prevents 401 errors that trigger unwanted redirects to /auth
        if (!token) {
          console.log('🔍 useAuth: No stored token found - skipping auth check for public pages');
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        console.log('🔍 useAuth: Token found, validating with server...');
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
              
              // Let ProtectedRoute handle redirects - don't redirect from here
              return;
            } else {
              console.log('✅ Token ownership validated - user ID matches');
            }
          }
          
          // Store user data - let ProtectedRoute handle all redirects
          setUser(userData);
          setProfile(userData);
        } else if (response.status === 401) {
          // Token is expired or invalid
          console.log('🚫 Authentication failed - clearing expired token');
          localStorage.removeItem('authToken');
          setUser(null);
          setProfile(null);
          
          // Let ProtectedRoute handle redirects
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

    // Listen for storage events to detect when token is set/removed
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('🔄 useAuth: Auth token changed, re-checking authentication');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from same-page token changes
    const handleTokenChange = () => {
      console.log('🔄 useAuth: Token change event detected, re-checking authentication');
      setTimeout(checkAuth, 50); // Small delay to ensure localStorage is updated
    };

    window.addEventListener('authTokenChanged', handleTokenChange);

    // 🛡️ RECOVERY MECHANISM: Disabled to prevent infinite loops
    // const setupRecoveryMechanism = () => {
    //   let consecutiveFailures = 0;
    //   const maxFailures = 3;
    //   
    //   const interval = setInterval(() => {
    //     const token = localStorage.getItem('authToken');
    //     const hasValidUser = user && user.id;
    //     
    //     // Check for auth failure pattern
    //     if (token && !hasValidUser && !loading) {
    //       consecutiveFailures++;
    //       console.log(`🔄 AUTH RECOVERY: Failure ${consecutiveFailures}/${maxFailures} detected`);
    //       
    //       if (consecutiveFailures >= maxFailures) {
    //         console.log('🔧 AUTH RECOVERY: Auto-recovering auth state...');
    //         checkAuth(); // Re-run auth check
    //         consecutiveFailures = 0; // Reset counter
    //       }
    //     } else {
    //       consecutiveFailures = 0; // Reset on success
    //     }
    //   }, 5000); // Check every 5 seconds
    //   
    //   return interval;
    // };

    // const recoveryInterval = setupRecoveryMechanism();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenChanged', handleTokenChange);
      // clearInterval(recoveryInterval); // Disabled recovery interval
    };
  }, []); // Empty dependency array - only run once on mount

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
      
      console.log('🔄 Refreshing user data...');
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User data refreshed:', userData);
        console.log('🔍 New subscription plan:', userData.subscriptionPlan);
        setUser(userData);
        setProfile(userData);
        
        // Dispatch custom event to notify components of subscription update
        if (userData.subscriptionPlan) {
          window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
            detail: { plan: userData.subscriptionPlan, status: userData.subscriptionStatus } 
          }));
        }
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