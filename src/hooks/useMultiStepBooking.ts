import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/stores/userStore';
import type { Service } from '@/types/service';

const bookingSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email_id: z.string().email('Valid email is required'),
  phone_number: z.string().optional(),
  booking_date: z.date({
    required_error: 'Booking date is required',
  }),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select a gender',
  }),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const useMultiStepBooking = (onBookingSuccess?: () => void) => {
  // All useState hooks first
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<BookingFormData | null>(null);
  
  // Then all other hooks
  const { toast } = useToast();
  const { profile } = useUserStore();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: '',
      email_id: '',
      phone_number: '',
      booking_date: new Date(),
      gender: 'female',
      categories: [],
      services: [],
    },
  });

  const watchedCategories = form.watch('categories');
  const watchedGender = form.watch('gender');

  const nextStep = async () => {
    console.log('nextStep called, current step:', currentStep);
    let isValid = false;
    
    if (currentStep === 1) {
      console.log('Validating step 1 fields');
      
      // Get current form values for debugging
      const formValues = form.getValues();
      console.log('Form values before validation:', formValues);
      
      // Ensure profile data is set in form before validation
      if (profile) {
        if (!formValues.full_name && profile.full_name) {
          form.setValue('full_name', profile.full_name);
        }
        if (!formValues.email_id && profile.email_id) {
          form.setValue('email_id', profile.email_id);
        }
        if (profile.phone_number) {
          form.setValue('phone_number', profile.phone_number);
        }
      }
      
      isValid = await form.trigger(['full_name', 'email_id', 'booking_date', 'gender']);
      console.log('Step 1 validation result:', isValid);
      console.log('Form errors:', form.formState.errors);
    } else if (currentStep === 2) {
      console.log('Validating step 2 fields'); 
      isValid = await form.trigger(['categories']);
      console.log('Step 2 validation result:', isValid);
    } else if (currentStep === 3) {
      console.log('Validating step 3 fields');
      isValid = await form.trigger(['services']);
      console.log('Step 3 validation result:', isValid);
    }
    
    if (isValid) {
      console.log('Validation passed, moving to next step');
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('Validation failed, staying on current step');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const resetBooking = () => {
    console.log('Resetting booking form');
    setCurrentStep(1);
    setBookingConfirmed(false);
    setConfirmedBookingData(null);
    setSubmitting(false);
    
    // Reset form with profile data
    const defaultValues = {
      full_name: profile?.full_name || '',
      email_id: profile?.email_id || '',
      phone_number: profile?.phone_number || '',
      booking_date: new Date(),
      gender: (profile?.gender as 'male' | 'female') || 'female',
      categories: [],
      services: [],
    };
    
    console.log('Resetting form with default values:', defaultValues);
    form.reset(defaultValues);
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

  const onSubmit = async (data: BookingFormData) => {
    if (submitting) {
      console.log('Form submission already in progress, ignoring duplicate submission');
      return;
    }

    if (!profile) {
      toast({
        title: "Error",
        description: "User profile not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
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

      const selectedServices = services.filter(service => 
        data.services.includes(service.name)
      );
      const totalAmount = selectedServices.reduce((sum, service) => 
        sum + (service.price || 0), 0
      );

      const categoriesWithSelectedServices = data.categories.filter(category => {
        return selectedServices.some(service => 
          service.category && service.category.name === category
        );
      });

      console.log('Submitting booking with data:', {
        user_id: user.id,
        booking_date: format(data.booking_date, 'yyyy-MM-dd'),
        services: data.services,
        category_list: categoriesWithSelectedServices,
        total_amount: totalAmount,
      });

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_date: format(data.booking_date, 'yyyy-MM-dd'),
          services: data.services,
          category_list: categoriesWithSelectedServices,
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
      setSubmitting(false);
    }
  };

  const getFilteredServices = () => {
    return services.filter(service => {
      const belongsToCategory = service.category && watchedCategories.includes(service.category.name);
      if (!belongsToCategory) return false;
      
      if (!service.gender || service.gender === 'unisex') return true;
      
      return service.gender === watchedGender;
    });
  };

  const calculateTotalAmount = () => {
    const selectedServices = services.filter(service => 
      form.getValues('services').includes(service.name)
    );
    return selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  };

  // Initialize form with profile data when profile is available
  useEffect(() => {
    if (profile) {
      console.log('Hook: Initializing form with profile data:', profile);
      const defaultGender = (profile.gender as 'male' | 'female') || 'female';
      
      const initialValues = {
        full_name: profile.full_name || '',
        email_id: profile.email_id || '',
        phone_number: profile.phone_number || '',
        booking_date: new Date(),
        gender: defaultGender,
        categories: [],
        services: [],
      };
      
      console.log('Hook: Setting initial form values:', initialValues);
      form.reset(initialValues);
    }
  }, [profile, form]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (watchedCategories.length === 0) {
      const currentServices = form.getValues('services');
      if (currentServices.length > 0) {
        form.setValue('services', [], { shouldValidate: false });
      }
    } else {
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

  return {
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
  };
};
