
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { BookingFormData } from '@/hooks/useMultiStepBooking';
import type { Service } from '@/types/service';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const serviceCategories = [
  { title: 'Haircut & Styling', emoji: '✂️' },
  { title: 'Hair Coloring / Treatment', emoji: '🎨' },
  { title: 'Facial & Skincare', emoji: '💆‍♀️' },
  { title: 'Waxing', emoji: '🧖‍♀️' },
  { title: 'Manicure & Pedicure', emoji: '💅' },
  { title: 'Makeup Services', emoji: '💄' },
  { title: 'Massage & Relaxation', emoji: '🧘' },
];

interface ServiceStepProps {
  form: UseFormReturn<BookingFormData>;
  onPrev: () => void;
  loading: boolean;
  submitting: boolean;
  watchedCategories: string[];
  watchedGender: 'male' | 'female';
  getFilteredServices: () => Service[];
}

const ServiceStep: React.FC<ServiceStepProps> = ({ 
  form, 
  onPrev, 
  loading, 
  submitting, 
  watchedCategories, 
  watchedGender, 
  getFilteredServices 
}) => {
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const groupedServices = watchedCategories.map(category => ({
    category,
    services: getFilteredServices().filter(service => service.category?.name === category),
  }));

  return (
    <motion.div
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
        <Button type="button" variant="outline" onClick={onPrev}>
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
  );
};

export default ServiceStep;
