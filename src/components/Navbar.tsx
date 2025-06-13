
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Phone, User, Calendar, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';
import GoogleSignInButton from './GoogleSignInButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, profile, signInWithGoogle, signOut, isLoading } = useUserStore();
  const { toast } = useToast();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Offers', href: '/offers' },
    { name: 'Services', href: '/all-services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: 'Sign In Failed',
        description: 'There was an error signing in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double clicks
    
    try {
      setIsLoggingOut(true);
      console.log('Logout button clicked');
      
      await signOut();
      
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Logout error in navbar:', error);
      toast({
        title: 'Error',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get display name - prioritize profile full_name, fallback to user display_name or email
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Account';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold gradient-text">
              Iconic Unisex Salon
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-salon-purple transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+919876543210">Call Now</a>
            </Button>
            
            {!user ? (
              <GoogleSignInButton 
                onClick={handleGoogleLogin}
                disabled={isLoading}
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {getDisplayName()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings" className="flex items-center w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-profile" className="flex items-center w-full">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  {profile?.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="flex items-center w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? 'Signing out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="text-lg font-semibold gradient-text">
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    Iconic Unisex Salon
                  </Link>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-gray-700 hover:text-salon-purple transition-colors duration-200 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col space-y-3 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href="tel:+919876543210">Call Now</a>
                  </Button>
                  
                  {!user ? (
                    <GoogleSignInButton 
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full"
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 px-2 py-1">
                        Welcome, {getDisplayName()}
                      </div>
                      <Link to="/my-bookings" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          My Bookings
                        </Button>
                      </Link>
                      <Link to="/my-profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          <User className="h-4 w-4" />
                          My Profile
                        </Button>
                      </Link>
                      {profile?.is_admin && (
                        <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? 'Signing out...' : 'Logout'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
