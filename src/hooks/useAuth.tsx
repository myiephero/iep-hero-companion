import { createContext, useContext, useEffect, useState } from "react";

// Real User types for Replit Auth
interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any | null;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profile: null,
  signOut: async () => {},
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
        // Skip auth check for public pages like pricing
        const currentPath = window.location.pathname;
        const publicPaths = ['/parent/pricing', '/advocate/pricing', '/'];
        
        if (publicPaths.some(path => currentPath.includes(path))) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setProfile(userData);
          
          // Check if this is a new user without a role/subscription
          // If so, redirect to onboarding
          if (userData && !userData.role && !userData.subscriptionStatus) {
            // This is a new user who just authenticated but hasn't completed onboarding
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/onboarding') && !currentPath.includes('/subscribe')) {
              window.location.href = '/onboarding';
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
      window.location.href = '/api/logout';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const value = {
    user,
    loading,
    profile,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};