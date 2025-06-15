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
import { Search, Calendar, Filter, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  services: string[];
  status: string;
  total_amount: number | null;
  amount_paid: number | null;
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
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch bookings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    console.log('=== BOOKING STATUS UPDATE DEBUG ===');
    console.log('Booking ID:', bookingId);
    console.log('New Status:', newStatus);
    console.log('Current user session:', await supabase.auth.getSession());
    
    setUpdatingStatus(bookingId);
    
    try {
      // First, let's check the current booking data
      const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching current booking:', fetchError);
        throw new Error(`Failed to fetch booking: ${fetchError.message}`);
      }
      
      console.log('Current booking data:', currentBooking);
      
      // Now attempt the update
      const { data: updatedData, error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select('*');

      if (updateError) {
        console.error('Supabase update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw new Error(`Database error: ${updateError.message}`);
      }

      console.log('Update successful, returned data:', updatedData);

      if (!updatedData || updatedData.length === 0) {
        throw new Error('No data returned from update operation');
      }

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      setFilteredBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));

      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}.`,
      });
      
      console.log('Status update completed successfully');
    } catch (error: any) {
      console.error('=== STATUS UPDATE ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      toast({
        title: "Error",
        description: `Failed to update booking status: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateAmountPaid = async (bookingId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ amount_paid: amount })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, amount_paid: amount } : booking
      ));

      setEditingAmountId(null);
      setTempAmount('');

      toast({
        title: "Success",
        description: "Amount paid updated successfully.",
      });
    } catch (error) {
      console.error('Error updating amount paid:', error);
      toast({
        title: "Error",
        description: "Failed to update amount paid.",
        variant: "destructive",
      });
    }
  };

  const handleAmountEdit = (bookingId: string, currentAmount: number | null) => {
    setEditingAmountId(bookingId);
    setTempAmount(currentAmount?.toString() || '');
  };

  const handleAmountSave = (bookingId: string) => {
    const amount = parseFloat(tempAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    updateAmountPaid(bookingId, amount);
  };

  const handleAmountCancel = () => {
    setEditingAmountId(null);
    setTempAmount('');
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
                    <SelectItem value="accept">Accept</SelectItem>
                    <SelectItem value="cancel">Cancel</SelectItem>
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
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
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
                              <Select
                                value={booking.status || 'pending'}
                                onValueChange={(value) => updateBookingStatus(booking.id, value)}
                                disabled={updatingStatus === booking.id}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue>
                                    <Badge className={getStatusColor(booking.status || 'pending')}>
                                      {updatingStatus === booking.id ? 'Updating...' : getDisplayStatus(booking.status || 'pending')}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                                  <SelectItem value="pending">
                                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                  </SelectItem>
                                  <SelectItem value="accept">
                                    <Badge className="bg-green-100 text-green-800">Accept</Badge>
                                  </SelectItem>
                                  <SelectItem value="cancel">
                                    <Badge className="bg-red-100 text-red-800">Cancel</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {booking.total_amount ? `₹${booking.total_amount}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {editingAmountId === booking.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={tempAmount}
                                    onChange={(e) => setTempAmount(e.target.value)}
                                    className="w-20"
                                    min="0"
                                    step="0.01"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleAmountSave(booking.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAmountCancel}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  onClick={() => handleAmountEdit(booking.id, booking.amount_paid)}
                                  className="text-left p-0 h-auto font-normal"
                                >
                                  {booking.amount_paid ? `₹${booking.amount_paid}` : 'Set amount'}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => updateBookingStatus(booking.id, 'accept')}
                                      className="bg-green-600 hover:bg-green-700"
                                      disabled={updatingStatus === booking.id}
                                    >
                                      {updatingStatus === booking.id ? 'Updating...' : 'Accept'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateBookingStatus(booking.id, 'cancel')}
                                      disabled={updatingStatus === booking.id}
                                    >
                                      {updatingStatus === booking.id ? 'Updating...' : 'Cancel'}
                                    </Button>
                                  </>
                                )}
                              </div>
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
