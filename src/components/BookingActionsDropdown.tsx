
import React, { useState } from 'react';
import { MoreVertical, X, Edit, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import RescheduleBookingDialog from '@/components/RescheduleBookingDialog';
import EditBookingDialog from '@/components/EditBookingDialog';
import type { Booking } from '@/stores/types';

interface BookingActionsDropdownProps {
  booking: Booking;
  onBookingUpdate: () => void;
}

const BookingActionsDropdown = ({ booking, onBookingUpdate }: BookingActionsDropdownProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCancelBooking = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });

      onBookingUpdate();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit = booking.status === 'pending';
  const canReschedule = booking.status === 'pending' || booking.status === 'confirmed';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
          {canEdit && (
            <DropdownMenuItem 
              onClick={() => setShowEditDialog(true)}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit Services
            </DropdownMenuItem>
          )}
          {canReschedule && (
            <DropdownMenuItem 
              onClick={() => setShowRescheduleDialog(true)}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
            >
              <Calendar className="h-4 w-4" />
              Reschedule
            </DropdownMenuItem>
          )}
          {canCancel && (
            <DropdownMenuItem 
              onClick={() => setShowCancelDialog(true)}
              className="flex items-center gap-2 cursor-pointer hover:bg-red-50 text-red-600"
            >
              <X className="h-4 w-4" />
              Cancel Booking
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBooking}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <RescheduleBookingDialog
        booking={booking}
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        onBookingUpdate={onBookingUpdate}
      />

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        booking={booking}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onBookingUpdate={onBookingUpdate}
      />
    </>
  );
};

export default BookingActionsDropdown;
