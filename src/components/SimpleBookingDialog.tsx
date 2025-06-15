
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useBookingForm, getAvailableTimeSlots } from '@/hooks/useBookingForm';
import ContactInformation from '@/components/booking/ContactInformation';
import ServiceSelection from '@/components/booking/ServiceSelection';

interface SimpleBookingDialogProps {
  trigger?: React.ReactNode;
  onBookingSuccess?: () => void;
}

const SimpleBookingDialog: React.FC<SimpleBookingDialogProps> = ({
  trigger,
  onBookingSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const { form, loading, services, onSubmit } = useBookingForm(() => {
    setOpen(false);
    onBookingSuccess?.();
  });

  const selectedDate = form.watch('booking_date');
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);

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
          <DialogTitle className="text-2xl font-bold gradient-text">
            Book Your Appointment
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ContactInformation form={form} />
            
            <FormField
              control={form.control}
              name="time_slot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ServiceSelection form={form} services={services} />

            <Button
              type="submit"
              className="w-full bg-salon-purple hover:bg-salon-purple/90"
              disabled={loading}
            >
              {loading ? "Booking..." : "Book Now"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBookingDialog;
