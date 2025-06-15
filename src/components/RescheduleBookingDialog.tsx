
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateTimeSlots, getAvailableTimeSlots } from '@/hooks/useBookingForm';
import type { Booking } from '@/stores/types';

const rescheduleSchema = z.object({
  booking_date: z.date({
    required_error: 'Please select a new date',
  }),
  time_slot: z.string().min(1, 'Please select a time slot'),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface RescheduleBookingDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdate: () => void;
}

const RescheduleBookingDialog = ({ 
  booking, 
  open, 
  onOpenChange, 
  onBookingUpdate 
}: RescheduleBookingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      booking_date: new Date(booking.booking_date),
      time_slot: booking.time_slot || '',
    },
  });

  const watchedBookingDate = form.watch('booking_date');

  // Auto-select closest available time slot when date changes
  useEffect(() => {
    if (watchedBookingDate) {
      const availableSlots = getAvailableTimeSlots(watchedBookingDate);
      const currentTimeSlot = form.getValues('time_slot');
      
      // If current time slot is not available for the new date, select the first available one
      if (availableSlots.length > 0 && !availableSlots.find(slot => slot.value === currentTimeSlot)) {
        form.setValue('time_slot', availableSlots[0].value, { shouldValidate: false });
      }
    }
  }, [watchedBookingDate, form]);

  const onSubmit = async (data: RescheduleFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: format(data.booking_date, 'yyyy-MM-dd'),
          time_slot: data.time_slot,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "✅ Booking Rescheduled!",
        description: "Your appointment has been successfully rescheduled.",
      });

      onBookingUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableTimeSlots = getAvailableTimeSlots(watchedBookingDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="booking_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>New Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Time Slot</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
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
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-salon hover:opacity-90"
              >
                {loading ? 'Rescheduling...' : 'Reschedule Booking'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleBookingDialog;
