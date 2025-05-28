
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

interface AdminOnlyProps {
  children: React.ReactNode;
}

const AdminOnly: React.FC<AdminOnlyProps> = ({ children }) => {
  const { user, profile, isLoading } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !profile?.is_admin)) {
      navigate('/');
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-purple"></div>
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminOnly;
