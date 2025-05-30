import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  email_id: string;
  phone_number: string | null;
  instagram_id: string | null;
  onboarding_completed: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  services: string[];
  status: string;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
}

interface UserState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  bookings: Booking[];
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  fetchBookings: (userId: string) => Promise<Booking[]>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearState: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  bookings: [],
  isLoading: true,
  isInitialized: false,

  setUser: (user) => {
    console.log('Setting user:', user?.id || 'null');
    set({ user });
  },
  setSession: (session) => {
    console.log('Setting session:', session?.user?.id || 'null');
    set({ session });
  },
  setProfile: (profile) => {
    console.log('Setting profile:', profile?.full_name || 'null');
    set({ profile });
  },
  setBookings: (bookings) => set({ bookings }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  signInWithGoogle: async () => {
    try {
      console.log('Starting Google sign in...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      console.log('Starting logout process...');
      console.log('Current user before logout:', get().user?.id);
      console.log('Current session before logout:', get().session?.access_token ? 'exists' : 'none');
      
      // Clear state first to prevent UI issues
      set({
        user: null,
        session: null,
        profile: null,
        bookings: [],
        isLoading: false,
      });
      console.log('State cleared successfully');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during Supabase sign out:', error);
        throw error;
      }
      
      console.log('Supabase logout successful');
      
      // Force redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if signout fails, clear state to prevent stuck state
      set({
        user: null,
        session: null,
        profile: null,
        bookings: [],
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        set({ profile: null });
        return null;
      }
      
      console.log('Profile data received:', data);
      set({ profile: data });
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      set({ profile: null });
      return null;
    }
  },

  fetchBookings: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      
      set({ bookings: data || [] });
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      set({ bookings: [] });
      return [];
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    try {
      console.log('Updating profile with:', updates);
      console.log('User ID:', user.id);
      
      // Prepare the profile data
      const profileData = {
        id: user.id,
        email_id: user.email || '',
        full_name: updates.full_name || '',
        phone_number: updates.phone_number || null,
        instagram_id: updates.instagram_id || null,
        onboarding_completed: updates.onboarding_completed !== undefined ? updates.onboarding_completed : false,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Profile data to upsert:', profileData);

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting profile:', error);
        throw error;
      }
      
      console.log('Profile upsert successful:', data);
      set({ profile: data });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  initializeAuth: async () => {
    try {
      console.log('Initializing auth state...');
      set({ isLoading: true });
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ 
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true 
        });
        return;
      }

      if (session?.user) {
        console.log('Found existing session for user:', session.user.id);
        set({ 
          session, 
          user: session.user,
        });
        
        // Fetch user profile
        try {
          const profile = await get().fetchProfile(session.user.id);
          console.log('Profile fetch result during init:', profile);
        } catch (profileError) {
          console.error('Error fetching profile during init:', profileError);
          // Set profile to null if fetch fails
          set({ profile: null });
        }
      } else {
        console.log('No active session found');
        set({
          user: null,
          session: null,
          profile: null,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        user: null,
        session: null,
        profile: null,
      });
    } finally {
      set({ 
        isLoading: false,
        isInitialized: true 
      });
    }
  },

  clearState: () => {
    console.log('Clearing all auth state');
    set({
      user: null,
      session: null,
      profile: null,
      bookings: [],
      isLoading: false,
    });
  },
}));
