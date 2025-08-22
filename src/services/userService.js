// Service for user profile API calls

// Utility function to get user role (for backward compatibility)
export function getUserRole() {
  return localStorage.getItem('userRole') || 'user';
}

// Utility function to get all user roles
export function getUserRoles() {
  const roles = localStorage.getItem('userRoles');
  return roles ? JSON.parse(roles) : ['user'];
}

// Utility function to set user role (for backward compatibility)
export function setUserRole(role) {
  // Enforce single role - replace all roles with this one
  localStorage.setItem('userRole', role);
  localStorage.setItem('userRoles', JSON.stringify([role]));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('userRoleChanged'));
}

// Utility function to set all user roles (enforces single role)
export function setUserRoles(roles) {
  if (Array.isArray(roles) && roles.length > 0) {
    // Enforce single role - take only the first role
    const singleRole = roles[0];
    localStorage.setItem('userRoles', JSON.stringify([singleRole]));
    localStorage.setItem('userRole', singleRole);
  } else {
    localStorage.setItem('userRoles', JSON.stringify(['user']));
    localStorage.setItem('userRole', 'user');
  }
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('userRoleChanged'));
}

// Utility function to check if user is instructor or admin
export function isInstructorOrAdmin() {
  const roles = getUserRoles();
  return roles.some(role => role === 'instructor' || role === 'admin');
}

// Utility function to check if user has a specific role
export function hasRole(roleToCheck) {
  const roles = getUserRoles();
  return roles.includes(roleToCheck);
}

// Utility function to set a single role and replace all existing roles
export function setSingleRole(role) {
  if (!role) {
    console.warn('setSingleRole: No role provided, defaulting to user');
    role = 'user';
  }
  
  // Validate role
  const validRoles = ['user', 'instructor', 'admin'];
  if (!validRoles.includes(role)) {
    console.warn(`setSingleRole: Invalid role "${role}", defaulting to user`);
    role = 'user';
  }
  
  // Set single role - replace all existing roles
  localStorage.setItem('userRole', role);
  localStorage.setItem('userRoles', JSON.stringify([role]));
  
  console.log(`setSingleRole: User role set to "${role}" (replaced all existing roles)`);
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('userRoleChanged'));
}

// Utility function to clear user data on logout
export function clearUserData() {
  localStorage.removeItem('userRole');
  localStorage.removeItem('userRoles');
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('userRoleChanged'));
}

import { getAuthHeader } from './authHeader';
import api from './apiClient';

export async function fetchUserProfile() {
  try {
    const response = await api.get('/api/user/getUserProfile', {
      withCredentials: true,
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  try {
    console.log("📤 userService: Updating profile to:", `/api/user/updateUserProfile`);
    console.log("📤 userService: Update data:", profileData);
    
    const response = await api.put('/api/user/updateUserProfile', profileData);
    
    console.log("✅ userService: Update profile success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ userService: Update profile error:", error);
    throw error;
  }
}

export async function fetchAllCourses() {
  try {
    console.log("🔍 userService: Fetching all courses from:", `/api/course/getCourses`);
    const response = await api.get('/api/course/getCourses');
    console.log("✅ userService: Fetch courses success:", response.data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("❌ userService: Fetch courses error:", error);
    throw error;
  }
}

// Fetch courses for a specific user by their userId
export async function fetchUserCoursesByUserId(userId) {
  try {
    if (!userId) {
      throw new Error('fetchUserCoursesByUserId: userId is required');
    }

    const base = `${import.meta.env.VITE_API_BASE_URL}`;
    const url = `${base}/api/course/getUserCoursesByUserId`;

    console.log("🔍 userService: Fetching courses for user (POST with body { userId }):", { url, userId });

    const response = await api.post('/api/course/getUserCoursesByUserId', { userId });

    console.log("✅ userService: Fetch user courses success:", response.data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("❌ userService: Fetch user courses error:", error);
    throw error;
  }
}

export async function updateProfilePicture(formData) {
  try {
    const response = await api.post('/api/user/updateProfilePictureS3', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    console.error("❌ userService: Update profile picture error:", error);
    throw error;
  }
}

export async function fetchDetailedUserProfile(userId) {
  try {
    const response = await api.post('/api/instructor/getUserAllData', { userId });

    const data = response.data;
    if (data.success && data.code === 200) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch user profile');
    }
  } catch (error) {
    console.error('Error fetching detailed user profile:', error);
    throw error;
  }
}


export async function logoutUser() {
  try {
    const response = await fetch('https://creditor-backend-1-iijy.onrender.com/api/auth/logout', {
      method: 'GET',
      credentials: 'include', // Important for sending cookies
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to logout');
    }

    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the API call fails, we should still clear local data
    return false;
  }
}