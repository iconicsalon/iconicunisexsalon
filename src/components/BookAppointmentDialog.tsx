
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const bookingSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email_id: z.string().email('Valid email is required'),
  phone_number: z.string().optional(),
  booking_date: z.date({
    required_error: 'Booking date is required',
  }),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Service {
  id: string;
  name: string;
  category: string;
  price: number | null;
  duration_minutes: number | null;
}

interface UserProfile {
  id: string;
  full_name: string;
  email_id: string;
  phone_number: string | null;
}

const serviceCategories = [
  { title: 'Haircut & Styling', emoji: '✂️' },
  { title: 'Hair Coloring / Treatment', emoji: '🎨' },
  { title: 'Facial & Skincare', emoji: '💆‍♀️' },
  { title: 'Waxing', emoji: '🧖‍♀️' },
  { title: 'Manicure & Pedicure', emoji: '💅' },
  { title: 'Makeup Services', emoji: '💄' },
  { title: 'Massage & Relaxation', emoji: '🧘' },
];

interface BookAppointmentDialogProps {
  trigger?: React.ReactNode;
  onBookingSuccess?: () => void;
}

const BookAppointmentDialog: React.FC<BookAppointmentDialogProps> = ({
  trigger,
  onBookingSuccess,
}) => {
  const [open, setOpen] = useState(false);
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
      services: [],
    },
  });

  useEffect(() => {
    if (open) {
      fetchUserProfile();
      fetchServices();
    }
  }, [open]);

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
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

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

      setOpen(false);
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

  const groupedServices = serviceCategories.map(category => ({
    ...category,
    services: services.filter(service => service.category === category.title),
  }));

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
            {/* User Information - Pre-filled and disabled */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Booking Date */}
            <FormField
              control={form.control}
              name="booking_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Booking Date</FormLabel>
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
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Services Selection */}
            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold">
                      Select Services
                    </FormLabel>
                  </div>
                  <div className="space-y-6">
                    {groupedServices.map((category) => (
                      <div key={category.title} className="space-y-3">
                        <h4 className="text-md font-medium text-salon-purple flex items-center gap-2">
                          <span>{category.emoji}</span>
                          {category.title}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                          {category.services.map((service) => (
                            <FormField
                              key={service.id}
                              control={form.control}
                              name="services"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={service.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service.name)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, service.name])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== service.name
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-normal">
                                        {service.name}
                                      </FormLabel>
                                      {service.price && (
                                        <p className="text-xs text-gray-500">
                                          ₹{service.price} • {service.duration_minutes} min
                                        </p>
                                      )}
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
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

export default BookAppointmentDialog;
