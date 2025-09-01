import { createContext, useContext, useEffect, useState } from "react";

// Mock User and Session types during migration
interface MockUser {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

interface AuthContextType {
  user: MockUser | null;
  session: MockSession | null;
  loading: boolean;
  profile: any | null;
  signOut: () => Promise<void>;
  switchUser: (userId: string, role: 'parent' | 'advocate') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  signOut: async () => {},
  switchUser: () => {},
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
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  const loadUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profiles/${userId}`);
      if (response.ok) {
        const profileData = await response.json();
        return profileData;
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }
    return null;
  };

  const setupAuthenticatedUser = async (userId: string, role: string, profileData?: any) => {
    const mockUser: MockUser = {
      id: userId,
      email: profileData?.email || `${role}@example.com`,
      user_metadata: { role }
    };
    
    const mockSession: MockSession = {
      user: mockUser,
      access_token: `mock-token-${userId}`
    };
    
    setUser(mockUser);
    setSession(mockSession);
    setProfile({
      user_id: userId,
      full_name: profileData?.full_name || `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: profileData?.email || mockUser.email,
      role: profileData?.role || role
    });
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for stored test user or determine role from URL
      const getCurrentRole = () => {
        const path = window.location.pathname;
        if (path.includes('/advocate/')) return 'advocate';
        if (path.includes('/parent/')) return 'parent';
        const savedRole = localStorage.getItem('miephero_active_role');
        return savedRole || 'parent';
      };

      const getStoredTestUser = () => {
        const savedUserId = localStorage.getItem('miephero_test_user_id');
        const savedRole = localStorage.getItem('miephero_test_user_role');
        return savedUserId && savedRole ? { userId: savedUserId, role: savedRole } : null;
      };

      const storedUser = getStoredTestUser();
      const currentRole = getCurrentRole();
      
      if (storedUser) {
        // Use stored test user
        localStorage.setItem('active_user_id', storedUser.userId);
        const profileData = await loadUserProfile(storedUser.userId);
        await setupAuthenticatedUser(storedUser.userId, storedUser.role, profileData);
      } else {
        // Use default test users based on role
        const defaultTestUsers = {
          parent: 'test-parent-001',
          advocate: 'test-advocate-001'
        };
        
        const testUserId = defaultTestUsers[currentRole as keyof typeof defaultTestUsers];
        localStorage.setItem('active_user_id', testUserId);
        const profileData = await loadUserProfile(testUserId);
        await setupAuthenticatedUser(testUserId, currentRole, profileData);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('miephero_test_user_id');
    localStorage.removeItem('miephero_test_user_role');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const switchUser = async (userId: string, role: 'parent' | 'advocate') => {
    localStorage.setItem('miephero_test_user_id', userId);
    localStorage.setItem('miephero_test_user_role', role);
    localStorage.setItem('miephero_active_role', role);
    localStorage.setItem('active_user_id', userId);
    
    const profileData = await loadUserProfile(userId);
    await setupAuthenticatedUser(userId, role, profileData);
    
    // Navigate to appropriate dashboard
    const dashboardUrl = role === 'advocate' ? '/advocate/dashboard' : '/parent/dashboard';
    window.location.href = dashboardUrl;
  };

  const value = {
    user,
    session,
    loading,
    profile,
    signOut,
    switchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};