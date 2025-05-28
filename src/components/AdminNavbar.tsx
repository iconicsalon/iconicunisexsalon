
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut,
  ArrowLeft
} from 'lucide-react';

const AdminNavbar = () => {
  const { signOut, profile } = useUserStore();
  const { toast } = useToast();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-salon-purple transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Link>
            
            <div className="text-xl font-bold gradient-text">
              Admin Panel
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-salon-purple text-white'
                        : 'text-gray-700 hover:text-salon-purple hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {profile?.full_name}
            </span>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
