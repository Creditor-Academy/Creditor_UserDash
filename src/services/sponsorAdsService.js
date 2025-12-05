import api from './apiClient';
import { uploadImage } from './imageUploadService';

/**
 * Create a sponsor ad via backend API
 * @param {Object} adData - Sponsor ad data
 * @param {string} adData.title - Ad title
 * @param {string} adData.description - Ad description
 * @param {File|string} adData.mediaFile - Image file to upload (or existing URL)
 * @param {string} adData.linkUrl - CTA link URL
 * @param {string} adData.sponsorName - Sponsor name
 * @param {string} adData.startDate - Start date (ISO string or date string)
 * @param {string} adData.endDate - End date (ISO string or date string)
 * @param {string} adData.position - Ad position (DASHBOARD, SIDEBAR, etc.)
 * @param {string|null} adData.organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Created ad data
 */
export async function createSponsorAd(adData) {
  try {
    console.log('🚀 Creating sponsor ad:', adData);

    let imageUrl = adData.mediaFile;

    // If mediaFile is a File object, upload it first
    if (adData.mediaFile instanceof File) {
      console.log('📤 Uploading image file...');
      const uploadResult = await uploadImage(adData.mediaFile, {
        folder: 'sponsor-ads',
        public: true,
        type: 'image',
      });
      imageUrl = uploadResult.imageUrl;
      console.log('✅ Image uploaded:', imageUrl);
    }

    // Convert dates to ISO format if needed
    const formatDate = date => {
      if (!date) return null;
      if (date instanceof Date) {
        return date.toISOString();
      }
      if (typeof date === 'string') {
        // If it's already ISO format, return as is
        if (date.includes('T')) {
          return date;
        }
        // If it's a date string like "2025-01-01", convert to ISO
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          return d.toISOString();
        }
      }
      return date;
    };

    // Map frontend fields to backend API format
    const payload = {
      title: adData.title?.trim() || '',
      description: adData.description?.trim() || '',
      image_url: imageUrl || '',
      link_url: adData.linkUrl?.trim() || '',
      sponsor_name: adData.sponsorName?.trim() || '',
      start_date: formatDate(adData.startDate),
      end_date: formatDate(adData.endDate),
      position: adData.position || 'DASHBOARD',
      organization_id: adData.organizationId || null,
    };

    console.log('📤 Sending request to backend:', payload);

    // Make API call
    const response = await api.post('/api/admin/ads', payload);

    console.log('✅ Sponsor ad created successfully:', response.data);

    return {
      success: true,
      data: response.data,
      message: 'Sponsor ad created successfully',
    };
  } catch (error) {
    console.error('❌ Failed to create sponsor ad:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;

    throw new Error(
      backendMessage ||
        `Failed to create sponsor ad (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Get all sponsor ads
 * @returns {Promise<Array>} List of sponsor ads
 */
export async function getAllSponsorAds() {
  try {
    const response = await api.get('/api/admin/ads');
    console.log('✅ Fetched sponsor ads:', response.data);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch sponsor ads:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch sponsor ads (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Fetch sponsor ads for user dashboard
 * Backend tracks impressions automatically on this request
 * @returns {Promise<Array>} Array of active ads
 */
export async function fetchDashboardSponsorAds() {
  try {
    const response = await api.get('/api/user/dashboard/ads');

    // Handle the response structure: { code: 200, data: { ads: [...] }, success: true, message: "..." }
    const ads = response.data?.data?.ads || response.data?.ads || [];

    console.log('✅ Dashboard sponsor ads fetched:', ads);
    return ads;
  } catch (error) {
    console.error('❌ Failed to fetch dashboard sponsor ads:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch dashboard sponsor ads (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Track sponsor ad click for user dashboard
 * @param {string} adId - Sponsor ad id
 */
export async function trackSponsorAdClick(adId) {
  if (!adId) return;
  try {
    await api.post(`/api/user/dashboard/ads/${adId}/click`);
    console.log('✅ Tracked sponsor ad click', adId);
  } catch (error) {
    console.error('❌ Failed to track sponsor ad click:', error);
    // We don't throw here to avoid disrupting UI; logging is enough
  }
}

/**
 * Update a sponsor ad
 * @param {string} adId - Ad ID
 * @param {Object} adData - Updated ad data
 * @returns {Promise<Object>} Updated ad data
 */
export async function updateSponsorAd(adId, adData) {
  try {
    let imageUrl = adData.mediaFile;

    // If mediaFile is a File object, upload it first
    if (adData.mediaFile instanceof File) {
      const uploadResult = await uploadImage(adData.mediaFile, {
        folder: 'sponsor-ads',
        public: true,
        type: 'image',
      });
      imageUrl = uploadResult.imageUrl;
    }

    const formatDate = date => {
      if (!date) return null;
      if (date instanceof Date) return date.toISOString();
      if (typeof date === 'string') {
        if (date.includes('T')) return date;
        const d = new Date(date);
        if (!isNaN(d.getTime())) return d.toISOString();
      }
      return date;
    };

    const payload = {
      title: adData.title?.trim() || '',
      description: adData.description?.trim() || '',
      image_url: imageUrl || adData.image_url || '',
      link_url: adData.linkUrl?.trim() || '',
      sponsor_name: adData.sponsorName?.trim() || '',
      start_date: formatDate(adData.startDate),
      end_date: formatDate(adData.endDate),
      position: adData.position || 'DASHBOARD',
      organization_id: adData.organizationId || null,
    };

    const response = await api.put(`/api/admin/ads/${adId}`, payload);
    console.log('✅ Sponsor ad updated:', response.data);
    return {
      success: true,
      data: response.data,
      message: 'Sponsor ad updated successfully',
    };
  } catch (error) {
    console.error('❌ Failed to update sponsor ad:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to update sponsor ad (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Delete a sponsor ad
 * @param {string} adId - Ad ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteSponsorAd(adId) {
  try {
    const response = await api.delete(`/api/admin/ads/${adId}`);
    console.log('✅ Sponsor ad deleted:', response.data);
    return {
      success: true,
      message: 'Sponsor ad deleted successfully',
    };
  } catch (error) {
    console.error('❌ Failed to delete sponsor ad:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to delete sponsor ad (${error.response?.status || 'Unknown'})`
    );
  }
}
