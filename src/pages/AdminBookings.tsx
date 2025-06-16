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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Calendar, Filter, Check, X, Eye, Download, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  exportBookingsToExcel, 
  generateFilteredFilename 
} from '@/utils/excelExport';

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
  const [isExporting, setIsExporting] = useState(false);
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
    
    setUpdatingStatus(bookingId);
    
    try {
      // Perform the database update with better error handling
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select('*')
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw new Error(`Failed to update booking: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      console.log('Database update successful:', data);

      // Update local state only after successful database update
      const updateBookingInState = (prevBookings: Booking[]) => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
            : booking
        );

      setBookings(updateBookingInState);
      setFilteredBookings(updateBookingInState);

      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}.`,
      });
      
      console.log('Status update completed successfully');
    } catch (error: any) {
      console.error('=== STATUS UPDATE ERROR ===');
      console.error('Error details:', error);
      
      toast({
        title: "Error",
        description: `Failed to update booking status: ${error.message}`,
        variant: "destructive",
      });

      // Refresh bookings to ensure UI reflects actual database state
      await fetchBookings();
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

  const getAvailableActions = (booking: Booking) => {
    const actions = [];
    
    if (booking.status === 'pending') {
      actions.push(
        { label: 'Accept', action: () => updateBookingStatus(booking.id, 'accept'), variant: 'default' },
        { label: 'Cancel', action: () => updateBookingStatus(booking.id, 'cancel'), variant: 'destructive' }
      );
    } else if (booking.status === 'accept') {
      actions.push(
        { label: 'Mark as Completed', action: () => updateBookingStatus(booking.id, 'completed'), variant: 'default' },
        { label: 'Cancel', action: () => updateBookingStatus(booking.id, 'cancel'), variant: 'destructive' }
      );
    }
    
    return actions;
  };

  const handleFilteredExport = async () => {
    try {
      setIsExporting(true);
      
      // Use current filtered bookings for export with proper type mapping
      const bookingsForExport = filteredBookings.map(booking => ({
        id: booking.id,
        customer_name: booking.customer_name || 'Unknown',
        customer_phone: booking.customer_phone || 'N/A',
        customer_email: booking.customer_email || 'N/A',
        booking_date: booking.booking_date,
        created_at: booking.created_at,
        services: booking.services,
        status: booking.status,
        total_amount: booking.total_amount,
        amount_paid: booking.amount_paid,
        time_slot: undefined, // Add if available in your booking interface
        category_list: undefined // Add if available in your booking interface
      }));

      // Calculate filtered stats
      let totalRevenue = 0;
      let totalAmountPaid = 0;
      bookingsForExport.forEach(booking => {
        if (booking.total_amount) totalRevenue += Number(booking.total_amount);
        if (booking.amount_paid) totalAmountPaid += Number(booking.amount_paid);
      });

      const exportStats = {
        totalBookings: bookingsForExport.length,
        totalRevenue,
        totalAmountPaid,
        completedBookings: bookingsForExport.filter(b => b.status === 'completed').length,
        pendingBookings: bookingsForExport.filter(b => b.status === 'pending').length,
        acceptedBookings: bookingsForExport.filter(b => b.status === 'accept').length,
        cancelledBookings: bookingsForExport.filter(b => b.status === 'cancel').length,
      };

      const filename = generateFilteredFilename();
      
      await exportBookingsToExcel(bookingsForExport, exportStats, filename, 'filtered');
      
      toast({
        title: "Export Successful",
        description: `Filtered bookings exported as ${filename}`,
      });
    } catch (error: any) {
      console.error('Error exporting filtered data:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export filtered data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
                <p className="text-gray-600 mt-2">Manage and view all customer bookings</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => fetchBookings()}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isLoading}
                  title="Refresh"
                >
                  {isLoading ? (
                    <span className="animate-spin">
                      <RefreshCcw className="h-4 w-4" />
                    </span>
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  onClick={handleFilteredExport}
                  disabled={isExporting || isLoading || filteredBookings.length === 0}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export to Excel'}
                </Button>
              </div>
            </div>
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
                          <TableCell colSpan={7} className="text-center py-8">
                            No bookings found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.customer_name}</div>
                                <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                              </div>
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
                                {getDisplayStatus(booking.status || 'pending')}
                              </Badge>
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
                                  {getAvailableActions(booking).length > 0 ? (
                                    getAvailableActions(booking).map((actionItem, index) => (
                                      <DropdownMenuItem
                                        key={index}
                                        onClick={actionItem.action}
                                        disabled={updatingStatus === booking.id}
                                        className={`cursor-pointer hover:bg-gray-50 px-3 py-2 ${
                                          actionItem.variant === 'destructive' ? 'text-red-600 hover:bg-red-50' : ''
                                        }`}
                                      >
                                        {updatingStatus === booking.id ? 'Updating...' : actionItem.label}
                                      </DropdownMenuItem>
                                    ))
                                  ) : (
                                    <DropdownMenuItem disabled className="px-3 py-2 text-gray-500">
                                      No actions available
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                {filteredBookings.length > 0 && (
                  <span className="ml-4 text-blue-600">
                    Click "Export to Excel" to download current view
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminOnly>
  );
};

export default AdminBookings;
