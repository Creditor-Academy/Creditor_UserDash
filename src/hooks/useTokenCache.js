import { useEffect, useState, useCallback, useRef } from "react";
import api from "../services/apiClient";
import { tokenCache } from "../utils/tokenCache";

/**
 * Custom hook to fetch and cache AI token usage
 * Uses centralized token cache to prevent repeated API calls
 * Handles auth failures with smart retry logic and exponential backoff
 *
 * @param {string} apiEndpoint - API endpoint to fetch from (default: '/api/my-active-organization')
 * @returns {Object} { org, loading, error, noOrg, refresh }
 */
export const useTokenCache = (apiEndpoint = "/api/my-active-organization") => {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noOrg, setNoOrg] = useState(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  const fetchTokenStats = useCallback(
    async (isRetry = false) => {
      try {
        // If auth error detected, clear cache and attempt recovery
        if (tokenCache.isAuthError() && !isRetry) {
          console.log(
            "[useTokenCache] Auth error detected, clearing cache and retrying...",
          );
          tokenCache.clearAuthError();
        }

        // Use token cache to get data with intelligent caching
        const data = await tokenCache.getTokenData(async () => {
          const response = await api.get(apiEndpoint);
          if (!response.data?.data) {
            throw new Error("No organization data in response");
          }
          return response.data.data;
        });

        setOrg(data);
        setError(null);
        setNoOrg(false);
        retryCountRef.current = 0; // Reset retry count on success
      } catch (err) {
        console.error("[useTokenCache] Failed to fetch active org usage:", err);

        const isAuthError =
          err.response?.status === 401 || err.response?.status === 403;

        if (isAuthError) {
          setNoOrg(true);
          setError("Authentication expired. Please refresh the page.");
          tokenCache.clearAuthError();

          // Auto-retry auth errors with exponential backoff
          if (!isRetry && retryCountRef.current < 3) {
            retryCountRef.current++;
            const delayMs = Math.min(
              1000 * Math.pow(2, retryCountRef.current),
              5000,
            );
            console.log(
              `[useTokenCache] Scheduling retry #${retryCountRef.current} in ${delayMs}ms`,
            );
            retryTimeoutRef.current = setTimeout(() => {
              fetchTokenStats(true);
            }, delayMs);
          }
        } else {
          setError("Failed to load AI usage");
        }

        setOrg(null);
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint],
  );

  useEffect(() => {
    // Initial fetch
    fetchTokenStats();

    // Refresh every 90 seconds (only if cache has expired)
    const interval = setInterval(() => {
      if (!tokenCache.isCacheValid()) {
        console.log("[useTokenCache] Cache expired, refreshing");
        retryCountRef.current = 0; // Reset retries on periodic refresh
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
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
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
