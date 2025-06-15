import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import MultiStepBookingDialog from '@/components/MultiStepBookingDialog';
import BookingActionsDropdown from '@/components/BookingActionsDropdown';

const MyBookings = () => {
  const { user, profile, bookings, isLoading, fetchBookings } = useUserStore();
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
      return;
    }

    if (user && user.id) {
      setIsLoadingBookings(true);
      fetchBookings(user.id).finally(() => setIsLoadingBookings(false));
    }
  }, [user, isLoading, navigate, fetchBookings]);

  const handleBookingSuccess = () => {
    // Refetch bookings after a new booking is created
    if (user && user.id) {
      fetchBookings(user.id);
    }
  };

  const handleBookingUpdate = () => {
    // Refetch bookings after any booking update
    if (user && user.id) {
      fetchBookings(user.id);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accept':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancel':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'accept':
        return 'Accepted';
      case 'cancel':
        return 'Cancelled';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canManageBooking = (booking: any) => {
    // Allow management for pending bookings only
    // Once admin accepts or cancels, customer cannot modify
    return booking.status === 'pending';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold gradient-text">My Bookings</h1>
              <MultiStepBookingDialog 
                trigger={
                  <Button className="bg-gradient-salon hover:opacity-90 transition-opacity">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                }
                onBookingSuccess={handleBookingSuccess}
              />
            </div>

            {isLoadingBookings ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple"></div>
              </div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No appointments yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't booked any appointments yet. Start your beauty journey with us!
                  </p>
                  <MultiStepBookingDialog 
                    trigger={
                      <Button className="bg-gradient-salon hover:opacity-90 transition-opacity">
                        <Plus className="h-4 w-4 mr-2" />
                        Book Your First Appointment
                      </Button>
                    }
                    onBookingSuccess={handleBookingSuccess}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="h-5 w-5" />
                            {format(new Date(booking.booking_date), 'MMMM d, yyyy')}
                          </CardTitle>
                          {booking.time_slot && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {booking.time_slot}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            Booking ID: {booking.id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {getDisplayStatus(booking.status)}
                          </Badge>
                          {canManageBooking(booking) && (
                            <BookingActionsDropdown 
                              booking={booking} 
                              onBookingUpdate={handleBookingUpdate}
                            />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {booking.category_list && booking.category_list.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Categories:</h4>
                            <div className="flex flex-wrap gap-2">
                              {booking.category_list.map((category, index) => (
                                <Badge key={index} variant="outline" className="bg-salon-purple/10 text-salon-purple">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium mb-2">Services:</h4>
                          <div className="flex flex-wrap gap-2">
                            {booking.services.map((service, index) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {booking.total_amount && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Total Amount:</span>
                            <span className="text-salon-purple font-semibold">
                              ₹{booking.total_amount}
                            </span>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
                        </div>

                        {/* Status-specific messages */}
                        {booking.status === 'accept' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-800 text-sm font-medium">
                              ✅ Your booking has been accepted! We look forward to seeing you.
                            </p>
                          </div>
                        )}
                        
                        {(booking.status === 'cancel' || booking.status === 'cancelled') && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm font-medium">
                              ❌ This booking has been cancelled. Please contact us if you have any questions.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;
