import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/types/service';

const bookingSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email_id: z.string().email('Valid email is required'),
  phone_number: z.string().optional(),
  booking_date: z.date({
    required_error: 'Booking date is required',
  }),
  time_slot: z.string().min(1, 'Please select a time slot'),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

interface UserProfile {
  id: string;
  full_name: string;
  email_id: string;
  phone_number: string | null;
}

// Generate time slots from 9 AM to 10 PM with 2-hour intervals
export const generateTimeSlots = () => {
  const slots = [
    { value: '9:00 AM - 11:00 AM', label: '9:00 AM - 11:00 AM' },
    { value: '11:00 AM - 1:00 PM', label: '11:00 AM - 1:00 PM' },
    { value: '1:00 PM - 3:00 PM', label: '1:00 PM - 3:00 PM' },
    { value: '3:00 PM - 5:00 PM', label: '3:00 PM - 5:00 PM' },
    { value: '5:00 PM - 7:00 PM', label: '5:00 PM - 7:00 PM' },
    { value: '7:00 PM - 9:00 PM', label: '7:00 PM - 9:00 PM' },
    { value: '9:00 PM - 10:00 PM', label: '9:00 PM - 10:00 PM' },
  ];
  return slots;
};

// Helper function to convert 12-hour time to 24-hour format for comparison
const convertTo24Hour = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours + (minutes / 60);
};

// Filter out past time slots for today
export const getAvailableTimeSlots = (selectedDate: Date) => {
  const allSlots = generateTimeSlots();
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  if (!isToday) {
    return allSlots;
  }
  
  const currentHour = today.getHours() + (today.getMinutes() / 60);
  
  return allSlots.filter(slot => {
    // Extract the start time from the slot (e.g., "9:00 AM" from "9:00 AM - 11:00 AM")
    const startTime = slot.value.split(' - ')[0];
    const slotStartHour = convertTo24Hour(startTime);
    
    // Only show slots that start after the current time
    return slotStartHour > currentHour;
  });
};

export const useBookingForm = (onBookingSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: '',
      email_id: '',
      phone_number: '',
      booking_date: new Date(),
      time_slot: '',
      services: [],
    },
  });

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book an appointment.",
          variant: "destructive",
        });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile information.",
          variant: "destructive",
        });
        return;
      }

      if (profile) {
        setUserProfile(profile);
        form.reset({
          full_name: profile.full_name,
          email_id: profile.email_id,
          phone_number: profile.phone_number || '',
          booking_date: new Date(),
          time_slot: '',
          services: [],
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile information.",
        variant: "destructive",
      });
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Failed to load services.",
          variant: "destructive",
        });
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "User profile not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book an appointment.",
          variant: "destructive",
        });
        return;
      }

      // Calculate total amount
      const selectedServices = services.filter(service => 
        data.services.includes(service.name)
      );
      const totalAmount = selectedServices.reduce((sum, service) => 
        sum + (service.price || 0), 0
      );

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_date: format(data.booking_date, 'yyyy-MM-dd'),
          time_slot: data.time_slot,
          services: data.services,
          total_amount: totalAmount,
          status: 'pending',
        });

      if (error) {
        console.error('Error creating booking:', error);
        toast({
          title: "Error",
          description: "Failed to create booking. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Booking Confirmed!",
        description: "Your appointment has been successfully booked.",
      });

      form.reset();
      onBookingSuccess?.();
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchServices();
  }, []);

  return {
    form,
    loading,
    services,
    userProfile,
    onSubmit,
  };
};
