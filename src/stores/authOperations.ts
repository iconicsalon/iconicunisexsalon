
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from './types';

export const signInWithGoogle = async () => {
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
};

export const signOut = async (clearState: () => void) => {
  try {
    console.log('Starting logout process...');
    
    // Clear state first to prevent UI issues
    clearState();
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
    clearState();
    throw error;
  }
};

export const updateProfile = async (updates: Partial<Profile>, userId: string, userEmail: string) => {
  try {
    console.log('Updating profile with:', updates);
    console.log('User ID:', userId);
    
    // Prepare the profile data
    const profileData = {
      id: userId,
      email_id: userEmail || '',
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
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
