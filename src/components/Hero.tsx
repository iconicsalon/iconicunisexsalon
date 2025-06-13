
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import SimpleBookingDialog from './SimpleBookingDialog';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';

const Hero = () => {
  const { user, signInWithGoogle, isLoading } = useUserStore();
  const { toast } = useToast();

  const handleBookingSuccess = () => {
    console.log('Booking was successful! Refresh booking lists here.');
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: 'Sign In Failed',
        description: 'There was an error signing in with Google. Please try again.',
        variant: 'destructive',
      });
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
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
            
            {/* Google Sign In Button or Show Offers Button */}
            {!user ? (
              <button 
                className="gsi-material-button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in</span>
                  <span style={{ display: 'none' }}>Sign in with Google</span>
                </div>
              </button>
            ) : (
              <Link to="/offers">
                <Button 
                  size="lg"
                  className="bg-salon-rose hover:bg-salon-rose/90 transition-all duration-300 hover:scale-105 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl"
                >
                  Show Offers
                </Button>
              </Link>
            )}
          </div>

          {/* View Services Button */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-salon-purple text-salon-purple hover:bg-salon-purple hover:text-white transition-all duration-300 px-8 py-6 text-lg font-semibold rounded-xl"
            >
              View Services
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
