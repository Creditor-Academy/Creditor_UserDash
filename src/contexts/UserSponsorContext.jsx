import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getUserAdApplications } from '@/services/sponsorAdsService';

const UserSponsorContext = createContext(null);

// Map backend position to frontend placement
const POSITION_TO_PLACEMENT = {
  DASHBOARD: 'dashboard_banner',
  SIDEBAR: 'dashboard_sidebar',
  COURSE_PLAYER: 'course_player_sidebar',
  COURSE_LISTING: 'course_listing_tile',
  POPUP: 'popup',
};

// Map backend status to frontend status
const normalizeStatus = status => {
  const statusMap = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return statusMap[status] || status || 'Pending';
};

// Normalize backend application to frontend ad format
const normalizeApplication = app => {
  const mediaUrl = app.video_url || app.image_url || '';
  const mediaType = app.video_url ? 'video' : 'image';

  return {
    id: app.id,
    sponsorName: app.sponsor_name || app.sponsorName,
    adTitle: app.title || app.adTitle,
    description: app.description || '',
    mediaUrl: mediaUrl,
    mediaType: mediaType,
    placement:
      POSITION_TO_PLACEMENT[app.preferred_position] ||
      app.placement ||
      'dashboard_banner',
    budget: app.budget || '',
    startDate: app.preferred_start_date || app.startDate || '',
    endDate: app.preferred_end_date || app.endDate || '',
    status: normalizeStatus(app.status),
    website: app.link_url || app.website || '',
    type: mediaType === 'video' ? 'Video' : 'Image',
    companyName: app.company_name,
    contactEmail: app.contact_email,
    contactPhone: app.contact_phone,
    additionalNotes: app.additional_notes,
    adminNotes: app.admin_notes,
    reviewedBy: app.reviewed_by,
    reviewedAt: app.reviewed_at,
    createdAt: app.created_at,
    updatedAt: app.updated_at,
    sponsorAdId: app.sponsor_ad_id,
  };
};

export const UserSponsorProvider = ({ children }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user ad applications from backend
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const applications = await getUserAdApplications();
      const normalizedAds = applications.map(normalizeApplication);
      setAds(normalizedAds);
    } catch (err) {
      console.error('[UserSponsor] Failed to fetch applications:', err);
      setError(err.message);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const addRequest = useCallback(() => {
    // Refresh applications after new request is submitted
    fetchApplications();
  }, [fetchApplications]);

  const updateAd = useCallback((id, updates) => {
    // Note: Updates are local only since backend doesn't support editing applications
    // In a real scenario, you might want to disable editing or create a new API endpoint
    setAds(prev => prev.map(ad => (ad.id === id ? { ...ad, ...updates } : ad)));
  }, []);

  const deleteAd = useCallback(async id => {
    // Note: Backend doesn't provide delete endpoint for applications
    // This is local only - you may want to disable this or add API endpoint
    setAds(prev => prev.filter(ad => ad.id !== id));
  }, []);

  const toggleAdStatus = useCallback(id => {
    // Note: Status toggling is handled by admin, not user
    // This is kept for UI compatibility but may not have backend support
    setAds(prev =>
      prev.map(ad => {
        if (ad.id !== id || ad.status === 'Rejected') return ad;
        if (ad.status === 'Approved') return { ...ad, status: 'Paused' };
        if (ad.status === 'Paused') return { ...ad, status: 'Approved' };
        return ad;
      })
    );
  }, []);

  const resubmitAd = useCallback(id => {
    // Note: Resubmission would require backend API endpoint
    // This is local only for now
    setAds(prev =>
      prev.map(ad => (ad.id === id ? { ...ad, status: 'Pending' } : ad))
    );
  }, []);

  const analytics = useMemo(() => {
    // Basic analytics from ads data
    const approvedAds = ads.filter(ad => ad.status === 'Approved');
    const pendingAds = ads.filter(ad => ad.status === 'Pending');
    const rejectedAds = ads.filter(ad => ad.status === 'Rejected');

    return {
      totalImpressions: 0, // Not available from applications API
      totalClicks: 0, // Not available from applications API
      ctr: 0,
      clicksPerAd: [],
      timelineSeries: [],
      typeDistributionSeries: [],
      activeAdsCount: approvedAds.length,
      pendingAdsCount: pendingAds.length,
      rejectedAdsCount: rejectedAds.length,
      totalAdsCount: ads.length,
    };
  }, [ads]);

  const value = useMemo(
    () => ({
      ads,
      analytics,
      loading,
      error,
      refreshApplications: fetchApplications,
      addRequest,
      updateAd,
      deleteAd,
      toggleAdStatus,
      resubmitAd,
    }),
    [
      ads,
      analytics,
      loading,
      error,
      fetchApplications,
      addRequest,
      updateAd,
      deleteAd,
      toggleAdStatus,
      resubmitAd,
    ]
  );

  return (
    <UserSponsorContext.Provider value={value}>
      {children}
    </UserSponsorContext.Provider>
  );
};

export const useUserSponsor = () => {
  const context = useContext(UserSponsorContext);
  if (!context) {
    throw new Error('useUserSponsor must be used within a UserSponsorProvider');
  }
  return context;
};
