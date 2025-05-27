
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone_number: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  instagram_id: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateProfile } = useUserStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      phone_number: '',
      instagram_id: '',
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        full_name: data.full_name,
        phone_number: data.phone_number,
        instagram_id: data.instagram_id || null,
        onboarding_completed: true,
      });

      toast({
        title: 'Welcome to Iconic Unisex Salon!',
        description: 'Your profile has been set up successfully.',
      });

      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-salon flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold gradient-text">
            Welcome to Iconic Unisex Salon!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Let's complete your profile to get started
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 10-digit phone number" 
                        maxLength={10}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@your_instagram" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-salon hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
