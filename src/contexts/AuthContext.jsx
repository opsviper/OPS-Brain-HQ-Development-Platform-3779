import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For development without Supabase, create a mock user
    const createMockUser = () => {
      const mockUser = {
        id: 'mock-user-id',
        email: 'demo@opsviper.com'
      };
      
      const mockProfile = {
        id: 'mock-user-id',
        email: 'demo@opsviper.com',
        name: 'Demo User',
        role: 'admin'
      };

      setUser(mockUser);
      setUserProfile(mockProfile);
      setLoading(false);
    };

    try {
      // Try to get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          createMockUser();
        }
        setLoading(false);
      }).catch(() => {
        createMockUser();
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => subscription?.unsubscribe();
    } catch (error) {
      console.log('Auth error, using mock user for development');
      createMockUser();
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
      } else {
        // Create user profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: user?.email,
              name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
              role: 'contributor'
            }
          ])
          .select()
          .single();

        if (!createError) {
          setUserProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.log('Mock sign in for development');
      return { data: { user: { id: 'mock-user', email } }, error: null };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      return { data, error };
    } catch (error) {
      console.log('Mock sign up for development');
      return { data: { user: { id: 'mock-user', email } }, error: null };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.log('Mock sign out for development');
      setUser(null);
      setUserProfile(null);
      return { error: null };
    }
  };

  const value = {
    user,
    userProfile,
    signIn,
    signUp,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};