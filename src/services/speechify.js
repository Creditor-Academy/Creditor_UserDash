import api from './apiClient';

// Simple in-memory cache to avoid repeated token requests and dedupe concurrent calls
let cachedToken = null;
let cachedSubdomain = null;
let cachedExpiry = 0; // epoch ms
let pendingPromise = null;

/**
 * Fetch a Text-to-Speech token for Immersive Reader integration.
 * Backend endpoint: GET /api/tts/token
 * Response shape:
 * {
 *   code: 200,
 *   data: { token: string, subdomain: string },
 *   success: true,
 *   message: string
 * }
 */
export async function getTtsToken() {
  const now = Date.now();
  // Return cached token if valid (assume ~45 minutes TTL)
  if (cachedToken && cachedExpiry > now + 5000) {
    return { token: cachedToken, subdomain: cachedSubdomain };
  }
  // Dedupe concurrent calls
  if (pendingPromise) return pendingPromise;

  pendingPromise = (async () => {
    try {
      const response = await api.safeGet('/api/tts/token');
      const payload = response?.data?.data || response?.data || {};
      const token = payload.token || '';
      const subdomain = payload.subdomain || '';
      // Cache for 45 minutes (2700000 ms). If backend has shorter TTL, this can be adjusted.
      cachedToken = token;
      cachedSubdomain = subdomain;
      cachedExpiry = now + 45 * 60 * 1000;
      return { token, subdomain };
    } catch (error) {
      console.error(
        '[Speechify] Failed to fetch TTS token:',
        error.userMessage || error.message
      );
      // Do not cache failures; let caller handle gracefully
      throw error;
    } finally {
      pendingPromise = null;
    }
  })();

  return pendingPromise;
}

export default {
  getTtsToken,
};
