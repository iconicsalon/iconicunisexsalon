
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
    fetchProfile,
    profile,
    isInitialized,
    initializeAuth,
    clearState
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
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or session ended');
          clearState();
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Fetch user profile
            const profile = await fetchProfile(session.user.id);
            
            // Handle onboarding redirect
            if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
              navigate('/onboarding');
            } else if (profile && profile.onboarding_completed && location.pathname === '/onboarding') {
              navigate('/');
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, fetchProfile, navigate, location.pathname, clearState]);

  return <>{children}</>;
};

export default AuthProvider;
