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
        
        // If no stored token, silently skip session check for now
        // The token-based auth is working perfectly, don't let session issues block it
        if (!token) {
          console.log('🔍 useAuth: No stored token found - user needs to login');
        }
        
        // Always set loading to false, let ProtectedRoute handle auth redirects
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