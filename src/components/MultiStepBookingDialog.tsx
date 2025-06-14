
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMultiStepBooking } from '@/hooks/useMultiStepBooking';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import ContactStep from '@/components/booking/ContactStep';
import CategoryStep from '@/components/booking/CategoryStep';
import ServiceStep from '@/components/booking/ServiceStep';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

interface MultiStepBookingDialogProps {
  trigger?: React.ReactNode;
  onBookingSuccess?: () => void;
}

const MultiStepBookingDialog: React.FC<MultiStepBookingDialogProps> = ({
  trigger,
  onBookingSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const {
    form,
    currentStep,
    loading,
    submitting,
    services,
    bookingConfirmed,
    confirmedBookingData,
    watchedCategories,
    watchedGender,
    resetBooking,
    nextStep,
    prevStep,
    onSubmit,
    getFilteredServices,
    calculateTotalAmount,
  } = useMultiStepBooking(onBookingSuccess);

  useEffect(() => {
    if (open) {
      resetBooking();
    }
  }, [open, resetBooking]);

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-salon-purple hover:bg-salon-purple/90">
            Book Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {bookingConfirmed ? "Booking Confirmed!" : "Book Your Appointment"}
          </DialogTitle>
          
          {!bookingConfirmed && (
            <>
              <div className="text-sm text-gray-600 mt-2">
                Step {currentStep} of 3: {currentStep === 1 ? "Confirm Details & Select Date" : currentStep === 2 ? "Select Categories" : "Select Services"}
              </div>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentStep >= step ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <ContactStep
                  key="step1"
                  form={form}
                  onNext={nextStep}
                />
              )}

              {currentStep === 2 && (
                <CategoryStep
                  key="step2"
                  form={form}
                  onNext={nextStep}
                  onPrev={prevStep}
                  watchedCategories={watchedCategories}
                />
              )}

              {currentStep === 3 && (
                <ServiceStep
                  key="step3"
                  form={form}
                  onPrev={prevStep}
                  loading={loading}
                  submitting={submitting}
                  watchedCategories={watchedCategories}
                  watchedGender={watchedGender}
                  getFilteredServices={getFilteredServices}
                />
              )}

              {currentStep === 4 && bookingConfirmed && confirmedBookingData && (
                <BookingConfirmation
                  key="step4"
                  confirmedBookingData={confirmedBookingData}
                  services={services}
                  calculateTotalAmount={calculateTotalAmount}
                  onClose={handleClose}
                  onBookingSuccess={onBookingSuccess}
                />
              )}
            </AnimatePresence>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepBookingDialog;
