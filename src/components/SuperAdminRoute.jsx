// In src/components/SuperAdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function SuperAdminRoute() {
  const { isAuthenticated, userRoles, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has superadmin role
  if (!isAuthenticated) {
    console.log('[SuperAdminRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('[SuperAdminRoute] User roles:', userRoles);

  if (!userRoles?.includes('super_admin')) {
    console.log(
      '[SuperAdminRoute] User does not have super_admin role, redirecting to dashboard'
    );
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[SuperAdminRoute] User is superadmin, allowing access');
  return <Outlet />;
}
