
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { fetchProfile } = useUserStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (data.session?.user) {
          const profile = await fetchProfile(data.session.user.id);
          
          if (!profile || !profile.onboarding_completed) {
            navigate('/onboarding');
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate, fetchProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
