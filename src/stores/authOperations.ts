
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
    
    // Sign out from Supabase first
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during Supabase sign out:', error);
      throw error;
    }
    
    console.log('Supabase logout successful');
    
    // Clear state after successful signout
    clearState();
    console.log('State cleared successfully');
    
    // Clear any remaining auth data
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    
    // Force redirect to home page
    window.location.href = '/';
    
  } catch (error) {
    console.error('Error signing out:', error);
    // Even if signout fails, clear state to prevent stuck state
    clearState();
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    throw error;
  }
};

export const updateProfile = async (updates: Partial<Profile>, userId: string, userEmail: string) => {
  try {
    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('Updating profile with:', updates);
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!userEmail) {
      throw new Error('User email is required');
    }
    
    // Prepare the profile data with proper defaults and validation
    const profileData = {
      id: userId,
      email_id: userEmail,
      full_name: updates.full_name?.trim() || '',
      phone_number: updates.phone_number?.trim() || null,
      instagram_id: updates.instagram_id?.trim() || null,
      onboarding_completed: updates.onboarding_completed !== undefined ? updates.onboarding_completed : false,
      is_admin: false,
      updated_at: new Date().toISOString()
    };

    console.log('Profile data to upsert:', profileData);

    // Validate required fields
    if (!profileData.full_name) {
      throw new Error('Full name is required');
    }

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
      console.error('=== SUPABASE ERROR ===');
      console.error('Error upserting profile:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error code:', error.code);
      throw new Error(`Profile update failed: ${error.message}`);
    }
    
    console.log('=== SUCCESS ===');
    console.log('Profile upsert successful:', data);
    return data;
  } catch (error) {
    console.error('=== CATCH BLOCK ERROR ===');
    console.error('Error updating profile:', error);
    throw error;
  }
};
