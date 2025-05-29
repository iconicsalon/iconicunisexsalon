
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
    isInitialized,
    initializeAuth,
    clearState,
    setLoading,
    profile,
    user
  } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state on app load
    if (!isInitialized) {
      console.log('Initializing auth...');
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Handle onboarding redirect when profile is loaded
  useEffect(() => {
    if (user && profile !== null && isInitialized) {
      console.log('Checking onboarding status:', { 
        user: user.id, 
        profile, 
        onboarding_completed: profile?.onboarding_completed,
        currentPath: location.pathname 
      });
      
      // If profile exists but onboarding not completed, redirect to onboarding
      if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
        console.log('Redirecting to onboarding - not completed');
        navigate('/onboarding');
      }
      // If onboarding is completed and user is on onboarding page, redirect to home
      else if (profile && profile.onboarding_completed && location.pathname === '/onboarding') {
        console.log('Redirecting to home - onboarding already completed');
        navigate('/');
      }
    }
  }, [user, profile, isInitialized, location.pathname, navigate]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no user');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or session ended - clearing state');
          clearState();
          
          // Force navigation to home if on protected routes
          if (location.pathname.startsWith('/admin') || 
              location.pathname.startsWith('/my-') || 
              location.pathname === '/onboarding') {
            navigate('/');
          }
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('Fetching profile for user:', session.user.id);
            setLoading(true);
            
            // Use setTimeout to avoid potential callback issues
            setTimeout(async () => {
              try {
                const profile = await fetchProfile(session.user.id);
                console.log('Profile fetched successfully:', profile);
              } catch (error) {
                console.error('Error fetching profile:', error);
              } finally {
                setLoading(false);
              }
            }, 0);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, fetchProfile, navigate, location.pathname, clearState, setLoading]);

  return <>{children}</>;
};

export default AuthProvider;
