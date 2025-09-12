import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as AuthUser, Session } from '@supabase/supabase-js';
import { supabase, Database } from '@/lib/supabase';
import { UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestAccess: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Profile Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        
        // Check if user is approved
        if (profile && !profile.is_approved) {
          await supabase.auth.signOut();
          toast({
            title: "Account not approved",
            description: "Your account is pending admin approval",
            variant: "destructive",
          });
          return false;
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const requestAccess = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account, then wait for admin approval",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, login, logout, requestAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}