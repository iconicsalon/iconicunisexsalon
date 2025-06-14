
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
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  monthlyBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
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
    pendingBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get current month start and end
      const monthStart = startOfMonth(new Date(selectedMonth));
      const monthEnd = endOfMonth(new Date(selectedMonth));

      // Fetch all bookings
      const { data: allBookings, error: allError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) throw allError;

      // Fetch monthly bookings
      const { data: monthlyBookingsData, error: monthlyError } = await supabase
        .from('bookings')
        .select('*')
        .gte('booking_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('booking_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('booking_date', { ascending: false });

      if (monthlyError) throw monthlyError;

      // Get profiles for recent bookings
      const recentBookingsWithProfiles: Booking[] = [];
      
      for (const booking of (monthlyBookingsData || []).slice(0, 10)) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', booking.user_id)
          .single();

        recentBookingsWithProfiles.push({
          ...booking,
          customer_name: profile?.full_name || 'Unknown',
          customer_phone: profile?.phone_number || 'N/A'
        });
      }

      // Calculate stats
      let totalRevenue = 0;
      let monthlyRevenue = 0;
      let completedBookings = 0;
      let pendingBookings = 0;

      allBookings?.forEach(booking => {
        // Calculate total revenue from completed bookings
        if (booking.status === 'done' && booking.amount_paid) {
          totalRevenue += Number(booking.amount_paid);
        }
        
        // Count completed and pending bookings
        if (booking.status === 'done') {
          completedBookings++;
        } else if (booking.status === 'pending') {
          pendingBookings++;
        }
      });

      // Calculate monthly revenue from completed bookings
      monthlyBookingsData?.forEach(booking => {
        if (booking.status === 'done' && booking.amount_paid) {
          monthlyRevenue += Number(booking.amount_paid);
        }
      });

      setStats({
        totalBookings: allBookings?.length || 0,
        monthlyBookings: monthlyBookingsData?.length || 0,
        completedBookings,
        pendingBookings,
        totalRevenue,
        monthlyRevenue,
      });

      setRecentBookings(recentBookingsWithProfiles);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your salon's performance</p>
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

          {/* Stats Cards */}
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
                <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedBookings}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From completed bookings</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Revenue Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedMonth), 'MMMM yyyy')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                <p className="text-xs text-muted-foreground">Awaiting completion</p>
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
                            {booking.status || 'pending'}
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
                              Total: ₹{booking.total_amount}
                            </p>
                          )}
                          {booking.amount_paid && (
                            <p className="font-semibold text-salon-purple">
                              Paid: ₹{booking.amount_paid}
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
