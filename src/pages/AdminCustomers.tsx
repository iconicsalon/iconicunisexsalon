
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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

const CUSTOMERS_PER_PAGE = 20;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  const fetchCustomers = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Add search filter if provided
      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email_id.ilike.%${search}%,phone_number.ilike.%${search}%`);
      }

      // Add pagination
      const from = (page - 1) * CUSTOMERS_PER_PAGE;
      const to = from + CUSTOMERS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: 'Database Error',
          description: `Failed to fetch customers: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      const customerData = data || [];
      setCustomers(customerData);
      setFilteredCustomers(customerData);
      setTotalCustomers(count || 0);
      setTotalPages(Math.ceil((count || 0) / CUSTOMERS_PER_PAGE));
      
      toast({
        title: 'Success',
        description: `Loaded ${customerData.length} customers (${count} total)`,
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred while fetching customers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
    fetchCustomers(currentPage, searchTerm);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    fetchCustomers(1, value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCustomers(page, searchTerm);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customers List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  All Customers
                  <span className="text-sm font-normal text-gray-500">
                    Total: {totalCustomers}
                  </span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
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
                  <>
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
                                {totalCustomers === 0 ? 'No customers found in database' : 'No matching customers'}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6">
                        <Pagination>
                          <PaginationContent>
                            {currentPage > 1 && (
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => handlePageChange(currentPage - 1)}
                                  className="cursor-pointer"
                                />
                              </PaginationItem>
                            )}
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(pageNum)}
                                    isActive={currentPage === pageNum}
                                    className="cursor-pointer"
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            
                            {currentPage < totalPages && (
                              <PaginationItem>
                                <PaginationNext 
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  className="cursor-pointer"
                                />
                              </PaginationItem>
                            )}
                          </PaginationContent>
                        </Pagination>
                        
                        <div className="text-center mt-4 text-sm text-gray-600">
                          Showing {((currentPage - 1) * CUSTOMERS_PER_PAGE) + 1} to {Math.min(currentPage * CUSTOMERS_PER_PAGE, totalCustomers)} of {totalCustomers} customers
                        </div>
                      </div>
                    )}
                  </>
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
