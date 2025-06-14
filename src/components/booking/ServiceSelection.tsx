
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
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types/service';

interface ServiceSelectionProps {
  form: UseFormReturn<any>;
  services: Service[];
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ form, services }) => {
  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryName = service.category?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="services"
        render={() => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Select Services</FormLabel>
            <div className="space-y-4">
              {Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
                <div key={categoryName} className="border rounded-lg p-4">
                  <h3 className="font-medium text-salon-purple mb-3 flex items-center gap-2">
                    {categoryServices[0]?.category?.icon && (
                      <span>{categoryServices[0].category.icon}</span>
                    )}
                    {categoryName}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {categoryServices.map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="services"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={service.id}
                              className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-gray-50"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(service.name)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, service.name])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value: string) => value !== service.name
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <FormLabel className="font-medium cursor-pointer">
                                    {service.name}
                                  </FormLabel>
                                  <div className="flex items-center gap-2">
                                    {service.price && (
                                      <Badge variant="outline">₹{service.price}</Badge>
                                    )}
                                    {service.is_featured && (
                                      <Badge className="bg-salon-purple">Featured</Badge>
                                    )}
                                  </div>
                                </div>
                                {service.description && (
                                  <p className="text-sm text-gray-600">{service.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {service.duration_minutes && (
                                    <span>{service.duration_minutes} mins</span>
                                  )}
                                  {service.gender && (
                                    <Badge variant="secondary" className="text-xs">
                                      {service.gender}
                                    </Badge>
                                  )}
                                </div>
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
    </div>
  );
};

export default ServiceSelection;
