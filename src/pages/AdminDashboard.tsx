
import React, { useEffect, useState } from 'react';
import AdminOnly from '@/components/AdminOnly';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Filter,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalBookings: number;
  monthlyBookings: number;
  completedBookings: number;
  acceptedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalAmountPaid: number;
  monthlyAmountPaid: number;
}

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
  customer_phone?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    monthlyBookings: 0,
    completedBookings: 0,
    acceptedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalAmountPaid: 0,
    monthlyAmountPaid: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching dashboard data for month:', selectedMonth);
      
      // Get current month start and end
      const monthStart = startOfMonth(new Date(selectedMonth));
      const monthEnd = endOfMonth(new Date(selectedMonth));

      // Fetch all bookings with error handling
      const { data: allBookings, error: allError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Error fetching all bookings:', allError);
        throw allError;
      }

      console.log('All bookings fetched:', allBookings?.length || 0);

      // Fetch monthly bookings
      const { data: monthlyBookingsData, error: monthlyError } = await supabase
        .from('bookings')
        .select('*')
        .gte('booking_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('booking_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('booking_date', { ascending: false });

      if (monthlyError) {
        console.error('Error fetching monthly bookings:', monthlyError);
        throw monthlyError;
      }

      console.log('Monthly bookings fetched:', monthlyBookingsData?.length || 0);

      // Get profiles for recent bookings (limit to 10 most recent)
      const recentBookingsWithProfiles: Booking[] = [];
      const recentBookingsToProcess = (monthlyBookingsData || []).slice(0, 10);
      
      for (const booking of recentBookingsToProcess) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', booking.user_id)
          .single();

        // Don't throw error if profile not found, just use fallback
        recentBookingsWithProfiles.push({
          ...booking,
          customer_name: profile?.full_name || 'Unknown Customer',
          customer_phone: profile?.phone_number || 'N/A'
        });
      }

      // Calculate comprehensive stats
      let totalRevenue = 0;
      let monthlyRevenue = 0;
      let totalAmountPaid = 0;
      let monthlyAmountPaid = 0;
      let completedBookings = 0;
      let acceptedBookings = 0;
      let pendingBookings = 0;
      let cancelledBookings = 0;

      // Calculate stats from all bookings
      allBookings?.forEach(booking => {
        const status = booking.status?.toLowerCase() || 'pending';
        
        // Count bookings by status
        if (status === 'completed') {
          completedBookings++;
        } else if (status === 'accept' || status === 'accepted') {
          acceptedBookings++;
        } else if (status === 'pending') {
          pendingBookings++;
        } else if (status === 'cancel' || status === 'cancelled') {
          cancelledBookings++;
        }
        
        // Calculate total amounts
        if (booking.total_amount) {
          totalRevenue += Number(booking.total_amount);
        }
        if (booking.amount_paid) {
          totalAmountPaid += Number(booking.amount_paid);
        }
      });

      // Calculate monthly stats
      monthlyBookingsData?.forEach(booking => {
        if (booking.total_amount) {
          monthlyRevenue += Number(booking.total_amount);
        }
        if (booking.amount_paid) {
          monthlyAmountPaid += Number(booking.amount_paid);
        }
      });

      const newStats = {
        totalBookings: allBookings?.length || 0,
        monthlyBookings: monthlyBookingsData?.length || 0,
        completedBookings,
        acceptedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        monthlyRevenue,
        totalAmountPaid,
        monthlyAmountPaid,
      };

      console.log('Calculated stats:', newStats);
      setStats(newStats);
      setRecentBookings(recentBookingsWithProfiles);

      toast({
        title: "Dashboard Updated",
        description: "Dashboard data has been refreshed successfully.",
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: `Failed to fetch dashboard data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'accept':
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancel':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    switch (normalizedStatus) {
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

  return (
    <AdminOnly>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of your salon's performance</p>
              </div>
              <Button onClick={fetchDashboardData} disabled={isLoading} variant="outline">
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = format(date, 'yyyy-MM');
                  const label = format(date, 'MMMM yyyy');
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthlyBookings}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted Bookings</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.acceptedBookings}</div>
                <p className="text-xs text-muted-foreground">Approved bookings</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedBookings}</div>
                <p className="text-xs text-muted-foreground">Finished services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled Bookings</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</div>
                <p className="text-xs text-muted-foreground">Cancelled services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (Expected)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total booking amounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{stats.totalAmountPaid.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Actually received</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue (Expected)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedMonth), 'MMMM yyyy')} - Total booking amounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Amount Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{stats.monthlyAmountPaid.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedMonth), 'MMMM yyyy')} - Actually received
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings - {format(new Date(selectedMonth), 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple"></div>
                </div>
              ) : recentBookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No bookings found for this month</p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{booking.customer_name}</h3>
                          <Badge className={getStatusColor(booking.status || 'pending')}>
                            {getDisplayStatus(booking.status || 'pending')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {booking.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          {booking.total_amount && (
                            <p className="text-sm text-gray-600">
                              Expected: ₹{booking.total_amount}
                            </p>
                          )}
                          {booking.amount_paid ? (
                            <p className="font-semibold text-green-600">
                              Paid: ₹{booking.amount_paid}
                            </p>
                          ) : (
                            <p className="font-semibold text-red-600">
                              Paid: ₹0
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {booking.customer_phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminOnly>
  );
};

export default AdminDashboard;
