
import React, { useState, useEffect } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Reset dropdown state when booking changes
  useEffect(() => {
    setDropdownOpen(false);
  }, [booking.id, booking.updated_at]);

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

      setShowCancelDialog(false);
      setDropdownOpen(false);
      onBookingUpdate();
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

  const handleBookingUpdate = () => {
    // Reset all dialog states
    setShowEditDialog(false);
    setShowRescheduleDialog(false);
    setDropdownOpen(false);
    // Trigger the parent update
    onBookingUpdate();
  };

  const canEdit = booking.status === 'pending';
  const canReschedule = booking.status === 'pending' || booking.status === 'confirmed';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-300">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
          {canEdit && (
            <DropdownMenuItem 
              onClick={() => {
                setShowEditDialog(true);
                setDropdownOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2"
            >
              <Edit className="h-4 w-4" />
              Edit Services
            </DropdownMenuItem>
          )}
          {canReschedule && (
            <DropdownMenuItem 
              onClick={() => {
                setShowRescheduleDialog(true);
                setDropdownOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2"
            >
              <Calendar className="h-4 w-4" />
              Reschedule
            </DropdownMenuItem>
          )}
          {canCancel && (
            <DropdownMenuItem 
              onClick={() => {
                setShowCancelDialog(true);
                setDropdownOpen(false);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-red-50 text-red-600 px-3 py-2"
            >
              <X className="h-4 w-4" />
              Cancel Booking
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-white">
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
        onBookingUpdate={handleBookingUpdate}
      />

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        booking={booking}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onBookingUpdate={handleBookingUpdate}
      />
    </>
  );
};

export default BookingActionsDropdown;
