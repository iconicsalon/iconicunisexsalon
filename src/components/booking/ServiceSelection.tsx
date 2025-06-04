
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { BookingFormData } from '@/hooks/useBookingForm';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number | null;
  duration_minutes: number | null;
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

interface ServiceSelectionProps {
  form: UseFormReturn<BookingFormData>;
  services: Service[];
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ form, services }) => {
  const groupedServices = serviceCategories.map(category => ({
    ...category,
    services: services.filter(service => service.category === category.title),
  }));

  return (
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
  );
};

export default ServiceSelection;
