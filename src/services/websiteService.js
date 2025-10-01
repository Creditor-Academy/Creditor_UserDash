import { api } from './apiClient';

// Pricing IDs
const WEBSITE_NORMAL_PRICING_ID = '53778304-d511-4a72-831e-7498a82072a3';
const WEBSITE_PREMIUM_PRICING_ID = '5b6f079b-cfb2-40b0-adc3-f45dd087c1d3';

/**
 * Book a website service
 * @param {string} userId - User ID
 * @param {string} serviceType - 'basic' or 'premium'
 * @returns {Promise<Object>} - API response
 */
export async function bookWebsiteService(userId, serviceType) {
  try {
    console.log('[WebsiteService] Booking website service for user:', userId);
    console.log('[WebsiteService] Service type:', serviceType);
    
    // Determine pricing ID based on service type
    const pricingId = serviceType === 'premium' ? WEBSITE_PREMIUM_PRICING_ID : WEBSITE_NORMAL_PRICING_ID;
    
    const requestData = {
      user_id: userId,
      status: "PENDING",
      unlock_type: "WEBSITE_SERVICES",
      pricing_id: pricingId
    };

    console.log('[WebsiteService] Request data:', requestData);
    console.log('[WebsiteService] Pricing ID being sent:', pricingId);
    console.log('[WebsiteService] Service type:', serviceType);
    
    const response = await api.post('/api/website_services', requestData, { withCredentials: true });
    
    console.log('[WebsiteService] Booking response:', response?.data);
    console.log('[WebsiteService] Response status:', response?.status);
    
    return response.data;
  } catch (error) {
    console.error('[WebsiteService] Failed to book website service:', error);
    console.error('[WebsiteService] Error status:', error?.response?.status);
    console.error('[WebsiteService] Error data:', error?.response?.data);
    throw error;
  }
}

/**
 * Fetch all website services (admin)
 * @returns {Promise<Array>} - List of website services
 */
export async function fetchAllWebsiteServices() {
  try {
    console.log('[WebsiteService] Fetching all website services');
    
    const response = await api.get('/api/website_services', { withCredentials: true });
    
    console.log('[WebsiteService] Fetch response:', response?.data);
    console.log('[WebsiteService] Response structure:', response?.data?.data);
    console.log('[WebsiteService] Response success:', response?.data?.success);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('[WebsiteService] Failed to fetch website services:', error);
    throw error;
  }
}

/**
 * Fetch user's website services
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - User's website services
 */
export async function fetchUserWebsiteServices(userId) {
  try {
    console.log('[WebsiteService] Fetching website services for user:', userId);
    
    const response = await api.get(`/api/website_services/${userId}`, { withCredentials: true });
    
    console.log('[WebsiteService] User website services response:', response?.data);
    console.log('[WebsiteService] Response structure:', response?.data?.data);
    console.log('[WebsiteService] Response success:', response?.data?.success);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('[WebsiteService] Failed to fetch user website services:', error);
    throw error;
  }
}

/**
 * Update website service status (admin)
 * @param {string} serviceId - Service ID
 * @param {string} status - New status (COMPLETED, IN_PROGRESS, etc.)
 * @returns {Promise<Object>} - API response
 */
export async function updateWebsiteServiceStatus(serviceId, status) {
  try {
    console.log('[WebsiteService] Updating website service status:', serviceId, 'to', status);
    
    const response = await api.patch(`/api/website_services/${serviceId}/status`, 
      { status }, 
      { withCredentials: true });
    
    console.log('[WebsiteService] Status update response:', response?.data);
    return response.data;
  } catch (error) {
    console.error('[WebsiteService] Failed to update website service status:', error);
    throw error;
  }
}

/**
 * Delete website service (admin)
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} - API response
 */
export async function deleteWebsiteService(serviceId) {
  try {
    console.log('[WebsiteService] Deleting website service:', serviceId);
    
    const response = await api.delete(`/api/website_services/${serviceId}`, { withCredentials: true });
    
    console.log('[WebsiteService] Delete response:', response?.data);
    return response.data;
  } catch (error) {
    console.error('[WebsiteService] Failed to delete website service:', error);
    throw error;
  }
}
