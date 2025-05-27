
import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    setUser, 
    setSession, 
    setLoading, 
    fetchProfile,
    user,
    profile,
    isInitialized,
    initializeAuth,
    setInitialized
  } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state on app load
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          const profile = await fetchProfile(session.user.id);
          
          // Check if we need to redirect for onboarding
          if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
            navigate('/onboarding');
          } else if (profile && profile.onboarding_completed && location.pathname === '/onboarding') {
            navigate('/');
          }
        } else {
          // User signed out, clear state
          setLoading(false);
        }
        
        if (!isInitialized) {
          setInitialized(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading, fetchProfile, navigate, location.pathname, isInitialized, setInitialized]);

  return <>{children}</>;
};

export default AuthProvider;
