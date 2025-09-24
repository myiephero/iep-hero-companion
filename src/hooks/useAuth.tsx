import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Tables } from "@/lib/supabase";

// User types for Supabase Auth
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
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          // Get user profile from our users table
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Create user profile if it doesn't exist
            const { data: newProfile, error: insertError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                first_name: session.user.user_metadata?.first_name,
                last_name: session.user.user_metadata?.last_name,
                role: session.user.user_metadata?.role || 'parent'
              })
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating user profile:', insertError);
            } else {
              const formattedUser = {
                id: newProfile.id,
                email: newProfile.email,
                firstName: newProfile.first_name,
                lastName: newProfile.last_name,
                profileImageUrl: newProfile.profile_image_url,
                role: newProfile.role,
                subscriptionPlan: newProfile.subscription_plan,
                subscriptionStatus: newProfile.subscription_status,
                createdAt: newProfile.created_at,
                updatedAt: newProfile.updated_at
              };
              setUser(formattedUser);
              setProfile(formattedUser);
            }
          } else {
            const formattedUser = {
              id: userProfile.id,
              email: userProfile.email,
              firstName: userProfile.first_name,
              lastName: userProfile.last_name,
              profileImageUrl: userProfile.profile_image_url,
              role: userProfile.role,
              subscriptionPlan: userProfile.subscription_plan,
              subscriptionStatus: userProfile.subscription_status,
              createdAt: userProfile.created_at,
              updatedAt: userProfile.updated_at
            };
            setUser(formattedUser);
            setProfile(formattedUser);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile from our users table
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code === 'PGRST116') {
            // User doesn't exist in our table, create them
            const { data: newProfile, error: insertError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                first_name: session.user.user_metadata?.first_name,
                last_name: session.user.user_metadata?.last_name,
                role: session.user.user_metadata?.role || 'parent'
              })
              .select()
              .single();
              
            if (!insertError && newProfile) {
              const formattedUser = {
                id: newProfile.id,
                email: newProfile.email,
                firstName: newProfile.first_name,
                lastName: newProfile.last_name,
                profileImageUrl: newProfile.profile_image_url,
                role: newProfile.role,
                subscriptionPlan: newProfile.subscription_plan,
                subscriptionStatus: newProfile.subscription_status,
                createdAt: newProfile.created_at,
                updatedAt: newProfile.updated_at
              };
              setUser(formattedUser);
              setProfile(formattedUser);
            }
          } else if (!profileError && userProfile) {
            const formattedUser = {
              id: userProfile.id,
              email: userProfile.email,
              firstName: userProfile.first_name,
              lastName: userProfile.last_name,
              profileImageUrl: userProfile.profile_image_url,
              role: userProfile.role,
              subscriptionPlan: userProfile.subscription_plan,
              subscriptionStatus: userProfile.subscription_status,
              createdAt: userProfile.created_at,
              updatedAt: userProfile.updated_at
            };
            setUser(formattedUser);
            setProfile(formattedUser);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear user state
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!error && userProfile) {
          const formattedUser = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            profileImageUrl: userProfile.profile_image_url,
            role: userProfile.role,
            subscriptionPlan: userProfile.subscription_plan,
            subscriptionStatus: userProfile.subscription_status,
            createdAt: userProfile.created_at,
            updatedAt: userProfile.updated_at
          };
          setUser(formattedUser);
          setProfile(formattedUser);
          
          // Dispatch custom event to notify components of subscription update
          if (formattedUser.subscriptionPlan) {
            window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
              detail: { plan: formattedUser.subscriptionPlan, status: formattedUser.subscriptionStatus } 
            }));
          }
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