import { api } from './apiClient';

/**
 * Create a new badge
 * @param {Object} badgeData - Badge creation data
 * @param {string} badgeData.title - Badge title
 * @param {string} badgeData.criteria - Badge criteria description
 * @param {string} badgeData.icon - Icon URL
 * @param {string} badgeData.category - Badge category (e.g., "PARTICIPATION")
 * @param {string} badgeData.criteria_type - Criteria type (e.g., "ATTENDANCE", "QUIZ", "ASSESSMENT")
 * @param {Object} badgeData.criteria_config - Criteria configuration object
 * @param {boolean} badgeData.is_auto_award - Whether badge is auto-awarded
 * @returns {Promise<Object>} API response
 */
export async function createBadge(badgeData) {
  try {
    console.log('[BadgeService] Creating badge:', badgeData);
    
    const payload = {
      title: badgeData.title,
      criteria: badgeData.criteria,
      icon: badgeData.icon,
      category: badgeData.category,
      criteria_type: badgeData.criteria_type,
      criteria_config: badgeData.criteria_config,
      is_auto_award: badgeData.is_auto_award
    };

    const response = await api.post('/api/badges', payload, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[BadgeService] Badge created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('[BadgeService] Failed to create badge:', error);
    console.error('[BadgeService] Error status:', error?.response?.status);
    console.error('[BadgeService] Error data:', error?.response?.data);
    throw error;
  }
}

/**
 * Fetch all badges
 * @returns {Promise<Object>} API response with badges list
 */
export async function fetchAllBadges() {
  try {
    console.log('[BadgeService] Fetching all badges');
    
    const response = await api.get('/api/badges', {
      withCredentials: true
    });

    console.log('[BadgeService] Badges fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('[BadgeService] Failed to fetch badges:', error);
    throw error;
  }
}

/**
 * Award badge to user (Admin only)
 * @param {string} userId - User ID
 * @param {string} badgeId - Badge ID
 * @returns {Promise<Object>} API response
 */
export async function awardBadge(userId, badgeId) {
  try {
    console.log('[BadgeService] Awarding badge:', { userId, badgeId });
    
    const payload = {
      userId,
      badgeId
    };

    const response = await api.post('/api/badges/award', payload, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[BadgeService] Badge awarded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('[BadgeService] Failed to award badge:', error);
    console.error('[BadgeService] Error status:', error?.response?.status);
    console.error('[BadgeService] Error data:', error?.response?.data);
    throw error;
  }
}

/**
 * Delete a badge
 * @param {string} badgeId - Badge ID to delete
 * @returns {Promise<Object>} API response
 */
export async function deleteBadge(badgeId) {
  try {
    console.log('[BadgeService] Deleting badge:', badgeId);
    
    const response = await api.delete(`/api/badges/${badgeId}`, {
      withCredentials: true
    });

    console.log('[BadgeService] Badge deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('[BadgeService] Failed to delete badge:', error);
    console.error('[BadgeService] Error status:', error?.response?.status);
    console.error('[BadgeService] Error data:', error?.response?.data);
    throw error;
  }
}

