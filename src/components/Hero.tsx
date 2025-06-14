
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, MapPin } from 'lucide-react';
import SimpleBookingDialog from './SimpleBookingDialog';
import { useUserStore } from '@/stores/userStore';

const Hero = () => {
  const { user, signInWithGoogle, isLoading } = useUserStore();
  
  const handleBookingSuccess = () => {
    console.log('Booking was successful! Refresh booking lists here.');
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-salon opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/30">
            <Star className="h-4 w-4 text-salon-gold fill-current" />
            <span className="text-sm font-medium text-gray-700">Bengaluru's Premium Unisex Salon</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Transform Your Look at{' '}
            <span className="gradient-text">Iconic Unisex Salon</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience premium hair styling, skincare, and beauty treatments in the heart of Bengaluru. 
            Your journey to iconic style starts here.
          </p>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 mb-8 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>Bengaluru, Karnataka</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SimpleBookingDialog
              trigger={
                <Button 
                  size="lg" 
                  className="bg-gradient-salon hover:opacity-90 transition-all duration-300 hover:scale-105 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl"
                >
                  Book Your Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              }
              onBookingSuccess={handleBookingSuccess}
            />
            
            <Button 
              onClick={handleSignIn}
              disabled={isLoading}
              variant="outline" 
              size="lg"
              className="border-2 border-salon-purple text-salon-purple hover:bg-salon-purple hover:text-white transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-xl bg-white shadow-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">1000+</div>
              <div className="text-sm text-gray-500 mt-1">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">5★</div>
              <div className="text-sm text-gray-500 mt-1">Google Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">15+</div>
              <div className="text-sm text-gray-500 mt-1">Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-salon-purple/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-salon-rose/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-salon-gold/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </section>
  );
};

export default Hero;
