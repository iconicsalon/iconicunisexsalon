
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  email_id: string;
  phone_number: string | null;
  instagram_id: string | null;
  gender: 'male' | 'female' | null;
  onboarding_completed: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  services: string[];
  category_list: string[];
  status: string;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserState {
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
  updateProfile: (updates: Partial<Profile>, skipOnboardingUpdate?: boolean) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearState: () => void;
}
