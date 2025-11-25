import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchUserProfile,
  setUserRole,
  setUserRoles,
} from '@/services/userService';
import Cookies from 'js-cookie';
import { refreshAvatarFromBackend } from '@/lib/avatar-utils';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile on mount only if authenticated
  useEffect(() => {
    // Check if user is authenticated before making API calls
    const token =
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      Cookies.get('accesstoken');
    if (token) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      // Only fetch if authenticated and no existing profile
      const token =
        localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        Cookies.get('accesstoken');
      if (token && !userProfile) {
        loadUserProfile();
      }
    };

    const handleUserLoggedIn = () => {
      // Add small delay to ensure token is properly stored before making API calls
      setTimeout(() => {
        loadUserProfile();
      }, 100);
    };

    // Listen for custom events
    window.addEventListener('userRoleChanged', handleAuthChange);
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('userLoggedOut', () => {
      setUserProfile(null);
      setIsLoading(false);
    });

    return () => {
      window.removeEventListener('userRoleChanged', handleAuthChange);
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userLoggedOut', () => {
        setUserProfile(null);
        setIsLoading(false);
      });
    };
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated before making API calls
      const token =
        localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        Cookies.get('accesstoken');
      if (!token) {
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      // Try to fetch user profile
      const data = await fetchUserProfile();
      setUserProfile(data);

      // Set user role based on profile data
      if (Array.isArray(data.user_roles) && data.user_roles.length > 0) {
        const roles = data.user_roles.map(roleObj => roleObj.role);
        const priorityRoles = ['admin', 'instructor', 'user'];
        const highestRole =
          priorityRoles.find(role => roles.includes(role)) || 'user';

        console.log(
          'UserContext: Setting user role to:',
          highestRole,
          'from roles:',
          roles
        );
        setUserRole(highestRole);

        // Dispatch event to notify other components about role change
        window.dispatchEvent(new Event('userRoleChanged'));
      } else {
        // Default to user role if no roles found
        console.log('UserContext: No user_roles found, defaulting to user');
        setUserRole('user');
      }

      // Also load the user's avatar
      try {
        await refreshAvatarFromBackend();
      } catch (error) {
        console.warn('Failed to load avatar:', error);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setError(err.message);
      setUserProfile(null);

      // Check if this is an authentication error
      const status = err.response?.status;
      const isAuthError = status === 401 || status === 403;

      // Also check for 500 errors that might be auth-related
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        '';
      const is500AuthError =
        status === 500 &&
        (errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('auth') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('jwt'));

      if (isAuthError || is500AuthError) {
        console.warn(
          '[UserContext] Authentication error detected, clearing session and redirecting to login'
        );

        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        Cookies.remove('accesstoken');
        Cookies.remove('Access-Token');
        Cookies.remove('userId');

        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('userLoggedOut'));

        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = updatedProfile => {
    setUserProfile(updatedProfile);

    // Also update localStorage for consistency
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    // Dispatch a custom event to notify other components
    window.dispatchEvent(
      new CustomEvent('userProfileUpdated', {
        detail: updatedProfile,
      })
    );
  };

  const refreshUserProfile = async () => {
    await loadUserProfile();
  };

  const value = {
    userProfile,
    isLoading,
    error,
    updateUserProfile,
    refreshUserProfile,
    loadUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
