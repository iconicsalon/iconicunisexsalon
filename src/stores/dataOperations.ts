
import { supabase } from '@/integrations/supabase/client';
import type { Profile, Booking } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Fetching profile for user ID:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    if (!data) {
      console.log('No profile data found');
      return null;
    }
    
    // Type assertion to ensure gender field matches our Profile interface
    const profile: Profile = {
      ...data,
      gender: data.gender as 'male' | 'female' | null
    };
    
    console.log('Profile data received:', profile);
    return profile;
  } catch (error) {
    console.error('Error in fetchProfile:', error);
    return null;
  }
};

export const fetchBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};
