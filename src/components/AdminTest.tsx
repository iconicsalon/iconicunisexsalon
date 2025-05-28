
import React from 'react';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Shield } from 'lucide-react';

const AdminTest = () => {
  const { user, profile, isLoading } = useUserStore();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Status Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User Logged In
          </span>
          {user ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Yes
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              No
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Profile Loaded</span>
          {profile ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Yes
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              No
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Admin Access</span>
          {profile?.is_admin ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800">
              <XCircle className="h-3 w-3 mr-1" />
              User
            </Badge>
          )}
        </div>

        {user && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {profile?.full_name || user.user_metadata?.full_name || 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Role:</strong> {profile?.is_admin ? 'Admin' : 'User'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTest;
