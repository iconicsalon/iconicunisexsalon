
import React from 'react';
import Navbar from '@/components/Navbar';
import PremiumServices from '@/components/PremiumServices';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import GoogleReviews from '@/components/GoogleReviews';
import Footer from '@/components/Footer';
import BookAppointmentDialog from '@/components/BookAppointmentDialog';
import { Button } from '@/components/ui/button';

const Index = () => {
  const handleBookingSuccess = () => {
    console.log('Booking was successful! Refresh booking lists here.');
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
            <BookAppointmentDialog
              trigger={
                <Button className="bg-white text-salon-purple px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-lg animate-scale-in">
                  Book Appointment
                </Button>
              }
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        </section>

        <PremiumServices />
        <TestimonialCarousel />
        <GoogleReviews />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
