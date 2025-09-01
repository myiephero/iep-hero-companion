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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  signOut: async () => {},
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

  useEffect(() => {
    // Mock authentication during migration with role-based user isolation
    const getCurrentRole = () => {
      const path = window.location.pathname;
      if (path.includes('/advocate/')) return 'advocate';
      if (path.includes('/parent/')) return 'parent';
      const savedRole = localStorage.getItem('miephero_active_role');
      return savedRole || 'parent';
    };

    const currentRole = getCurrentRole();
    // Create role-specific mock user IDs to prevent document sharing
    const roleBasedUserId = `mock-${currentRole}-user-${currentRole === 'advocate' ? '456' : '123'}`;
    
    const mockUser: MockUser = {
      id: roleBasedUserId,
      email: `${currentRole}@example.com`,
      user_metadata: { role: currentRole }
    };
    
    const mockSession: MockSession = {
      user: mockUser,
      access_token: `mock-token-${currentRole}`
    };
    
    setUser(mockUser);
    setSession(mockSession);
    setProfile({
      user_id: mockUser.id,
      full_name: `Mock ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`,
      email: mockUser.email,
      role: currentRole
    });
    setLoading(false);
  }, []);

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    loading,
    profile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};