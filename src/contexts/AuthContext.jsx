import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  getUserRole,
  getUserRoles,
  setUserRole as setUserRoleUtil,
  setUserRoles as setUserRolesUtil,
  clearUserData,
  isInstructorOrAdmin as checkInstructorOrAdmin,
  logoutUser,
} from '@/services/userService';
import {
  saveLoginTime,
  isAuthenticated,
  setAccessToken,
  clearAccessToken,
} from '@/services/tokenService';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRoleState] = useState('user');
  const [userRoles, setUserRolesState] = useState(['user']);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      setIsAuth(authStatus);

      if (authStatus) {
        const role = getUserRole();
        const roles = getUserRoles();
        setUserRoleState(role);
        setUserRolesState(roles);

        // Token refresh is now handled automatically by the tokenService
        console.log('User authenticated, token refresh system initialized');
      }

      setIsLoading(false);
    };

    checkAuth();

    return () => {
      // clearTokenRefresh(); // Removed this line as it's no longer needed
    };
  }, []);

  // Listen for role changes from UserContext
  useEffect(() => {
    const handleRoleChanged = () => {
      if (isAuthenticated()) {
        const role = getUserRole();
        const roles = getUserRoles();
        console.log(
          '[AuthContext] Role changed event received, updating role to:',
          role,
          'roles:',
          roles
        );
        setUserRoleState(role);
        setUserRolesState(roles);
      }
    };

    const handleUserLoggedIn = () => {
      // When user logs in, wait a bit for UserContext to fetch profile and set role
      setTimeout(() => {
        if (isAuthenticated()) {
          const role = getUserRole();
          const roles = getUserRoles();
          console.log(
            '[AuthContext] User logged in event received, updating role to:',
            role,
            'roles:',
            roles
          );
          setUserRoleState(role);
          setUserRolesState(roles);
        }
      }, 200);
    };

    window.addEventListener('userRoleChanged', handleRoleChanged);
    window.addEventListener('userLoggedIn', handleUserLoggedIn);

    return () => {
      window.removeEventListener('userRoleChanged', handleRoleChanged);
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, []);

  const setAuth = useCallback(token => {
    if (token) {
      setAccessToken(token); // This sets both 'authToken' and 'token' in localStorage
      saveLoginTime();
      setIsAuth(true);

      // Try to read role immediately if it's already set (e.g., from previous session)
      // UserContext will update it when profile is fetched and dispatch userRoleChanged event
      const role = getUserRole();
      const roles = getUserRoles();
      setUserRoleState(role);
      setUserRolesState(roles);
    } else {
      // clearTokenRefresh(); // Removed this line as it's no longer needed
      clearAccessToken(); // This removes both 'authToken' and 'token' from localStorage
      setIsAuth(false);
    }
  }, []);

  const login = useCallback(
    async credentials => {
      try {
        const response = await axios.post(
          `${API_BASE}/api/auth/login`,
          credentials,
          {
            withCredentials: true,
          }
        );

        if (response.data.accessToken) {
          setAuth(response.data.accessToken);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUserData();
      // clearTokenRefresh(); // Removed this line as it's no longer needed
      clearAccessToken(); // This removes both 'authToken' and 'token' from localStorage
      localStorage.removeItem('userId');
      Cookies.remove('Access-Token');
      Cookies.remove('userId');

      setUserRoleState('user');
      setUserRolesState(['user']);
      setIsAuth(false);

      window.dispatchEvent(new Event('userRoleChanged'));
      window.dispatchEvent(new CustomEvent('userLoggedOut'));

      window.location.href = '/login';
    }
  }, []);

  const value = {
    userRole,
    userRoles,
    isAuthenticated: isAuth,
    isLoading,
    login,
    logout,
    setAuth,
    isInstructorOrAdmin: checkInstructorOrAdmin,
    hasRole: role => userRoles.includes(role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
