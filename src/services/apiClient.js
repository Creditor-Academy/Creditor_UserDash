import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://creditor.onrender.com';

export const api = axios.create({
	baseURL: API_BASE,
	withCredentials: true,
});

// Helper: decode and check JWT expiry
function isJwtExpired(token) {
	try {
		const base64Url = token.split('.')[1];
		if (!base64Url) {
			console.warn('[Auth] JWT token missing payload section');
			return true;
		}
		
		// Fix base64 padding
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
		
		// Decode base64
		const decoded = atob(padded);
		const jsonPayload = JSON.parse(decoded);
		
		if (!jsonPayload?.exp) {
			console.warn('[Auth] JWT token missing expiration claim');
			return true;
		}
		
		const expirationTime = jsonPayload.exp * 1000;
		const currentTime = Date.now();
		const isExpired = currentTime >= expirationTime;
		
		// Add some buffer (5 minutes) to avoid edge cases
		const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
		const isExpiredWithBuffer = currentTime >= (expirationTime - bufferTime);
		
		if (isExpiredWithBuffer) {
			console.log('[Auth] JWT token is expired or will expire soon:', {
				expiresAt: new Date(expirationTime).toISOString(),
				currentTime: new Date(currentTime).toISOString(),
				timeUntilExpiry: Math.round((expirationTime - currentTime) / 1000) + ' seconds'
			});
		}
		
		return isExpiredWithBuffer;
	} catch (error) {
		console.error('[Auth] Error parsing JWT token:', error.message);
		return true;
	}
}

// Attach bearer token; if expired by validation, try refresh first
api.interceptors.request.use(async (config) => {
	const token = getAccessToken();
	if (token) {
		// Temporarily disable aggressive token refresh to prevent token clearing
		// TODO: Re-enable once JWT expiration logic is properly tested
		const expired = isJwtExpired(token);
		if (expired) {
			console.warn('[Auth] Access token appears expired, but skipping refresh to prevent token clearing:', config?.url);
			// Don't attempt refresh for now - let the server handle it
		}
		
		config.headers = config.headers || {};
		// Only add Authorization header if we have a token that we can read
		// If backend uses HttpOnly cookies, this won't interfere
		config.headers['Authorization'] = `Bearer ${token}`;
		console.debug('[Auth] Attached access token to request:', { url: config?.url, hasToken: !!token });
	} else {
		// No token found in client storage, rely on HttpOnly cookies sent automatically
		console.debug('[Auth] No access token in client storage, relying on cookie authentication:', { url: config?.url });
	}
	
	// Ensure credentials are sent (cookies will be included automatically)
	config.withCredentials = true;
	
	return config;
});

let isRefreshing = false;
let pendingQueue = [];

async function refreshAccessToken() {
	try {
		console.log('[Auth] Attempting token refresh via GET', `${API_BASE}/api/auth/refresh`);
		const response = await axios.get(`${API_BASE}/api/auth/refresh`, { withCredentials: true });
		const newToken = response.data?.token || response.data?.accessToken || response.data?.data?.token || response.headers?.['x-access-token'];
		if (!newToken) throw new Error('No token in refresh response');
		setAccessToken(newToken);
		console.log('[Auth] Refresh successful. New access token stored.');
		// Respect 14-day refresh validity: if server signals refresh token expired, throw to logout via response interceptor
		return newToken;
	} catch (err) {
		console.error('[Auth] Refresh failed:', {
			status: err?.response?.status,
			data: err?.response?.data,
			message: err?.message,
		});
		
		// Only clear tokens if it's a definitive authentication failure
		// Don't clear tokens for network errors or temporary server issues
		if (err?.response?.status === 401 || err?.response?.status === 403) {
			console.warn('[Auth] Authentication failed during refresh, clearing tokens');
			clearAccessToken();
		} else {
			console.warn('[Auth] Refresh failed due to network/server error, keeping tokens');
		}
		
		throw err;
	}
}

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const status = error.response?.status;
		const isAuthError = status === 401 || status === 403;
		const url = error.config?.url;

		// Only force logout for specific auth-related endpoints, not login attempts or general API calls
		if (isAuthError && url && (
			url.includes('/user/getUserProfile') || 
			url.includes('/auth/refresh') ||
			url.includes('/auth/logout')
		)) {
			console.warn('[Auth] Received', status, 'for', url, '- clearing tokens and forcing logout');
			clearAccessToken();
			// Broadcast logout event
			window.dispatchEvent(new CustomEvent('userLoggedOut'));
			// Navigate to login page
			if (typeof window !== 'undefined') {
				setTimeout(() => { window.location.href = '/login'; }, 0);
			}
		} else if (isAuthError) {
			console.warn('[Auth] Received', status, 'for', url, '- not forcing logout, letting component handle error');
		}

		return Promise.reject(error);
	}
);

export default api;