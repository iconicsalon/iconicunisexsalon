
import React, { useEffect, useRef } from 'react';
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
  const initializationRef = useRef(false);

  // Initialize auth state only once
  useEffect(() => {
    if (!initializationRef.current && !isInitialized) {
      console.log('Initializing auth state...');
      initializationRef.current = true;
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Handle onboarding redirect when profile state changes
  useEffect(() => {
    // Only handle redirects after auth is initialized and we have a user
    if (!isInitialized || !user) return;

    console.log('=== AUTH REDIRECT CHECK ===');
    console.log('User ID:', user.id);
    console.log('Profile:', profile ? 'exists' : 'null');
    console.log('Onboarding completed:', profile?.onboarding_completed);
    console.log('Current path:', location.pathname);
    
    // Skip redirect if already on onboarding page and processing
    if (location.pathname === '/onboarding') return;
    
    // If user exists but profile is null or onboarding not completed, redirect to onboarding
    if (!profile || !profile.onboarding_completed) {
      console.log('Redirecting to onboarding - profile incomplete');
      navigate('/onboarding', { replace: true });
      return;
    }
    
    // If onboarding is completed and user is on onboarding page, redirect to home
    if (profile.onboarding_completed && location.pathname === '/onboarding') {
      console.log('Redirecting to home - onboarding already completed');
      navigate('/', { replace: true });
    }
  }, [user, profile, isInitialized, location.pathname, navigate]);

  // Set up auth state listener only once
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session user ID:', session?.user?.id || 'no user');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out - clearing state');
          clearState();
          
          // Navigate to home if on protected routes
          if (location.pathname.startsWith('/admin') || 
              location.pathname.startsWith('/my-') || 
              location.pathname === '/onboarding') {
            navigate('/', { replace: true });
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
            
            // Use setTimeout to prevent blocking auth state changes
            setTimeout(async () => {
              try {
                const fetchedProfile = await fetchProfile(session.user.id);
                console.log('Profile fetched:', fetchedProfile ? 'found' : 'not found');
              } catch (error) {
                console.error('Error fetching profile:', error);
                // Profile fetch failed - user likely needs onboarding
                console.log('Profile fetch failed, user may need onboarding');
              } finally {
                setLoading(false);
              }
            }, 0);
          }
        }
      }
    );

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [setUser, setSession, fetchProfile, navigate, location.pathname, clearState, setLoading]);

  return <>{children}</>;
};

export default AuthProvider;
