
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
  created_at: string;
  updated_at: string;
}

interface UserState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearState: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  signInWithGoogle: async () => {
    try {
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      get().clearState();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      set({ profile: data });
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      set({ profile: data });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session?.user) {
        set({ 
          session, 
          user: session.user,
        });
        
        // Fetch user profile
        await get().fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ 
        isLoading: false,
        isInitialized: true 
      });
    }
  },

  clearState: () => {
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
    });
  },
}));
