
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Booking } from '@/stores/types';
import type { Service } from '@/types/service';

const editBookingSchema = z.object({
  services: z.array(z.string()).min(1, 'Please select at least one service'),
});

type EditBookingFormData = z.infer<typeof editBookingSchema>;

interface EditBookingDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdate: () => void;
}

const EditBookingDialog = ({ 
  booking, 
  open, 
  onOpenChange, 
  onBookingUpdate 
}: EditBookingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const { toast } = useToast();

  const form = useForm<EditBookingFormData>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      services: booking.services || [],
    },
  });

  const watchedServices = form.watch('services');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (open) {
      form.reset({
        services: booking.services || [],
      });
    }
  }, [open, booking, form]);

  // Update selected services when form services change
  useEffect(() => {
    const selected = services.filter(service => 
      watchedServices.includes(service.name)
    );
    setSelectedServices(selected);
  }, [watchedServices, services]);

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

      if (error) throw error;
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

  const onSubmit = async (data: EditBookingFormData) => {
    setLoading(true);
    try {
      // Calculate new total amount
      const newSelectedServices = services.filter(service => 
        data.services.includes(service.name)
      );
      const totalAmount = newSelectedServices.reduce((sum, service) => 
        sum + (service.price || 0), 0
      );

      // Get categories from selected services
      const categoryList = [...new Set(
        newSelectedServices
          .map(service => service.category?.name)
          .filter(Boolean)
      )];

      const { error } = await supabase
        .from('bookings')
        .update({
          services: data.services,
          category_list: categoryList,
          total_amount: totalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "✅ Booking Updated!",
        description: "Your booking services have been successfully updated.",
      });

      onBookingUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedServices.reduce((sum, service) => 
    sum + (service.price || 0), 0
  );

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking Services</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <FormLabel>Select Services</FormLabel>
                  <div className="space-y-4">
                    {Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
                      <div key={categoryName} className="space-y-2">
                        <h4 className="font-medium text-sm text-salon-purple">
                          {categoryName}
                        </h4>
                        <div className="grid grid-cols-1 gap-2 pl-4">
                          {categoryServices.map((service) => (
                            <FormField
                              key={service.id}
                              control={form.control}
                              name="services"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                                  <div className="flex-1 min-w-0">
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div>{service.name}</div>
                                          {service.description && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              {service.description}
                                            </div>
                                          )}
                                        </div>
                                        {service.price && (
                                          <div className="text-sm font-medium text-salon-purple ml-2">
                                            ₹{service.price}
                                          </div>
                                        )}
                                      </div>
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
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

            {selectedServices.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Selected Services Summary</h4>
                <div className="space-y-1 text-sm">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>₹{service.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                  <span>Total Amount:</span>
                  <span className="text-salon-purple">₹{totalAmount}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-salon hover:opacity-90"
              >
                {loading ? 'Updating...' : 'Update Booking'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;
