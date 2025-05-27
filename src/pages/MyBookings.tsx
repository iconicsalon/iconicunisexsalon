
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { format } from 'date-fns';
import BookAppointmentDialog from '@/components/BookAppointmentDialog';

const MyBookings = () => {
  const { user, profile, bookings, isLoading, fetchBookings } = useUserStore();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold gradient-text">My Bookings</h1>
              <Button 
                onClick={() => setBookingDialogOpen(true)}
                className="bg-gradient-salon hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
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
                  <Button 
                    onClick={() => setBookingDialogOpen(true)}
                    className="bg-gradient-salon hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="h-5 w-5" />
                            {format(new Date(booking.booking_date), 'MMMM d, yyyy')}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Booking ID: {booking.id.slice(0, 8)}...
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
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
      
      <BookAppointmentDialog 
        open={bookingDialogOpen} 
        onOpenChange={setBookingDialogOpen} 
      />
    </div>
  );
};

export default MyBookings;
