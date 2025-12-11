import api from './apiClient';
import { uploadImage } from './imageUploadService';
import { uploadVideo } from './videoUploadService';

/**
 * Create a sponsor ad via backend API
 * @param {Object} adData - Sponsor ad data
 * @param {string} adData.title - Ad title
 * @param {string} adData.description - Ad description
 * @param {File|string} adData.mediaFile - Image or video file to upload (or existing URL)
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

    let imageUrl = null;
    let videoUrl = null;
    let mediaUrl = adData.mediaFile;

    // If mediaFile is a File object, upload it first
    if (adData.mediaFile instanceof File) {
      const isVideo = adData.mediaFile.type.startsWith('video/');

      if (isVideo) {
        console.log('📤 Uploading video file...');
        const uploadResult = await uploadVideo(adData.mediaFile, {
          folder: 'sponsor-ads',
          public: true,
          type: 'video',
        });
        videoUrl = uploadResult.videoUrl;
        mediaUrl = videoUrl;
        console.log('✅ Video uploaded:', videoUrl);
      } else {
        console.log('📤 Uploading image file...');
        const uploadResult = await uploadImage(adData.mediaFile, {
          folder: 'sponsor-ads',
          public: true,
          type: 'image',
        });
        imageUrl = uploadResult.imageUrl;
        mediaUrl = imageUrl;
        console.log('✅ Image uploaded:', imageUrl);
      }
    } else if (typeof mediaUrl === 'string') {
      // If it's a string URL, determine if it's a video or image
      const isVideoUrl = /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(mediaUrl);
      if (isVideoUrl) {
        videoUrl = mediaUrl;
      } else {
        imageUrl = mediaUrl;
      }
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
      video_url: videoUrl || '',
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
    await api.post(`/api/user/ads/${adId}/click`);
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
    let imageUrl = adData.image_url || null;
    let videoUrl = adData.video_url || null;

    // If mediaFile is a File object, upload it first
    if (adData.mediaFile instanceof File) {
      const isVideo = adData.mediaFile.type.startsWith('video/');

      if (isVideo) {
        const uploadResult = await uploadVideo(adData.mediaFile, {
          folder: 'sponsor-ads',
          public: true,
          type: 'video',
        });
        videoUrl = uploadResult.videoUrl;
        imageUrl = null; // Clear image URL if uploading video
      } else {
        const uploadResult = await uploadImage(adData.mediaFile, {
          folder: 'sponsor-ads',
          public: true,
          type: 'image',
        });
        imageUrl = uploadResult.imageUrl;
        videoUrl = null; // Clear video URL if uploading image
      }
    } else if (adData.mediaUrl && typeof adData.mediaUrl === 'string') {
      // Determine if existing URL is video or image
      const isVideoUrl = /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(adData.mediaUrl);
      if (isVideoUrl) {
        videoUrl = adData.mediaUrl;
        imageUrl = null;
      } else {
        imageUrl = adData.mediaUrl;
        videoUrl = null;
      }
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
      image_url: imageUrl || '',
      video_url: videoUrl || '',
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

/**
 * Submit a sponsor ad request from user side
 * @param {Object} requestData - Ad request data
 * @param {string} requestData.title - Ad title
 * @param {string} requestData.description - Ad description
 * @param {string} requestData.sponsor_name - Sponsor name
 * @param {string} requestData.company_name - Company name
 * @param {string} requestData.contact_email - Contact email
 * @param {string} requestData.contact_phone - Contact phone
 * @param {File|string} requestData.mediaFile - Image or video file (or existing URL)
 * @param {string} requestData.link_url - CTA link URL
 * @param {string} requestData.placement - Preferred placement (dashboard_banner, etc.)
 * @param {string} requestData.preferred_start_date - Start date (ISO string or date string)
 * @param {string} requestData.preferred_end_date - End date (ISO string or date string)
 * @param {number} requestData.budget - Budget amount
 * @param {string} requestData.additional_notes - Additional notes
 * @returns {Promise<Object>} Submitted request data
 */
export async function submitSponsorAdRequest(requestData) {
  try {
    console.log('🚀 Submitting sponsor ad request:', requestData);

    let imageUrl = null;
    let videoUrl = null;

    // If mediaFile is a File object, upload it first
    if (requestData.mediaFile instanceof File) {
      const isVideo = requestData.mediaFile.type.startsWith('video/');

      if (isVideo) {
        console.log('📤 Uploading video file...');
        const uploadResult = await uploadVideo(requestData.mediaFile, {
          folder: 'sponsor-ads',
          public: true,
          type: 'video',
        });
        videoUrl = uploadResult.videoUrl;
        console.log('✅ Video uploaded:', videoUrl);
      } else {
        console.log('📤 Uploading image file...');
        const uploadResult = await uploadImage(requestData.mediaFile, {
          folder: 'sponsor-ads',
          public: true,
          type: 'image',
        });
        imageUrl = uploadResult.imageUrl;
        console.log('✅ Image uploaded:', imageUrl);
      }
    } else if (
      requestData.mediaFile &&
      typeof requestData.mediaFile === 'string'
    ) {
      // If it's a string URL, determine if it's a video or image
      const isVideoUrl = /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(
        requestData.mediaFile
      );
      if (isVideoUrl) {
        videoUrl = requestData.mediaFile;
      } else {
        imageUrl = requestData.mediaFile;
      }
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

    // Map frontend placement to backend position
    const PLACEMENT_TO_POSITION = {
      dashboard_banner: 'DASHBOARD',
      dashboard_sidebar: 'SIDEBAR',
      sidebar_ad: 'SIDEBAR',
      course_player: 'COURSE_PLAYER',
      course_player_sidebar: 'COURSE_PLAYER',
      course_listing_page: 'COURSE_LISTING',
      course_listing_tile: 'COURSE_LISTING',
      popup: 'POPUP',
    };

    const preferredPosition =
      PLACEMENT_TO_POSITION[requestData.placement] || 'DASHBOARD';

    // Prepare payload
    const payload = {
      title: requestData.title?.trim() || '',
      description: requestData.description?.trim() || '',
      sponsor_name: requestData.sponsor_name?.trim() || '',
      company_name: requestData.company_name?.trim() || '',
      contact_email: requestData.contact_email?.trim() || '',
      contact_phone: requestData.contact_phone?.trim() || '',
      image_url: imageUrl || '',
      video_url: videoUrl || null,
      link_url: requestData.link_url?.trim() || '',
      preferred_position: preferredPosition,
      preferred_start_date: formatDate(requestData.preferred_start_date),
      preferred_end_date: formatDate(requestData.preferred_end_date),
      budget: parseFloat(requestData.budget) || 0,
      additional_notes: requestData.additional_notes?.trim() || '',
    };

    console.log('📤 Sending request to backend:', payload);

    // Make API call
    const response = await api.post('/api/user/ads/apply', payload);

    console.log('✅ Sponsor ad request submitted successfully:', response.data);

    return {
      success: true,
      data: response.data?.data || response.data,
      message:
        response.data?.message ||
        'Ad application submitted successfully. Admin will review your request.',
    };
  } catch (error) {
    console.error('❌ Failed to submit sponsor ad request:', {
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
        `Failed to submit ad request (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Get user's sponsor ad applications
 * @returns {Promise<Array>} Array of user's ad applications
 */
export async function getUserAdApplications() {
  try {
    const response = await api.get('/api/user/ads/applications');

    // Handle the response structure: { code: 200, data: { applications: [...] }, success: true, message: "..." }
    const applications =
      response.data?.data?.applications || response.data?.applications || [];

    console.log('✅ User ad applications fetched:', applications);
    return applications;
  } catch (error) {
    console.error('❌ Failed to fetch user ad applications:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch ad applications (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Get a specific ad application by ID
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Application data
 */
export async function getUserAdApplicationById(applicationId) {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    const response = await api.get(
      `/api/user/ads/applications/${applicationId}`
    );

    // Handle the response structure: { code: 200, data: { ... }, success: true, message: "..." }
    const application =
      response.data?.data || response.data?.application || response.data;

    console.log('✅ User ad application fetched:', application);
    return application;
  } catch (error) {
    console.error('❌ Failed to fetch ad application:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch ad application (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Get all ad applications from admin side
 * @returns {Promise<Array>} Array of all ad applications
 */
export async function getAllAdApplications() {
  try {
    const response = await api.get('/api/admin/ads/applications');

    // Handle the response structure: { code: 200, data: { applications: [...] }, success: true, message: "..." }
    const applications =
      response.data?.data?.applications ||
      response.data?.applications ||
      response.data ||
      [];

    console.log('✅ All ad applications fetched:', applications);
    return applications;
  } catch (error) {
    console.error('❌ Failed to fetch ad applications:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to fetch ad applications (${error.response?.status || 'Unknown'})`
    );
  }
}

/**
 * Update application status from admin side
 * @param {string} applicationId - Application ID
 * @param {string} status - Status to set (APPROVED, REJECTED, PENDING)
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise<Object>} Updated application data
 */
export async function updateApplicationStatus(
  applicationId,
  status,
  adminNotes = ''
) {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }
    if (!status) {
      throw new Error('Status is required');
    }

    // Validate status value
    const validStatuses = ['APPROVED', 'REJECTED', 'PENDING'];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    const payload = {
      status: status.toUpperCase(),
      admin_notes: adminNotes?.trim() || '',
    };

    console.log('📤 Updating application status:', { applicationId, payload });

    const response = await api.put(
      `/api/admin/ads/applications/${applicationId}/status`,
      payload
    );

    // Handle the response structure: { code: 200, data: { ... }, success: true, message: "..." }
    const updatedApplication =
      response.data?.data || response.data?.application || response.data;

    console.log('✅ Application status updated:', updatedApplication);
    return updatedApplication;
  } catch (error) {
    console.error('❌ Failed to update application status:', error);
    const backendMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.userMessage ||
      error.message;
    throw new Error(
      backendMessage ||
        `Failed to update application status (${error.response?.status || 'Unknown'})`
    );
  }
}
