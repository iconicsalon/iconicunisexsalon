import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Calendar, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Service } from '@/types/service';
import { generateTimeSlots, getAvailableTimeSlots } from '@/hooks/useBookingForm';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const bookingSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email_id: z.string().email('Valid email is required'),
  phone_number: z.string().optional(),
  booking_date: z.date({
    required_error: 'Booking date is required',
  }),
  time_slot: z.string().min(1, 'Please select a time slot'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select a gender',
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
  gender: string | null;
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
  const [submitting, setSubmitting] = useState(false); // New state to track form submission
  const [services, setServices] = useState<Service[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<BookingFormData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: '',
      email_id: '',
      phone_number: '',
      booking_date: new Date(),
      time_slot: '',
      gender: 'female',
      categories: [],
      services: [],
    },
  });

  const watchedCategories = form.watch('categories');
  const watchedGender = form.watch('gender');
  const watchedBookingDate = form.watch('booking_date');

  useEffect(() => {
    if (open) {
      fetchUserProfile();
      fetchServices();
      setCurrentStep(1);
      setBookingConfirmed(false);
      setConfirmedBookingData(null);
      setSubmitting(false); // Reset submitting state when dialog opens
      form.reset({
        full_name: '',
        email_id: '',
        phone_number: '',
        booking_date: new Date(),
        time_slot: '',
        gender: 'female',
        categories: [],
        services: [],
      });
    }
  }, [open]);

  useEffect(() => {
    // Reset services when categories change, but prevent infinite loops
    if (watchedCategories.length === 0) {
      const currentServices = form.getValues('services');
      if (currentServices.length > 0) {
        form.setValue('services', [], { shouldValidate: false });
      }
    } else {
      // Remove services that don't belong to selected categories
      const currentServices = form.getValues('services');
      const validServices = currentServices.filter(serviceName => {
        const service = services.find(s => s.name === serviceName);
        return service && service.category && watchedCategories.includes(service.category.name);
      });
      if (validServices.length !== currentServices.length) {
        form.setValue('services', validServices, { shouldValidate: false });
      }
    }
  }, [watchedCategories, services, form]);

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
          gender: (profile.gender as 'male' | 'female') || 'female',
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
      console.log('Fetching services...');
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

      console.log('Services fetched successfully:', data);
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
      isValid = await form.trigger(['full_name', 'email_id', 'booking_date', 'time_slot', 'gender']);
    } else if (currentStep === 2) {
      isValid = await form.trigger(['categories']);
    } else if (currentStep === 3) {
      isValid = await form.trigger(['services']);
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: BookingFormData) => {
    // Prevent multiple submissions
    if (submitting) {
      console.log('Form submission already in progress, ignoring duplicate submission');
      return;
    }

    if (!userProfile) {
      toast({
        title: "Error",
        description: "User profile not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true); // Set submitting state to prevent duplicates
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

      // Filter categories to only include those with selected services
      const categoriesWithSelectedServices = data.categories.filter(category => {
        return selectedServices.some(service => 
          service.category && service.category.name === category
        );
      });

      console.log('Submitting booking with data:', {
        user_id: user.id,
        booking_date: format(data.booking_date, 'yyyy-MM-dd'),
        time_slot: data.time_slot,
        services: data.services,
        category_list: categoriesWithSelectedServices,
        total_amount: totalAmount,
      });

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_date: format(data.booking_date, 'yyyy-MM-dd'),
          time_slot: data.time_slot,
          services: data.services,
          category_list: categoriesWithSelectedServices, // Only save categories with selected services
          total_amount: totalAmount,
          amount_paid: totalAmount,
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

      console.log('Booking created successfully');
      setConfirmedBookingData(data);
      setBookingConfirmed(true);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSubmitting(false); // Reset submitting state
    }
  };

  // Filter services based on gender and categories
  const getFilteredServices = () => {
    return services.filter(service => {
      // Check if service belongs to selected categories
      const belongsToCategory = service.category && watchedCategories.includes(service.category.name);
      if (!belongsToCategory) return false;
      
      // Show unisex services to everyone
      if (!service.gender || service.gender === 'unisex') return true;
      
      // Show gender-specific services based on selected gender
      return service.gender === watchedGender;
    });
  };

  const groupedServices = watchedCategories.map(category => ({
    category,
    services: getFilteredServices().filter(service => service.category?.name === category),
  }));

  const calculateTotalAmount = () => {
    const selectedServices = services.filter(service => 
      form.getValues('services').includes(service.name)
    );
    return selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  };

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
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {bookingConfirmed ? "Booking Confirmed!" : "Book Your Appointment"}
          </DialogTitle>
          
          {!bookingConfirmed && (
            <>
              <div className="text-sm text-gray-600 mt-2">
                Step {currentStep} of 3: {currentStep === 1 ? "Confirm Details & Select Date/Time" : currentStep === 2 ? "Select Categories" : "Select Services"}
              </div>
              
              {/* Progress indicator */}
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
        
        {currentStep !== 4 ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Contact Information, Date & Time Slot */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled 
                                  className="bg-gray-100 border-0 text-gray-700 h-12 px-4 rounded-lg" 
                                  placeholder="Jane Doe"
                                />
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
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email" 
                                  disabled 
                                  className="bg-gray-100 border-0 text-gray-700 h-12 px-4 rounded-lg" 
                                  placeholder="jane.doe@example.com"
                                />
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
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled 
                                  className="bg-gray-100 border-0 text-gray-700 h-12 px-4 rounded-lg" 
                                  placeholder="+91 98765 43210"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-900">
                              Gender <span className="text-pink-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex gap-4 mt-2">
                                <button
                                  type="button"
                                  onClick={() => field.onChange('male')}
                                  className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                                    field.value === 'male'
                                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                  }`}
                                >
                                  Male
                                </button>
                                <button
                                  type="button"
                                  onClick={() => field.onChange('female')}
                                  className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                                    field.value === 'female'
                                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                  }`}
                                >
                                  Female
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="booking_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-900">
                              Booking Date <span className="text-pink-500">*</span>
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-12 px-4 text-left font-normal border-gray-300 bg-white hover:bg-gray-50",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy")
                                    ) : (
                                      <span className="text-gray-500">mm/dd/yyyy</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
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
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="time_slot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-900">
                              Time Slot <span className="text-pink-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full h-12 px-4 border-gray-300 bg-white hover:bg-gray-50">
                                  <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getAvailableTimeSlots(watchedBookingDate).map((slot) => (
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
                    
                    <div className="pt-4">
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12 rounded-lg font-medium"
                      >
                        Next
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
                    <p className="text-sm text-gray-600">
                      Services for {watchedGender} and unisex services
                    </p>
                    
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
                                                  <div className="flex items-center justify-between">
                                                    <div className="font-medium">{service.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                      {service.gender && service.gender !== 'unisex' && (
                                                        <span className="capitalize">{service.gender}</span>
                                                      )}
                                                      {service.gender === 'unisex' && (
                                                        <span>Unisex</span>
                                                      )}
                                                    </div>
                                                  </div>
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
                        disabled={loading || submitting || form.getValues('services').length === 0}
                      >
                        {loading || submitting ? "Booking..." : "Book Now"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        ) : (
          /* Step 4: Booking Confirmation - Outside of form */
          bookingConfirmed && confirmedBookingData && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header with checkmark */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600">Your appointment has been successfully scheduled.</p>
                </div>
              </div>

              {/* Selected Services Section */}
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

              {/* Booking Date & Time Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-salon-purple font-semibold">
                  <Calendar className="h-5 w-5" />
                  <span>Booking Date & Time</span>
                </div>
                <div className="text-gray-700">
                  <div>{format(confirmedBookingData.booking_date, "EEEE, MMMM d, yyyy")}</div>
                  <div className="font-medium text-salon-purple">{confirmedBookingData.time_slot}</div>
                </div>
              </div>

              {/* Total Amount Section */}
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

              {/* Action Buttons - Now outside form */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => {
                    setOpen(false);
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
                    setOpen(false);
                    form.reset();
                  }}
                  className="w-full border-salon-purple text-salon-purple hover:bg-salon-purple/10 py-3 rounded-lg font-medium"
                >
                  Add to Calendar
                </Button>
              </div>

              {/* Back to Homepage Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate('/');
                  }}
                  className="text-salon-purple hover:underline text-sm font-medium"
                >
                  Back to Homepage
                </button>
              </div>
            </motion.div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepBookingDialog;
