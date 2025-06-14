
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle, Calendar, Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BookingFormData } from '@/hooks/useMultiStepBooking';
import type { Service } from '@/types/service';
import { Button } from '@/components/ui/button';

interface BookingConfirmationProps {
  confirmedBookingData: BookingFormData;
  services: Service[];
  calculateTotalAmount: () => number;
  onClose: () => void;
  onBookingSuccess?: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  confirmedBookingData,
  services,
  calculateTotalAmount,
  onClose,
  onBookingSuccess,
}) => {
  const navigate = useNavigate();

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600">Your appointment has been successfully scheduled.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-salon-purple font-semibold">
          <Scissors className="h-5 w-5" />
          <span>Selected Services</span>
        </div>
        <div className="space-y-3">
          {confirmedBookingData.services.map((serviceName, index) => {
            const service = services.find(s => s.name === serviceName);
            return (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">{serviceName}</span>
                {service?.price && (
                  <span className="font-medium text-gray-900">₹{service.price}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-salon-purple font-semibold">
          <Calendar className="h-5 w-5" />
          <span>Booking Date & Time</span>
        </div>
        <div className="text-gray-700">
          {format(confirmedBookingData.booking_date, "EEEE, MMMM d, yyyy, h:mm a")}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-salon-purple font-semibold">
          <span>Total Amount</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Paid</span>
            <span className="text-2xl font-bold text-salon-purple">₹{calculateTotalAmount()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <Button
          onClick={() => {
            onClose();
            onBookingSuccess?.();
            navigate('/my-bookings');
          }}
          className="w-full bg-salon-purple hover:bg-salon-purple/90 text-white py-3 rounded-lg font-medium"
        >
          <Calendar className="h-4 w-4 mr-2" />
          View In My Bookings
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            onClose();
          }}
          className="w-full border-salon-purple text-salon-purple hover:bg-salon-purple/10 py-3 rounded-lg font-medium"
        >
          Add to Calendar
        </Button>
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/');
          }}
          className="text-salon-purple hover:underline text-sm font-medium"
        >
          Back to Homepage
        </button>
      </div>
    </motion.div>
  );
};

export default BookingConfirmation;
