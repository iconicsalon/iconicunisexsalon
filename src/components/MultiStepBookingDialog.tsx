import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Service } from '@/types/service';
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
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

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

interface MultiStepBookingDialogProps {
  trigger?: React.ReactNode;
  onBookingSuccess?: () => void;
}

const MultiStepBookingDialog: React.FC<MultiStepBookingDialogProps> = ({
  trigger,
  onBookingSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: '',
      email_id: '',
      phone_number: '',
      booking_date: new Date(),
      categories: [],
      services: [],
    },
  });

  const watchedCategories = form.watch('categories');
  const watchedServices = form.watch('services');

  useEffect(() => {
    if (open) {
      fetchUserProfile();
      fetchServices();
      setCurrentStep(1);
      form.reset({
        full_name: '',
        email_id: '',
        phone_number: '',
        booking_date: new Date(),
        categories: [],
        services: [],
      });
    }
  }, [open]);

  useEffect(() => {
    // Reset services when categories change
    if (watchedCategories.length === 0) {
      form.setValue('services', []);
    } else {
      // Remove services that don't belong to selected categories
      const validServices = watchedServices.filter(serviceName => {
        const service = services.find(s => s.name === serviceName);
        return service && service.category && watchedCategories.includes(service.category.name);
      });
      if (validServices.length !== watchedServices.length) {
        form.setValue('services', validServices);
      }
    }
  }, [watchedCategories, services, watchedServices, form]);

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
          categories: [],
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

  const nextStep = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await form.trigger(['full_name', 'email_id', 'booking_date']);
    } else if (currentStep === 2) {
      isValid = await form.trigger(['categories']);
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
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
          category_list: data.categories,
          total_amount: totalAmount,
          amount_paid: totalAmount, // Default to total amount
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
      navigate('/my-bookings');
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

  const filteredServices = services.filter(service => 
    service.category && watchedCategories.includes(service.category.name)
  );

  const groupedServices = watchedCategories.map(category => ({
    category,
    services: services.filter(service => service.category?.name === category),
  }));

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
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
          <DialogTitle className="text-2xl font-bold gradient-text">
            Book Your Appointment
          </DialogTitle>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentStep >= step ? 'bg-salon-purple' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="text-center text-sm text-gray-600 mt-2">
            Step {currentStep} of 3
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
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
                  
                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={nextStep}>
                      Next Step <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Categories */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-800">Select Service Categories</h3>
                  <p className="text-sm text-gray-600">Choose the types of services you're interested in</p>
                  
                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {serviceCategories.map((category) => (
                            <FormField
                              key={category.title}
                              control={form.control}
                              name="categories"
                              render={({ field }) => {
                                return (
                                  <FormItem>
                                    <FormControl>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const isSelected = field.value?.includes(category.title);
                                          if (isSelected) {
                                            field.onChange(
                                              field.value?.filter(value => value !== category.title)
                                            );
                                          } else {
                                            field.onChange([...field.value, category.title]);
                                          }
                                        }}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                          field.value?.includes(category.title)
                                            ? 'border-salon-purple bg-salon-purple/10 text-salon-purple'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <span className="text-2xl">{category.emoji}</span>
                                          <span className="font-medium">{category.title}</span>
                                        </div>
                                      </button>
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={watchedCategories.length === 0}
                    >
                      Next Step <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Select Services */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-800">Select Services</h3>
                  <p className="text-sm text-gray-600">Choose specific services from your selected categories</p>
                  
                  <FormField
                    control={form.control}
                    name="services"
                    render={() => (
                      <FormItem>
                        <div className="space-y-6 max-h-96 overflow-y-auto">
                          {groupedServices.map((group) => (
                            <div key={group.category} className="space-y-3">
                              <h4 className="text-md font-medium text-salon-purple flex items-center gap-2">
                                <span>{serviceCategories.find(cat => cat.title === group.category)?.emoji}</span>
                                {group.category}
                              </h4>
                              <div className="grid grid-cols-1 gap-3 ml-6">
                                {group.services.map((service) => (
                                  <FormField
                                    key={service.id}
                                    control={form.control}
                                    name="services"
                                    render={({ field }) => {
                                      return (
                                        <FormItem>
                                          <FormControl>
                                            <label className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
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
                                              <div className="flex-1">
                                                <div className="font-medium">{service.name}</div>
                                                {service.price && service.duration_minutes && (
                                                  <div className="text-sm text-gray-500">
                                                    ₹{service.price} • {service.duration_minutes} min
                                                  </div>
                                                )}
                                              </div>
                                            </label>
                                          </FormControl>
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
                  
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-salon-purple hover:bg-salon-purple/90"
                      disabled={loading || watchedServices.length === 0}
                    >
                      {loading ? "Booking..." : "Book Now"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepBookingDialog;
