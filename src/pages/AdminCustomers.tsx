
import React, { useEffect, useState } from 'react';
import AdminOnly from '@/components/AdminOnly';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  Search, 
  User, 
  Calendar, 
  Copy,
  Phone,
  Mail
} from 'lucide-react';

interface Customer {
  id: string;
  full_name: string;
  email_id: string;
  phone_number: string | null;
  instagram_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

interface CustomerBooking {
  id: string;
  booking_date: string;
  services: string[];
  status: string;
  total_amount: number | null;
  created_at: string;
}

interface CustomerWithBookings extends Customer {
  bookings: CustomerBooking[];
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithBookings | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerBookings = async (customerId: string) => {
    try {
      setIsLoadingBookings(true);
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
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleCustomerClick = async (customer: Customer) => {
    const bookings = await fetchCustomerBookings(customer.id);
    setSelectedCustomer({
      ...customer,
      bookings,
    });
  };

  const copyCustomerData = () => {
    if (!selectedCustomer) return;

    const customerData = {
      user: {
        id: selectedCustomer.id,
        full_name: selectedCustomer.full_name,
        email_id: selectedCustomer.email_id,
        phone_number: selectedCustomer.phone_number,
        instagram_id: selectedCustomer.instagram_id,
        onboarding_completed: selectedCustomer.onboarding_completed,
        created_at: selectedCustomer.created_at,
      },
      bookings: selectedCustomer.bookings,
    };

    navigator.clipboard.writeText(JSON.stringify(customerData, null, 2));
    toast({
      title: 'Copied to Clipboard',
      description: 'Customer data has been copied as JSON.',
    });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number?.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchTerm]);

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
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-2">View and manage customer information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customers List */}
            <Card>
              <CardHeader>
                <CardTitle>All Customers</CardTitle>
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
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No customers found</p>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => handleCustomerClick(customer)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedCustomer?.id === customer.id ? 'bg-salon-purple/10 border-salon-purple' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <User className="h-8 w-8 text-gray-400" />
                              <div>
                                <h3 className="font-medium">{customer.full_name}</h3>
                                <p className="text-sm text-gray-600">{customer.email_id}</p>
                                {customer.phone_number && (
                                  <p className="text-sm text-gray-600">{customer.phone_number}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={customer.onboarding_completed ? "default" : "secondary"}>
                                {customer.onboarding_completed ? "Active" : "Pending"}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Joined {format(new Date(customer.created_at), 'MMM yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredCustomers.length} of {customers.length} customers
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Details</CardTitle>
                  {selectedCustomer && (
                    <Button
                      onClick={copyCustomerData}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {!selectedCustomer ? (
                  <div className="text-center py-8">
                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a customer to view details</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">{selectedCustomer.full_name}</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedCustomer.email_id}</span>
                        </div>
                        
                        {selectedCustomer.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{selectedCustomer.phone_number}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            Joined {format(new Date(selectedCustomer.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking History */}
                    <div>
                      <h4 className="font-medium mb-3">Booking History ({selectedCustomer.bookings.length})</h4>
                      
                      {isLoadingBookings ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-salon-purple"></div>
                        </div>
                      ) : selectedCustomer.bookings.length === 0 ? (
                        <p className="text-gray-500 text-sm">No bookings yet</p>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedCustomer.bookings.map((booking) => (
                            <div key={booking.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                                </span>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
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
                                <p className="text-sm font-semibold text-salon-purple">
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
