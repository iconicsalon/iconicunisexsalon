
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Instagram, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MyProfile = () => {
  const { user, profile, isLoading, updateProfile, fetchProfile, isInitialized } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    instagram_id: '',
    gender: null as 'male' | 'female' | null,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to be initialized
    if (!isInitialized) return;

    // If no user after initialization, redirect to home
    if (!user) {
      console.log('No user found, redirecting to home');
      navigate('/');
      return;
    }

    // If user exists but hasn't completed onboarding, redirect to onboarding
    if (user && profile && !profile.onboarding_completed) {
      console.log('User needs to complete onboarding, redirecting...');
      navigate('/onboarding');
      return;
    }
  }, [user, profile, isInitialized, navigate]);

  useEffect(() => {
    // Update form data when profile is loaded
    if (profile) {
      console.log('Setting form data from profile:', profile);
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        instagram_id: profile.instagram_id || '',
        gender: profile.gender || null,
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    setFormData(prev => ({
      ...prev,
      gender
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      // Use skipOnboardingUpdate flag to prevent onboarding redirect
      await updateProfile(formData, true);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRetryProfile = async () => {
    if (!user) return;

    setIsRetrying(true);
    try {
      console.log('Retrying profile fetch for user:', user.id);
      await fetchProfile(user.id);
      toast({
        title: 'Profile Loaded',
        description: 'Your profile has been successfully loaded.',
      });
    } catch (error) {
      console.error('Error retrying profile fetch:', error);
      toast({
        title: 'Retry Failed',
        description: 'Could not load profile. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  // Show loading while auth is initializing or user/profile is loading
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If no user after everything is loaded, redirect
  if (!user) {
    navigate('/');
    return null;
  }

  // If no profile after loading, show error with retry option
  if (profile === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-red-600 mb-4">Error loading profile. Please try refreshing the page.</p>
              <Button 
                onClick={handleRetryProfile} 
                disabled={isRetrying}
                className="bg-gradient-salon hover:opacity-90"
              >
                {isRetrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Retrying...
                  </>
                ) : (
                  'Retry Loading Profile'
                )}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold gradient-text mb-8">My Profile</h1>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profile.email_id}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Email cannot be changed as it's linked to your Google account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="Enter your phone number"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_id" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram_id"
                    value={formData.instagram_id}
                    onChange={(e) => handleInputChange('instagram_id', e.target.value)}
                    placeholder="@your_instagram_handle"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenderChange('male')}
                      className={`flex-1 px-4 py-3 rounded-full border transition-all duration-200 font-medium ${
                        formData.gender === 'male'
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      👨 Male
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('female')}
                      className={`flex-1 px-4 py-3 rounded-full border transition-all duration-200 font-medium ${
                        formData.gender === 'female'
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      👩 Female
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="w-full bg-gradient-salon hover:opacity-90 transition-opacity"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Account Information:</p>
                  <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProfile;
