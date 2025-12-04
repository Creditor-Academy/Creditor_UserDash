import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  mySponsorRequests,
  mySponsorAds,
  mySponsorAnalytics,
} from '@/data/mySponsorData';

const STORAGE_KEY = 'lms_user_sponsor_center';

const defaultState = {
  requests: mySponsorRequests,
  ads: mySponsorAds,
  analytics: mySponsorAnalytics,
};

const UserSponsorContext = createContext(null);

const loadState = () => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        requests: parsed.requests || mySponsorRequests,
        ads: parsed.ads || mySponsorAds,
        analytics: parsed.analytics || mySponsorAnalytics,
      };
    }
  } catch (error) {
    console.warn('[SponsorCenter] Failed to parse stored state', error);
  }
  return defaultState;
};

const persistState = state => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[SponsorCenter] Failed to persist state', error);
  }
};

export const UserSponsorProvider = ({ children }) => {
  const [requests, setRequests] = useState(() => loadState().requests);
  const [ads, setAds] = useState(() => loadState().ads);
  const [analytics, setAnalytics] = useState(() => loadState().analytics);

  useEffect(() => {
    persistState({ requests, ads, analytics });
  }, [requests, ads, analytics]);

  const addRequest = useCallback(payload => {
    const id = `req_${Date.now()}`;
    const normalized = {
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...payload,
    };
    setRequests(prev => [normalized, ...prev]);
    setAds(prev => [
      {
        id,
        sponsorName: payload.sponsorName,
        adTitle: payload.adTitle,
        description: payload.description,
        mediaUrl: payload.mediaUrl || '',
        placement: payload.placement,
        budget: payload.budget,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: 'Pending',
        website: payload.website,
        type: payload.adType || 'Image',
      },
      ...prev,
    ]);
  }, []);

  const updateAd = useCallback((id, updates) => {
    setAds(prev => prev.map(ad => (ad.id === id ? { ...ad, ...updates } : ad)));
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, ...updates } : req))
    );
  }, []);

  const deleteAd = useCallback(id => {
    setAds(prev => prev.filter(ad => ad.id !== id));
    setRequests(prev => prev.filter(req => req.id !== id));
    setAnalytics(prev => prev.filter(entry => entry.adId !== id));
  }, []);

  const toggleAdStatus = useCallback(id => {
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
    setAds(prev =>
      prev.map(ad => (ad.id === id ? { ...ad, status: 'Pending' } : ad))
    );
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: 'Pending' } : req))
    );
  }, []);

  const aggregatedAnalytics = useMemo(() => {
    const totals = analytics.reduce(
      (acc, entry) => {
        acc.impressions += entry.impressions;
        acc.clicks += entry.clicks;
        acc.timelineMap = entry.timelineData.reduce((map, point) => {
          const current = map.get(point.day) || 0;
          map.set(point.day, current + point.impressions);
          return map;
        }, acc.timelineMap);
        acc.clicksPerAd.push({
          name: entry.title,
          clicks: entry.clicks,
        });
        acc.typeDistribution[entry.adType] =
          (acc.typeDistribution[entry.adType] || 0) + entry.impressions;
        return acc;
      },
      {
        impressions: 0,
        clicks: 0,
        timelineMap: new Map(),
        clicksPerAd: [],
        typeDistribution: {},
      }
    );

    const ctr =
      totals.impressions === 0
        ? 0
        : Number(((totals.clicks / totals.impressions) * 100).toFixed(2));

    const timelineSeries = Array.from(totals.timelineMap.entries()).map(
      ([day, impressions]) => ({
        day,
        impressions,
      })
    );

    const typeDistributionSeries = Object.entries(totals.typeDistribution).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return {
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      ctr,
      clicksPerAd: totals.clicksPerAd,
      timelineSeries,
      typeDistributionSeries,
      activeAdsCount: ads.filter(ad => ad.status === 'Approved').length,
      rejectedAdsCount: ads.filter(ad => ad.status === 'Rejected').length,
    };
  }, [analytics, ads]);

  const value = useMemo(
    () => ({
      requests,
      ads,
      analytics: aggregatedAnalytics,
      addRequest,
      updateAd,
      deleteAd,
      toggleAdStatus,
      resubmitAd,
    }),
    [
      requests,
      ads,
      aggregatedAnalytics,
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
