
import { create } from 'zustand';
import type { UserState } from './types';
import { signInWithGoogle as authSignInWithGoogle, signOut as authSignOut, updateProfile as authUpdateProfile } from './authOperations';
import { fetchProfile as dataFetchProfile, fetchBookings as dataFetchBookings } from './dataOperations';
import { initializeAuth as authInitialize } from './authInit';

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  bookings: [],
  isLoading: true,
  isInitialized: false,

  setUser: (user) => {
    const currentUser = get().user;
    if (currentUser?.id !== user?.id) {
      console.log('Setting user:', user?.id || 'null');
      set({ user });
    }
  },
  
  setSession: (session) => {
    const currentSession = get().session;
    if (currentSession?.access_token !== session?.access_token) {
      console.log('Setting session:', session?.user?.id || 'null');
      set({ session });
    }
  },
  
  setProfile: (profile) => {
    const currentProfile = get().profile;
    if (currentProfile?.id !== profile?.id || currentProfile?.onboarding_completed !== profile?.onboarding_completed) {
      console.log('Setting profile:', profile?.full_name || 'null');
      set({ profile });
    }
  },
  
  setBookings: (bookings) => set({ bookings }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  signInWithGoogle: () => authSignInWithGoogle(),

  signOut: async () => {
    try {
      await authSignOut(() => {
        set({
          user: null,
          session: null,
          profile: null,
          bookings: [],
          isLoading: false,
        });
      });
    } catch (error) {
      console.error('Error in signOut:', error);
      // Force clear state even if signout fails
      set({
        user: null,
        session: null,
        profile: null,
        bookings: [],
        isLoading: false,
      });
    }
  },

  fetchProfile: async (userId: string) => {
    const profile = await dataFetchProfile(userId);
    set({ profile });
    return profile;
  },

  fetchBookings: async (userId: string) => {
    const bookings = await dataFetchBookings(userId);
    set({ bookings });
    return bookings;
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) {
      console.error('No user logged in');
      throw new Error('No user logged in');
    }

    const updatedProfile = await authUpdateProfile(updates, user.id, user.email || '');
    set({ profile: updatedProfile });
  },

  initializeAuth: () => authInitialize({
    setSession: (session) => set({ session }),
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),
    setInitialized: (isInitialized) => set({ isInitialized }),
  }),

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
