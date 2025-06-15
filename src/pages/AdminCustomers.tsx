import React, { useEffect, useState } from 'react';
import AdminOnly from '@/components/AdminOnly';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Search, Copy, User, Calendar, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  full_name: string;
  email_id: string;
  phone_number: string | null;
  created_at: string;
  bookings?: Booking[];
}

interface Booking {
  id: string;
  booking_date: string;
  services: string[];
  status: string;
  total_amount: number | null;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      console.log('=== FETCHING CUSTOMERS DEBUG ===');
      console.log('Starting to fetch all customers from profiles table...');
      
      // First, let's check if we can connect to Supabase
      const { data: testConnection, error: connectionError } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact' });
        
      console.log('Connection test result:', { testConnection, connectionError });
      
      // Now fetch all customers
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('=== SUPABASE QUERY RESULTS ===');
      console.log('Raw data received:', data);
      console.log('Error (if any):', error);
      console.log('Count from query:', count);
      console.log('Data array length:', data?.length);
      
      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: 'Database Error',
          description: `Failed to fetch customers: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      const customerData = data || [];
      console.log('=== PROCESSING CUSTOMERS ===');
      console.log(`Total customers found: ${customerData.length}`);
      
      // Log each customer for debugging
      customerData.forEach((customer, index) => {
        console.log(`Customer ${index + 1}:`, {
          id: customer.id,
          name: customer.full_name,
          email: customer.email_id,
          phone: customer.phone_number,
          created: customer.created_at
        });
      });
      
      setCustomers(customerData);
      setFilteredCustomers(customerData);
      
      console.log('=== STATE UPDATE COMPLETE ===');
      console.log('customers state will be set to:', customerData.length, 'items');
      
    } catch (error) {
      console.error('=== UNEXPECTED ERROR ===');
      console.error('Error in fetchCustomers:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred while fetching customers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('=== FETCH COMPLETE ===');
    }
  };

  const fetchCustomerBookings = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', customerId)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      return [];
    }
  };

  const handleCustomerClick = async (customer: Customer) => {
    const bookings = await fetchCustomerBookings(customer.id);
    setSelectedCustomer({ ...customer, bookings });
  };

  const copyCustomerJSON = () => {
    if (selectedCustomer) {
      const customerData = {
        user: {
          id: selectedCustomer.id,
          full_name: selectedCustomer.full_name,
          email_id: selectedCustomer.email_id,
          phone_number: selectedCustomer.phone_number,
          created_at: selectedCustomer.created_at
        },
        bookings: selectedCustomer.bookings || []
      };
      
      navigator.clipboard.writeText(JSON.stringify(customerData, null, 2));
      toast({
        title: 'Copied!',
        description: 'Customer data copied to clipboard as JSON',
      });
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchCustomers();
  };

  useEffect(() => {
    console.log('Component mounted, calling fetchCustomers...');
    fetchCustomers();
  }, []);

  useEffect(() => {
    console.log('=== SEARCH FILTER DEBUG ===');
    console.log('Search term:', searchTerm);
    console.log('Total customers:', customers.length);
    
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number?.includes(searchTerm)
      );
      console.log('Filtered customers:', filtered.length);
      setFilteredCustomers(filtered);
    } else {
      console.log('No search term, showing all customers');
      setFilteredCustomers(customers);
    }
  }, [customers, searchTerm]);

  // Debug: Log current state
  console.log('=== CURRENT COMPONENT STATE ===');
  console.log('isLoading:', isLoading);
  console.log('customers array length:', customers.length);
  console.log('filteredCustomers array length:', filteredCustomers.length);
  console.log('searchTerm:', searchTerm);

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
    <AdminOnly>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600 mt-2">View customer information and booking history</p>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Debug info - remove this after fixing */}
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
            <h3 className="font-semibold text-yellow-800">DEBUG INFO:</h3>
            <p className="text-yellow-700">
              Loading: {isLoading ? 'Yes' : 'No'} | 
              Total Customers: {customers.length} | 
              Filtered: {filteredCustomers.length} |
              Search: "{searchTerm}"
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customers List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  All Customers
                  <span className="text-sm font-normal text-gray-500">
                    Total: {filteredCustomers.length}
                  </span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
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
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8">
                              {customers.length === 0 ? 'No customers found in database' : 'No matching customers'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <TableRow 
                              key={customer.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleCustomerClick(customer)}
                            >
                              <TableCell>
                                <div>
                                  <div className="font-medium">{customer.full_name}</div>
                                  <div className="text-sm text-gray-500">{customer.email_id}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {customer.phone_number || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {format(new Date(customer.created_at), 'MMM d, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Customer Details
                  {selectedCustomer && (
                    <Button 
                      onClick={copyCustomerJSON}
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {!selectedCustomer ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a customer to view details</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{selectedCustomer.full_name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Email:</span> {selectedCustomer.email_id}</p>
                        <p><span className="font-medium">Phone:</span> {selectedCustomer.phone_number || 'N/A'}</p>
                        <p><span className="font-medium">Joined:</span> {format(new Date(selectedCustomer.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>

                    {/* Booking History */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Booking History ({selectedCustomer.bookings?.length || 0})
                      </h4>
                      
                      {(!selectedCustomer.bookings || selectedCustomer.bookings.length === 0) ? (
                        <p className="text-gray-500 text-center py-4">No bookings found</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedCustomer.bookings.map((booking) => (
                            <div key={booking.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                                </span>
                                <Badge className={getStatusColor(booking.status || 'pending')}>
                                  {booking.status || 'pending'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {booking.services.map((service, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                              {booking.total_amount && (
                                <p className="text-sm font-medium text-salon-purple">
                                  ₹{booking.total_amount}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AdminOnly>
  );
};

export default AdminCustomers;
