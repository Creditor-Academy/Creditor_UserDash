import api from './apiClient';

/**
 * Check if a user has unlocked a specific feature
 * @param {string} userId - ID of the user
 * @param {string} unlockType - Type of unlock (e.g., 'FEATURE')
 * @param {string} unlockId - ID of the feature to check (e.g., 'LESSON_LISTENER')
 * @returns {Promise<boolean>} True if the feature is unlocked
 */
export async function isFeatureUnlocked(userId, unlockType, unlockId) {
  if (!userId) {
    console.warn('[FeatureService] No userId provided');
    return false;
  }

  try {
    // Fetch unlock history for the user
    // Using the same endpoint as CreditPurchaseModal
    const response = await api.get(`/payment-order/credits/usages/${userId}`, {
      withCredentials: true,
    });

    const unlockHistory = response?.data?.data || response?.data || [];

    // Check if the specific feature is unlocked
    const isUnlocked = unlockHistory.some(
      unlock =>
        unlock.unlock_type === unlockType && unlock.unlock_id === unlockId
    );

    console.log(
      `[FeatureService] Feature ${unlockId} unlocked:`,
      isUnlocked,
      unlockHistory
    );

    return isUnlocked;
  } catch (error) {
    console.error('[FeatureService] Failed to check feature unlock:', error);
    // Return false on error to be safe
    return false;
  }
}

/**
 * Get all unlocked features for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of unlocked features
 */
export async function getUserUnlockedFeatures(userId) {
  if (!userId) {
    console.warn('[FeatureService] No userId provided');
    return [];
  }

  try {
    // Using the same endpoint as CreditPurchaseModal
    const response = await api.get(`/payment-order/credits/usages/${userId}`, {
      withCredentials: true,
    });

    const unlockHistory = response?.data?.data || response?.data || [];

    // Filter for FEATURE type unlocks
    const features = unlockHistory.filter(
      unlock => unlock.unlock_type === 'FEATURE'
    );

    return features;
  } catch (error) {
    console.error('[FeatureService] Failed to fetch unlocked features:', error);
    return [];
  }
}

export default {
  isFeatureUnlocked,
  getUserUnlockedFeatures,
};
