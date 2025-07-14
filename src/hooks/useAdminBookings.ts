
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Booking } from '@/stores/types';

interface BookingWithProfile extends Booking {
  profile?: {
    full_name: string;
    email_id: string;
    phone_number: string | null;
  };
}

export const useAdminBookings = () => {
  const [bookings, setBookings] = useState<BookingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profile:profiles(full_name, email_id, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByStatus = async (status: string) => {
    try {
      // This query will utilize the idx_bookings_user_status index
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profile:profiles(full_name, email_id, phone_number)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      return [];
    }
  };

  const fetchUserBookings = async (userId: string, status?: string) => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          profile:profiles(full_name, email_id, phone_number)
        `)
        .eq('user_id', userId);

      // This query will utilize the idx_bookings_user_status index when status is provided
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings after update
      await fetchBookings();
      
      toast({
        title: 'Success',
        description: `Booking ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    fetchBookings,
    fetchBookingsByStatus,
    fetchUserBookings,
    updateBookingStatus,
    refetch: fetchBookings,
  };
};
