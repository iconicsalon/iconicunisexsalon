
import React from 'react';
import BookAppointmentDialog from './BookAppointmentDialog';
import { Button } from '@/components/ui/button';

const BookingExample = () => {
  const handleBookingSuccess = () => {
    console.log('Booking was successful! Refresh booking lists here.');
    // This is where you would refresh your booking lists
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-4">
          Welcome to Iconic Unisex Salon
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Book your appointment with our professional stylists
        </p>
        
        <BookAppointmentDialog 
          trigger={
            <Button size="lg" className="bg-salon-purple hover:bg-salon-purple/90">
              Book Appointment
            </Button>
          }
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-4xl mb-4">✂️</div>
          <h3 className="text-xl font-semibold mb-2">Expert Stylists</h3>
          <p className="text-gray-600">Professional hair cutting and styling services</p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-4xl mb-4">💆‍♀️</div>
          <h3 className="text-xl font-semibold mb-2">Beauty Treatments</h3>
          <p className="text-gray-600">Facial, skincare, and relaxation services</p>
        </div>
        
        <div className="text-4xl mb-4">💅</div>
          <h3 className="text-xl font-semibold mb-2">Nail Care</h3>
          <p className="text-gray-600">Professional manicure and pedicure services</p>
        </div>
      </div>
    </div>
  );
};

export default BookingExample;
