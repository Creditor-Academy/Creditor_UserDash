import axios from 'axios';
import { getAuthHeader } from './authHeader';
// import { getAuthHeader } from './authHeader';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

// Helper function to join URL parts
const joinUrl = (base, path) => {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

// Fetch all tickets for admin/instructor
export const getAllTickets = async () => {
  return axios.get(
    joinUrl(baseUrl, 'api/support-tickets/'),
    {
      headers: {
        ...getAuthHeader(),
      },
      withCredentials: true
    }
  );
};

// Add a new support ticket
export const createSupportTicket = async (ticketData) => {
  const endpoints = [
    'api/support-tickets/create',
    'api/support-tickets',
    'api/tickets/create',
    'api/tickets'
  ];
  
  for (const endpointPath of endpoints) {
    try {
      const endpoint = joinUrl(baseUrl, endpointPath);
      console.log(`Trying endpoint: ${endpoint}`);
      console.log('Base URL:', baseUrl);
      console.log('Ticket data type:', ticketData instanceof FormData ? 'FormData' : typeof ticketData);
      
      // Try with FormData first
      const response = await axios.post(
        endpoint,
        ticketData,
        {
          headers: {
            ...getAuthHeader(),
          },
          withCredentials: true
        }
      );
      console.log(`Success with endpoint: ${endpoint}`);
      return response;
    } catch (error) {
      console.error(`Failed with endpoint ${endpoint}:`, error);
      console.error(`Error response for ${endpoint}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (endpointPath === endpoints[endpoints.length - 1]) {
        // This is the last endpoint, so try the fallback approach
        break;
      }
      // Continue to next endpoint
      continue;
    }
  }
  
  // If all endpoints fail, try the fallback approach
  if (ticketData instanceof FormData) {
    try {
      const jsonData = {};
      for (let [key, value] of ticketData.entries()) {
        if (key === 'attachments' && value instanceof File) {
          // Skip file attachments for JSON fallback
          continue;
        }
        jsonData[key] = value;
      }
      
      // Try different field name variations that the backend might expect
      const alternativeData = {
        ...jsonData,
        // Alternative field names
        ticket_category: jsonData.category,
        ticket_priority: jsonData.priority,
        ticket_subject: jsonData.subject,
        ticket_description: jsonData.description,
        // Also try without 'ticket_' prefix
        category: jsonData.category,
        priority: jsonData.priority,
        subject: jsonData.subject,
        description: jsonData.description
      };
      
      console.log('Trying JSON fallback with data:', alternativeData);
      
      const fallbackResponse = await axios.post(
        joinUrl(baseUrl, 'api/support-tickets/create'),
        alternativeData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          withCredentials: true
        }
      );
      return fallbackResponse;
    } catch (fallbackError) {
      console.error('JSON fallback also failed:', fallbackError);
      console.error('Fallback error response:', {
        status: fallbackError.response?.status,
        statusText: fallbackError.response?.statusText,
        data: fallbackError.response?.data,
        headers: fallbackError.response?.headers
      });
      throw fallbackError;
    }
  }
  
  // If we get here, all attempts failed
  throw new Error('All ticket creation attempts failed');
};

// Alias for backward compatibility
export const createTicket = createSupportTicket;

// Add reply to a ticket (admin only)
export const addReplyToTicket = async (ticketId, replyData) => {
  const message = replyData?.message;
  const commonOptions = {
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    withCredentials: true,
  };

  // Try variant 1: endpoint with ticketId in the path
  try {
    return await axios.post(
      joinUrl(baseUrl, `api/support-tickets/admin/reply/${ticketId}`),
      { message },
      commonOptions
    );
  } catch (error) {
    // If route not found, try variant 2: endpoint without id but with ticket_id in body
    if (error?.response?.status === 404) {
      return axios.post(
        joinUrl(baseUrl, 'api/support-tickets/admin/reply'),
        { ticket_id: ticketId, message },
        commonOptions
      );
    }
    throw error;
  }
};

// Fetch user's own tickets
export const getUserTickets = async () => {
  return axios.get(
    joinUrl(baseUrl, 'api/support-tickets/user/me'),
    {
      headers: {
        ...getAuthHeader(),
      },
      withCredentials: true
    }
  );
};

// Get a single ticket by ID
export const getTicketById = async (ticketId) => {
  return axios.get(
    joinUrl(baseUrl, `api/support-tickets/${ticketId}`),
    {
      headers: {
        ...getAuthHeader(),
      },
      withCredentials: true
    }
  );
};

// Update ticket status
export const updateTicketStatus = async (ticketId, status) => {
  return axios.patch(
    joinUrl(baseUrl, `api/support-tickets/status/${ticketId}`),
    { status },
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true
    }
  );
};

// Example usage in a fetch call:
export async function someApiFunction() {
  const response = await fetch(`${API_BASE}/api/someEndpoint`, {
    method: 'GET', // or 'POST', etc.
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });
  // ...existing code...
}
