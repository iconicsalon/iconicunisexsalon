
import { supabase } from '@/integrations/supabase/client';
import { fetchProfile } from './dataOperations';
import type { User, Session, Profile } from './types';

interface AuthInitCallbacks {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const initializeAuth = async (callbacks: AuthInitCallbacks) => {
  const { setSession, setUser, setProfile, setLoading, setInitialized } = callbacks;
  
  try {
    console.log('Initializing auth state...');
    setLoading(true);
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    if (session?.user) {
      console.log('Found existing session for user:', session.user.id);
      setSession(session);
      setUser(session.user);
      
      // Fetch user profile
      try {
        const profile = await fetchProfile(session.user.id);
        console.log('Profile fetch result during init:', profile);
        setProfile(profile);
      } catch (profileError) {
        console.error('Error fetching profile during init:', profileError);
        // Set profile to null if fetch fails
        setProfile(null);
      }
    } else {
      console.log('No active session found');
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    setUser(null);
    setSession(null);
    setProfile(null);
  } finally {
    setLoading(false);
    setInitialized(true);
  }
};
