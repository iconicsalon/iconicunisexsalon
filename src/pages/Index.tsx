
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
            
            {/* Book Appointment Button - Centered */}
            <div className="flex justify-center items-center mb-8 px-4">
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
