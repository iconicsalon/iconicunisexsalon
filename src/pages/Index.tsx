
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
            
            {/* Buttons Container - Both buttons always visible */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <MultiStepBookingDialog
                trigger={
                  <Button className="bg-white text-salon-purple px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-lg animate-scale-in min-w-[200px]">
                    Book Appointment
                  </Button>
                }
                onBookingSuccess={handleBookingSuccess}
              />
              
              <Button 
                onClick={handleSignIn}
                disabled={isLoading}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-salon-purple transition-all duration-300 px-8 py-4 rounded-full font-semibold text-lg shadow-lg min-w-[200px]"
              >
                {user ? 'Already Signed In' : (isLoading ? 'Signing in...' : 'Sign in with Google')}
              </Button>
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
