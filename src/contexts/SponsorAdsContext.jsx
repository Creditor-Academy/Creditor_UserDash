import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getAllSponsorAds,
  deleteSponsorAd as deleteSponsorAdApi,
  updateSponsorAd as updateSponsorAdApi,
} from "@/services/sponsorAdsService";

const STORAGE_KEY = "lms_sponsor_ads";
const TIER_PRIORITY = {
  Gold: 3,
  Silver: 2,
  Bronze: 1,
};

const SponsorAdsContext = createContext(null);

const POSITION_TO_PLACEMENT = {
  DASHBOARD: "dashboard_banner",
  SIDEBAR: "dashboard_sidebar",
  COURSE_PLAYER: "course_player_sidebar",
  COURSE_LISTING: "course_listing_tile",
  POPUP: "popup",
};

const PLACEMENT_TO_POSITION = {
  dashboard_banner: "DASHBOARD",
  dashboard_sidebar: "SIDEBAR",
  course_player_sidebar: "COURSE_PLAYER",
  course_listing_tile: "COURSE_LISTING",
  popup: "POPUP",
};

const applyRuntimeStatus = (ad) => {
  if (!ad) return "Inactive";
  if (ad.status === "Deleted") return "Deleted";
  if (ad.status === "Paused") return "Paused";

  const now = new Date();
  const start = new Date(ad.startDate);
  const end = new Date(ad.endDate);

  if (Number.isFinite(start.getTime()) && start > now) {
    return "Scheduled";
  }
  if (Number.isFinite(end.getTime()) && end < now) {
    return "Expired";
  }
  return "Active";
};

const hydrateAd = (ad) => ({
  impressions: 0,
  clicks: 0,
  ctr: 0,
  dailyImpressions: [],
  ...ad,
});

const normalizeBackendAd = (ad) => {
  // Determine media URL and type - prioritize video over image if both exist
  const mediaUrl = ad.video_url || ad.image_url || ad.mediaUrl || "";
  const mediaType = ad.video_url ? "video" : "image";

  return hydrateAd({
    id: ad.id,
    sponsorName: ad.sponsor_name || ad.sponsorName,
    title: ad.title,
    description: ad.description,
    mediaUrl: mediaUrl,
    mediaType: mediaType,
    placement:
      POSITION_TO_PLACEMENT[ad.position] || ad.placement || "dashboard_banner",
    ctaUrl: ad.link_url,
    ctaText: ad.link_url ? "Learn more" : "",
    startDate: ad.start_date || ad.startDate,
    endDate: ad.end_date || ad.endDate,
    tier: ad.tier || "Gold",
    status: ad.status === "ACTIVE" ? "Active" : ad.status || "Active",
    impressions: ad.view_count ?? ad.impressions ?? 0,
    clicks: ad.click_count ?? ad.clicks ?? 0,
    organizationId: ad.organization_id ?? ad.organizationId ?? null,
  });
};

const loadInitialAds = () => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map(hydrateAd);
    }
  } catch (error) {
    console.warn("[SponsorAds] Failed to parse stored ads", error);
  }
  return [];
};

const persistAds = (ads) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
  } catch (error) {
    console.warn("[SponsorAds] Failed to persist ads", error);
  }
};

const matchesTargeting = (ad, options = {}) => {
  const { role, courseCategory, batch } = options;
  if (ad.targetRoles?.length && role && !ad.targetRoles.includes(role)) {
    return false;
  }
  if (
    ad.targetCategories?.length &&
    courseCategory &&
    !ad.targetCategories.includes(courseCategory)
  ) {
    return false;
  }
  if (ad.targetBatches?.length && batch && !ad.targetBatches.includes(batch)) {
    return false;
  }
  return true;
};

const sortByPriority = (a, b) => {
  const tierDelta = (TIER_PRIORITY[b.tier] || 0) - (TIER_PRIORITY[a.tier] || 0);
  if (tierDelta !== 0) return tierDelta;

  const endA = new Date(a.endDate).getTime();
  const endB = new Date(b.endDate).getTime();
  return endA - endB;
};

export const SponsorAdsProvider = ({ children }) => {
  const [ads, setAds] = useState(loadInitialAds);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    persistAds(ads);
  }, [ads]);

  const refreshAds = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) {
      console.log("[SponsorAds] Already loading, skipping duplicate call");
      return;
    }

    try {
      setIsLoading(true);
      setIsSyncing(true);
      const response = await getAllSponsorAds();
      const backendAds = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.ads)
          ? response.ads
          : Array.isArray(response)
            ? response
            : [];
      if (backendAds && backendAds.length) {
        setAds(backendAds.map(normalizeBackendAd));
        setHasLoadedFromBackend(true);
        return backendAds;
      }
      return backendAds;
    } catch (error) {
      console.warn(
        "[SponsorAds] Failed to sync from backend, using local data",
        error,
      );
      if (!hasLoadedFromBackend) {
        setAds(loadInitialAds());
      }
      throw error;
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [hasLoadedFromBackend, isLoading]);

  // Only call once on mount
  useEffect(() => {
    if (!hasInitialLoad) {
      setHasInitialLoad(true);
      refreshAds().catch(() => {
        // already logged; fallback handled by refreshAds
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const addAd = useCallback((adPayload) => {
    setAds((prev) => [hydrateAd(adPayload), ...prev]);
  }, []);

  const updateAd = useCallback(
    async (id, updates = {}) => {
      // Optimistic UI update
      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, ...updates } : ad)),
      );

      // Build payload for backend
      const current = ads.find((ad) => ad.id === id) || {};
      const merged = { ...current, ...updates };

      const payload = {
        title: merged.title,
        description: merged.description,
        linkUrl: merged.ctaUrl,
        sponsorName: merged.sponsorName,
        startDate: merged.startDate,
        endDate: merged.endDate,
        position:
          PLACEMENT_TO_POSITION[merged.placement] ||
          merged.position ||
          "DASHBOARD",
        organizationId: merged.organizationId ?? null,
        mediaFile: merged.mediaUrl,
      };

      await updateSponsorAdApi(id, payload);
      // Re-sync from backend to ensure counts/status are accurate
      await refreshAds();
    },
    [ads, refreshAds],
  );

  const deleteAd = useCallback(async (id) => {
    await deleteSponsorAdApi(id);
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  }, []);

  const toggleAdStatus = useCallback((id) => {
    setAds((prev) =>
      prev.map((ad) => {
        if (ad.id !== id) return ad;
        const currentStatus = applyRuntimeStatus(ad);
        if (currentStatus === "Expired") return ad;
        return {
          ...ad,
          status: ad.status === "Paused" ? "Active" : "Paused",
        };
      }),
    );
  }, []);

  const getActiveAdsByPlacement = useCallback(
    (placement, options = {}) =>
      ads
        .filter((ad) => ad.placement === placement)
        .filter((ad) => applyRuntimeStatus(ad) === "Active")
        .filter((ad) => matchesTargeting(ad, options))
        .sort(sortByPriority),
    [ads],
  );

  const getPrimaryAdForPlacement = useCallback(
    (placement, options = {}) => {
      const active = getActiveAdsByPlacement(placement, options);
      return active[0] || null;
    },
    [getActiveAdsByPlacement],
  );

  const analytics = useMemo(() => {
    const totals = ads.reduce(
      (acc, ad) => {
        // Use real backend data: view_count (impressions) and click_count (clicks)
        const impressions =
          Number(ad.impressions) || Number(ad.view_count) || 0;
        const clicks = Number(ad.clicks) || Number(ad.click_count) || 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

        acc.impressions += impressions;
        acc.clicks += clicks;
        if (applyRuntimeStatus(ad) === "Active") {
          acc.activeAds += 1;
        }
        acc.impressionsByAd.push({
          id: ad.id,
          name: ad.title || ad.sponsorName || "Untitled",
          impressions,
          clicks,
          ctr: Number(ctr.toFixed(2)),
        });
        acc.clicksByAd.push({
          id: ad.id,
          name: ad.title || ad.sponsorName || "Untitled",
          clicks,
        });
        acc.typeDistribution[ad.mediaType] =
          (acc.typeDistribution[ad.mediaType] || 0) + impressions;
        return acc;
      },
      {
        impressions: 0,
        clicks: 0,
        activeAds: 0,
        impressionsByAd: [],
        clicksByAd: [],
        typeDistribution: {},
      },
    );

    const typeDistributionChart = Object.entries(totals.typeDistribution).map(
      ([type, value]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value,
      }),
    );

    // Generate last 7 days data (simplified - in real app, this would come from backend)
    const sevenDaySeries = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - idx));
      const dayTotal = ads.reduce((sum, ad) => {
        // If we have daily data, use it; otherwise distribute evenly
        if (
          Array.isArray(ad.dailyImpressions) &&
          ad.dailyImpressions.length > 0
        ) {
          const value = ad.dailyImpressions[idx % ad.dailyImpressions.length];
          return sum + (value || 0);
        }
        // Distribute impressions evenly across 7 days as fallback
        const avgDaily =
          (Number(ad.impressions) || Number(ad.view_count) || 0) / 7;
        return sum + Math.round(avgDaily);
      }, 0);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        impressions: dayTotal,
      };
    });

    const ctr =
      totals.impressions === 0
        ? 0
        : Number(((totals.clicks / totals.impressions) * 100).toFixed(2));

    return {
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      overallCTR: ctr,
      activeAdsCount: totals.activeAds,
      impressionsByAd: totals.impressionsByAd,
      clicksByAd: totals.clicksByAd,
      typeDistribution: typeDistributionChart,
      dailyImpressions: sevenDaySeries,
    };
  }, [ads]);

  const value = useMemo(
    () => ({
      ads,
      addAd,
      updateAd,
      deleteAd,
      toggleAdStatus,
      getActiveAdsByPlacement,
      getPrimaryAdForPlacement,
      analytics,
      getRuntimeStatus: applyRuntimeStatus,
      refreshAds,
      isSyncing,
    }),
    [
      ads,
      addAd,
      updateAd,
      deleteAd,
      toggleAdStatus,
      getActiveAdsByPlacement,
      getPrimaryAdForPlacement,
      analytics,
      refreshAds,
      isSyncing,
    ],
  );

  return (
    <SponsorAdsContext.Provider value={value}>
      {children}
    </SponsorAdsContext.Provider>
  );
};

export const useSponsorAds = () => {
  const context = useContext(SponsorAdsContext);
  if (!context) {
    throw new Error("useSponsorAds must be used within a SponsorAdsProvider");
  }
  return context;
};
