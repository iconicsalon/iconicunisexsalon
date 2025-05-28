
import React, { useEffect, useState } from 'react';
import AdminOnly from '@/components/AdminOnly';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Calendar, Filter } from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  services: string[];
  status: string;
  total_amount: number | null;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      
      // First get bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Then get user profiles for each booking
      const bookingsWithProfiles: Booking[] = [];
      
      for (const booking of bookingsData || []) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone_number, email_id')
          .eq('id', booking.user_id)
          .single();

        bookingsWithProfiles.push({
          ...booking,
          customer_name: profile?.full_name || 'Unknown',
          customer_email: profile?.email_id || 'Unknown',
          customer_phone: profile?.phone_number || 'N/A'
        });
      }

      setBookings(bookingsWithProfiles);
      setFilteredBookings(bookingsWithProfiles);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone?.includes(searchTerm) ||
        booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Month filter
    if (monthFilter !== 'all') {
      filtered = filtered.filter(booking => {
        const bookingMonth = format(new Date(booking.booking_date), 'yyyy-MM');
        return bookingMonth === monthFilter;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, monthFilter]);

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

  // Get unique months from bookings
  const availableMonths = [...new Set(
    bookings.map(booking => format(new Date(booking.booking_date), 'yyyy-MM'))
  )].sort().reverse();

  return (
    <AdminOnly>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
            <p className="text-gray-600 mt-2">Manage and view all customer bookings</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bookings Management</CardTitle>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, email, or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {format(new Date(month), 'MMMM yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No bookings found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.customer_name}</div>
                                <div className="text-sm text-gray-500">{booking.customer_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {booking.customer_phone}
                            </TableCell>
                            <TableCell>
                              {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {booking.services.map((service, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status || 'pending')}>
                                {booking.status || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {booking.total_amount ? `₹${booking.total_amount}` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminOnly>
  );
};

export default AdminBookings;
