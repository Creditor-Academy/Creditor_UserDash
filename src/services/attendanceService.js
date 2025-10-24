import api from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://creditor.onrender.com';

/**
 * Mark attendance for a specific event
 * @param {string} eventId - The ID of the event
 * @returns {Promise<Object>} Response data from the API
 */
export async function markEventAttendance(eventId) {
  try {
    const response = await api.post(`/api/user/event/${eventId}/markattendance`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    
    // Handle specific error cases
    if (error.response?.status === 500 && error.response?.data?.message?.includes('Already marked')) {
      throw new Error('Attendance for this event has already been marked');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to mark attendance');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to mark attendance for this event');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Event not found');
    }
    
    // Generic error message
    throw new Error(error.response?.data?.message || 'Failed to mark attendance. Please try again.');
  }
}

/**
 * Check if user has already marked attendance for an event
 * @param {string} eventId - The ID of the event
 * @returns {Promise<Object>} Response data from the API
 */
// export async function checkEventAttendance(eventId) {
//   try {
//     const response = await api.get(`/api/user/event/${eventId}/attendance`);
//     return response.data;
//   } catch (error) {
//     console.error('Error checking attendance:', error);
    
//     if (error.response?.status === 404) {
//       return { marked: false };
//     }
    
//     throw new Error(error.response?.data?.message || 'Failed to check attendance status');
//   }
// }

/**
 * Fetch attendance list for a specific event (Instructor/Admin only)
 * @param {string} eventId - The ID of the event
 * @returns {Promise<Object>} Response data containing eventAttendaceList and TotalPresent
 */
export async function getEventAttendance(eventId) {
  try {
    const response = await api.get(`/api/instructor/events/${eventId}/attendance`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching event attendance:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Please log in to view attendance');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to view attendance for this event');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Event not found');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Event ID is required');
    }
    
    // Generic error message
    throw new Error(error.response?.data?.message || 'Failed to fetch attendance data. Please try again.');
  }
}

export default {
  markEventAttendance,
  checkEventAttendance,
  getEventAttendance
};
