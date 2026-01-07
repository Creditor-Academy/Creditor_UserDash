import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { tokenCache } from "../utils/tokenCache";

/**
 * Custom hook to fetch and cache AI token usage
 * Uses centralized token cache to prevent repeated API calls
 *
 * @param {string} apiEndpoint - API endpoint to fetch from (default: '/api/my-active-organization')
 * @returns {Object} { org, loading, error, noOrg, refresh }
 */
export const useTokenCache = (apiEndpoint = "/api/my-active-organization") => {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noOrg, setNoOrg] = useState(false);

  const fetchTokenStats = useCallback(async () => {
    try {
      // Use token cache to get data with intelligent caching
      const data = await tokenCache.getTokenData(async () => {
        const response = await axios.get(apiEndpoint);
        if (!response.data?.data) {
          throw new Error("No organization data in response");
        }
        return response.data.data;
      });

      setOrg(data);
      setError(null);
      setNoOrg(false);
    } catch (err) {
      console.error("Failed to fetch active org usage:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setNoOrg(true);
        setError("No active organization. Please login again.");
      } else {
        setError("Failed to load AI usage");
      }
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => {
    // Initial fetch
    fetchTokenStats();

    // Refresh every 90 seconds (only if cache has expired)
    const interval = setInterval(() => {
      if (!tokenCache.isCacheValid()) {
        console.log("[useTokenCache] Cache expired, refreshing");
        fetchTokenStats();
      }
    }, 90000);

    // Subscribe to cache updates from other sources (e.g., AI operations)
    const unsubscribe = tokenCache.subscribe((data) => {
      console.log("[useTokenCache] Cache updated, refreshing component", data);
      setOrg(data);
      setLoading(false);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchTokenStats]);

  return {
    org,
    loading,
    error,
    noOrg,
    refresh: fetchTokenStats,
  };
};
