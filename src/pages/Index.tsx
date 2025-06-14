
import React from 'react';
import Navbar from '@/components/Navbar';
import PremiumServices from '@/components/PremiumServices';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import GoogleReviews from '@/components/GoogleReviews';
import Footer from '@/components/Footer';
import MultiStepBookingDialog from '@/components/MultiStepBookingDialog';
import AdminTest from '@/components/AdminTest';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User } from 'lucide-react';

const Index = () => {
  const { user, signInWithGoogle, isLoading } = useUserStore();
  const { toast } = useToast();
  
  const handleBookingSuccess = () => {
    console.log('Booking was successful! Refresh booking lists here.');
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign In Failed',
        description: 'There was an error signing in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-salon text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Iconic Unisex Salon
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90 animate-fade-in">
              Experience premium beauty and grooming services in the heart of Bengaluru
            </p>
            
            {/* Buttons Container - Enhanced for mobile elegance */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-8 px-4">
              <MultiStepBookingDialog
                trigger={
                  <button className="group relative w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-salon text-white rounded-2xl font-semibold text-base shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-2 border-white/20 backdrop-blur-sm">
                    <Calendar size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span>Book Appointment</span>
                    <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                }
                onBookingSuccess={handleBookingSuccess}
              />
              
              <button 
                onClick={handleSignIn}
                disabled={isLoading}
                className="group relative w-full sm:w-auto min-w-[220px] inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/95 backdrop-blur-sm text-gray-800 rounded-2xl font-semibold text-base border-2 border-white/40 hover:bg-white hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0 group-hover:rotate-12 transition-transform duration-300">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{user ? 'Signed In' : (isLoading ? 'Signing in...' : 'Sign In')}</span>
                <div className="absolute inset-0 rounded-2xl bg-gray-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </section>

        {/* Admin Test Section - Only show for logged in users */}
        {user && (
          <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
              <AdminTest />
            </div>
          </section>
        )}

        <PremiumServices />
        <TestimonialCarousel />
        <GoogleReviews />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
