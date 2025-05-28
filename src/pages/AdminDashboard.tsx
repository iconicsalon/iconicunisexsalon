
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
  Filter
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  monthlyBookings: number;
  menBookings: number;
  womenBookings: number;
  totalRevenue: number;
}

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  services: string[];
  status: string;
  total_amount: number | null;
  created_at: string;
  profiles: {
    full_name: string;
    phone_number: string | null;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    monthlyBookings: 0,
    menBookings: 0,
    womenBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);

  const categorizeService = (service: string): 'men' | 'women' | 'unisex' => {
    const menKeywords = ['beard', 'haircut', 'shave', 'mustache'];
    const womenKeywords = ['facial', 'waxing', 'eyebrow', 'manicure', 'pedicure', 'hair spa'];
    
    const serviceLower = service.toLowerCase();
    
    if (menKeywords.some(keyword => serviceLower.includes(keyword))) {
      return 'men';
    }
    if (womenKeywords.some(keyword => serviceLower.includes(keyword))) {
      return 'women';
    }
    return 'unisex';
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get current month start and end
      const monthStart = startOfMonth(new Date(selectedMonth));
      const monthEnd = endOfMonth(new Date(selectedMonth));

      // Fetch all bookings with profiles
      const { data: allBookings, error: allError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!inner(full_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (allError) throw allError;

      // Fetch monthly bookings
      const { data: monthlyBookings, error: monthlyError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!inner(full_name, phone_number)
        `)
        .gte('booking_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('booking_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('booking_date', { ascending: false });

      if (monthlyError) throw monthlyError;

      // Calculate stats
      let menCount = 0;
      let womenCount = 0;
      let totalRevenue = 0;

      allBookings?.forEach(booking => {
        // Calculate revenue
        if (booking.total_amount) {
          totalRevenue += Number(booking.total_amount);
        }

        // Categorize by service
        const hasWomenService = booking.services.some(service => 
          categorizeService(service) === 'women'
        );
        const hasMenService = booking.services.some(service => 
          categorizeService(service) === 'men'
        );

        if (hasWomenService) womenCount++;
        if (hasMenService) menCount++;
      });

      setStats({
        totalBookings: allBookings?.length || 0,
        monthlyBookings: monthlyBookings?.length || 0,
        menBookings: menCount,
        womenBookings: womenCount,
        totalRevenue,
      });

      setRecentBookings(monthlyBookings?.slice(0, 10) || []);
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
                <CardTitle className="text-sm font-medium">Men's Services</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.menBookings}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Women's Services</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.womenBookings}</div>
                <p className="text-xs text-muted-foreground">All time</p>
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
                          <h3 className="font-medium">{booking.profiles.full_name}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
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
                        {booking.total_amount && (
                          <p className="font-semibold text-salon-purple">
                            ₹{booking.total_amount}
                          </p>
                        )}
                        {booking.profiles.phone_number && (
                          <p className="text-sm text-gray-600">
                            {booking.profiles.phone_number}
                          </p>
                        )}
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
