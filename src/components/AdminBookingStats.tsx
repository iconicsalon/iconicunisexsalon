
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp
} from 'lucide-react';

const AdminBookingStats = () => {
  const { fetchBookingsByStatus } = useAdminBookings();
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    cancelled: 0,
    completed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [pendingBookings, acceptedBookings, cancelledBookings, completedBookings] = await Promise.all([
          fetchBookingsByStatus('pending'),
          fetchBookingsByStatus('accepted'),
          fetchBookingsByStatus('cancelled'),
          fetchBookingsByStatus('completed')
        ]);

        const newStats = {
          pending: pendingBookings.length,
          accepted: acceptedBookings.length,
          cancelled: cancelledBookings.length,
          completed: completedBookings.length,
          total: pendingBookings.length + acceptedBookings.length + cancelledBookings.length + completedBookings.length
        };

        setStats(newStats);
      } catch (error) {
        console.error('Error loading booking stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [fetchBookingsByStatus]);

  if (loading) {
    return <div className="text-center py-4">Loading stats...</div>;
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Accepted',
      value: stats.accepted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                <Badge variant="secondary" className="text-xs">
                  {stats.total > 0 ? Math.round((stat.value / stats.total) * 100) : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminBookingStats;
