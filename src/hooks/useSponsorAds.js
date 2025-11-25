import { useState, useEffect } from 'react';
import { sponsorAdsService } from '@/data/mockSponsorAds';
import { useUser } from '@/contexts/UserContext';

export function useSponsorAds(placement) {
  const { userProfile } = useUser();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    loadAds();
  }, [placement, userProfile]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const userRole = userProfile?.role?.toLowerCase() || 'student';
      const userCategory = null; // Can be extended to get from user profile
      const data = await sponsorAdsService.getActiveAdsByPlacement(
        placement,
        userRole,
        userCategory
      );
      setAds(data);
      // Select the first ad (highest tier priority)
      if (data.length > 0) {
        setSelectedAd(data[0]);
      }
    } catch (error) {
      console.error('Error loading sponsor ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = adId => {
    if (adId) {
      sponsorAdsService.trackImpression(adId);
    }
  };

  const trackClick = adId => {
    if (adId) {
      sponsorAdsService.trackClick(adId);
    }
  };

  return {
    ads,
    selectedAd,
    loading,
    trackImpression,
    trackClick,
  };
}

export default useSponsorAds;
