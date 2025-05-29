
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
    if (user && isInitialized) {
      console.log('Checking onboarding status:', { 
        user: user.id, 
        profile, 
        onboarding_completed: profile?.onboarding_completed,
        currentPath: location.pathname 
      });
      
      // If user exists but profile is null, they need to complete onboarding
      if (profile === null && location.pathname !== '/onboarding') {
        console.log('Profile is null - redirecting to onboarding');
        navigate('/onboarding');
        return;
      }
      
      // If profile exists but onboarding not completed, redirect to onboarding
      if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
        console.log('Redirecting to onboarding - not completed');
        navigate('/onboarding');
        return;
      }
      
      // If onboarding is completed and user is on onboarding page, redirect to home
      if (profile && profile.onboarding_completed && location.pathname === '/onboarding') {
        console.log('Redirecting to home - onboarding already completed');
        navigate('/');
        return;
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
            
            try {
              const profile = await fetchProfile(session.user.id);
              console.log('Profile fetched successfully:', profile);
              
              // After profile is fetched, check if user needs onboarding
              if (!profile || !profile.onboarding_completed) {
                console.log('User needs onboarding, redirecting...');
                navigate('/onboarding');
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              // If profile fetch fails for a signed-in user, they likely need onboarding
              console.log('Profile fetch failed, redirecting to onboarding');
              navigate('/onboarding');
            } finally {
              setLoading(false);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, fetchProfile, navigate, location.pathname, clearState, setLoading]);

  return <>{children}</>;
};

export default AuthProvider;
