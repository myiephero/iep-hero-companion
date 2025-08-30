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
    // Mock authentication during migration
    const mockUser: MockUser = {
      id: "mock-user-123",
      email: "user@example.com",
      user_metadata: {}
    };
    
    const mockSession: MockSession = {
      user: mockUser,
      access_token: "mock-token"
    };
    
    setUser(mockUser);
    setSession(mockSession);
    setProfile({
      user_id: mockUser.id,
      full_name: "Mock User",
      email: mockUser.email
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