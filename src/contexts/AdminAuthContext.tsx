
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  admin: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session');
      if (sessionToken) {
        const { data, error } = await supabase
          .from('admin_sessions')
          .select(`
            *,
            admin_users (*)
          `)
          .eq('session_token', sessionToken)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (data && !error) {
          setAdmin(data.admin_users);
        } else {
          localStorage.removeItem('admin_session');
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // In a real app, you'd use proper password hashing
      // For demo purposes, we'll use a simple check
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !adminUser) {
        return { error: { message: 'Invalid credentials' } };
      }

      // Create session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          admin_id: adminUser.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      if (sessionError) {
        return { error: sessionError };
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      localStorage.setItem('admin_session', sessionToken);
      setAdmin(adminUser);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    const sessionToken = localStorage.getItem('admin_session');
    if (sessionToken) {
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken);
    }
    localStorage.removeItem('admin_session');
    setAdmin(null);
  };

  const value = {
    admin,
    loading,
    signIn,
    signOut,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
