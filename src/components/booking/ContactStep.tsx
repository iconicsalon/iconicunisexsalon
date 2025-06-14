
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { BookingFormData } from '@/hooks/useMultiStepBooking';
import { useUserStore } from '@/stores/userStore';
import {
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface ContactStepProps {
  form: UseFormReturn<BookingFormData>;
  onNext: () => void;
}

const ContactStep: React.FC<ContactStepProps> = ({ form, onNext }) => {
  const { profile } = useUserStore();
  
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  // Initialize form with profile data when component mounts
  useEffect(() => {
    if (profile) {
      console.log('ContactStep: Initializing form with profile data:', profile);
      
      // Set form values if they're not already set
      if (!form.getValues('full_name') && profile.full_name) {
        form.setValue('full_name', profile.full_name);
      }
      if (!form.getValues('email_id') && profile.email_id) {
        form.setValue('email_id', profile.email_id);
      }
      if (!form.getValues('phone_number') && profile.phone_number) {
        form.setValue('phone_number', profile.phone_number);
      }
      if (!form.getValues('gender') && profile.gender) {
        form.setValue('gender', profile.gender as 'male' | 'female');
      }
      if (!form.getValues('booking_date')) {
        form.setValue('booking_date', new Date());
      }
    }
  }, [profile, form]);

  const handleNext = async () => {
    console.log('ContactStep handleNext called');
    console.log('Current form values:', form.getValues());
    
    const formData = form.getValues();
    console.log('Form data before validation:', formData);
    
    // Trigger validation for step 1 fields
    const isValid = await form.trigger(['full_name', 'email_id', 'booking_date', 'gender']);
    console.log('Step 1 validation result:', isValid);
    console.log('Form errors:', form.formState.errors);
    
    if (isValid) {
      console.log('Validation passed, calling onNext');
      onNext();
    } else {
      console.log('Validation failed, not proceeding');
      console.log('Individual field states:');
      console.log('full_name:', formData.full_name);
      console.log('email_id:', formData.email_id);
      console.log('booking_date:', formData.booking_date);
      console.log('gender:', formData.gender);
    }
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
                    value={field.value || profile?.full_name || ''}
                    readOnly
                    className="bg-gray-100 border border-gray-300 text-gray-700 h-12 px-4 rounded-lg cursor-not-allowed" 
                    placeholder="Your Name"
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
                    value={field.value || profile?.email_id || ''}
                    readOnly
                    type="email" 
                    className="bg-gray-100 border border-gray-300 text-gray-700 h-12 px-4 rounded-lg cursor-not-allowed" 
                    placeholder="your.email@example.com"
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
                    value={field.value || profile?.phone_number || ''}
                    readOnly
                    className="bg-gray-100 border border-gray-300 text-gray-700 h-12 px-4 rounded-lg cursor-not-allowed" 
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
                    onClick={() => {
                      console.log('Male button clicked, setting gender to male');
                      field.onChange('male');
                      form.clearErrors('gender');
                    }}
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
                    onClick={() => {
                      console.log('Female button clicked, setting gender to female');
                      field.onChange('female');
                      form.clearErrors('gender');
                    }}
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
                    onSelect={(date) => {
                      console.log('Date selected:', date);
                      field.onChange(date);
                      form.clearErrors('booking_date');
                    }}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="pt-4">
        <Button 
          type="button" 
          onClick={handleNext}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12 rounded-lg font-medium"
        >
          Next
        </Button>
      </div>
    </motion.div>
  );
};

export default ContactStep;
