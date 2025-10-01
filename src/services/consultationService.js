import { api } from './apiClient';

// Pricing IDs
const CONSULTATION_PRICING_ID = '25219706-f6db-46ab-a9a2-573b7548d4df';

/**
 * Book a consultation
 * @param {string} userId - User ID
 * @param {string} scheduledAt - Scheduled date/time in ISO format
 * @returns {Promise<Object>} - API response
 */
export async function bookConsultation(userId, scheduledAt) {
  try {
    console.log('[ConsultationService] Booking consultation for user:', userId);
    console.log('[ConsultationService] Scheduled at:', scheduledAt);
    
    const requestData = {
      user_id: userId,
      scheduled_at: scheduledAt,
      status: "PENDING",
      unlock_type: "CONSULTATION",
      pricing_id: CONSULTATION_PRICING_ID
    };

    // Log the exact request being sent
    console.log('[ConsultationService] Exact request payload:', JSON.stringify(requestData, null, 2));

    console.log('[ConsultationService] Request data:', requestData);
    console.log('[ConsultationService] Pricing ID being sent:', CONSULTATION_PRICING_ID);
    console.log('[ConsultationService] Full request URL:', '/api/consultations');
    
    const response = await api.post('/api/consultations', requestData, { withCredentials: true });
    
    console.log('[ConsultationService] Booking response:', response?.data);
    console.log('[ConsultationService] Response status:', response?.status);
    console.log('[ConsultationService] Response headers:', response?.headers);
    
    return response.data;
  } catch (error) {
    console.error('[ConsultationService] Failed to book consultation:', error);
    console.error('[ConsultationService] Error status:', error?.response?.status);
    console.error('[ConsultationService] Error data:', error?.response?.data);
    throw error;
  }
}

/**
 * Fetch all consultations (admin)
 * @returns {Promise<Array>} - List of consultations
 */
export async function fetchAllConsultations() {
  try {
    console.log('[ConsultationService] Fetching all consultations');
    
    const response = await api.get('/api/consultations', { withCredentials: true });
    
    console.log('[ConsultationService] Fetch response:', response?.data);
    console.log('[ConsultationService] Response structure:', response?.data?.data);
    console.log('[ConsultationService] Response success:', response?.data?.success);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('[ConsultationService] Failed to fetch consultations:', error);
    throw error;
  }
}

/**
 * Fetch user's consultations
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - User's consultations
 */
export async function fetchUserConsultations(userId) {
  try {
    console.log('[ConsultationService] Fetching consultations for user:', userId);
    
    const response = await api.get(`/api/consultations/${userId}`, { withCredentials: true });
    
    console.log('[ConsultationService] User consultations response:', response?.data);
    console.log('[ConsultationService] Response structure:', response?.data?.data);
    console.log('[ConsultationService] Response success:', response?.data?.success);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('[ConsultationService] Failed to fetch user consultations:', error);
    throw error;
  }
}

/**
 * Update consultation status (admin)
 * @param {string} consultationId - Consultation ID
 * @param {string} status - New status (COMPLETED, IN_PROGRESS, etc.)
 * @returns {Promise<Object>} - API response
 */
export async function updateConsultationStatus(consultationId, status) {
  try {
    console.log('[ConsultationService] Updating consultation status:', consultationId, 'to', status);
    
    const response = await api.patch(`/api/consultations/${consultationId}/status`, 
      { status }, 
      { withCredentials: true });
    
    console.log('[ConsultationService] Status update response:', response?.data);
    return response.data;
  } catch (error) {
    console.error('[ConsultationService] Failed to update consultation status:', error);
    throw error;
  }
}

/**
 * Delete consultation (admin)
 * @param {string} consultationId - Consultation ID
 * @returns {Promise<Object>} - API response
 */
export async function deleteConsultation(consultationId) {
  try {
    console.log('[ConsultationService] Deleting consultation:', consultationId);
    
    const response = await api.delete(`/api/consultations/${consultationId}`, { withCredentials: true });
    
    console.log('[ConsultationService] Delete response:', response?.data);
    return response.data;
  } catch (error) {
    console.error('[ConsultationService] Failed to delete consultation:', error);
    throw error;
  }
}
