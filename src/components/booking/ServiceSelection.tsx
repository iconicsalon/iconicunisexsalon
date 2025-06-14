
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
import { useServices } from '@/hooks/useServices';

interface ServiceSelectionProps {
  form: UseFormReturn<BookingFormData>;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ form }) => {
  const { services, categories, loading } = useServices();

  if (loading) {
    return <div className="text-center py-4">Loading services...</div>;
  }

  // Group services by category
  const groupedServices = categories.map(category => ({
    ...category,
    services: services.filter(service => service.category_id === category.id),
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
              <div key={category.id} className="space-y-3">
                <h4 className="text-md font-medium text-salon-purple flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.name}
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
                              {service.description && (
                                <p className="text-xs text-gray-400">
                                  {service.description}
                                </p>
                              )}
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
