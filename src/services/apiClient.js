import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

export const api = axios.create({
	baseURL: API_BASE,
	withCredentials: true,
});

// Helper: decode and check JWT expiry
function isJwtExpired(token) {
	try {
		const base64Url = token.split('.')[1];
		if (!base64Url) return true;
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
		const jsonPayload = JSON.parse(decodeURIComponent(atob(padded).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
		if (!jsonPayload?.exp) return true;
		return Date.now() >= jsonPayload.exp * 1000;
	} catch {
		return true;
	}
}

// Attach bearer token; if expired by validation, try refresh first
api.interceptors.request.use(async (config) => {
	const token = getAccessToken();
	if (token) {
		const expired = isJwtExpired(token);
		if (expired) {
			console.warn('[Auth] Access token expired (validation). Attempting refresh before request:', config?.url);
			try {
				const newToken = await refreshAccessToken();
				config.headers = config.headers || {};
				config.headers['Authorization'] = `Bearer ${newToken}`;
				console.debug('[Auth] Attached refreshed token to request:', { url: config?.url });
				return config;
			} catch (e) {
				console.error('[Auth] Pre-request refresh failed. Proceeding without token.');
			}
		}
		config.headers = config.headers || {};
		config.headers['Authorization'] = `Bearer ${token}`;
		console.debug('[Auth] Attached access token to request:', { url: config?.url });
	} else {
		console.debug('[Auth] No access token present for request:', { url: config?.url });
	}
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
		clearAccessToken();
		throw err;
	}
}

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		if (!original) throw error;

		const status = error.response?.status;
		const isAuthError = status === 401 || status === 403;
		const notRetried = !original._retry;

		if (isAuthError && notRetried) {
			console.warn('[Auth] Received', status, 'for', original.url, '- attempting refresh');
			original._retry = true;
			if (isRefreshing) {
				console.log('[Auth] Refresh already in progress. Queuing request.');
				return new Promise((resolve, reject) => {
					pendingQueue.push({ resolve, reject });
				})
				.then((token) => {
					original.headers = original.headers || {};
					original.headers['Authorization'] = `Bearer ${token}`;
					return api(original);
				});
			}

			isRefreshing = true;
			try {
				const token = await refreshAccessToken();
				pendingQueue.forEach(({ resolve }) => resolve(token));
				pendingQueue = [];
				original.headers = original.headers || {};
				original.headers['Authorization'] = `Bearer ${token}`;
				console.log('[Auth] Retrying original request after refresh:', original.url);
				return api(original);
			} catch (err) {
				pendingQueue.forEach(({ reject }) => reject(err));
				pendingQueue = [];
				return Promise.reject(err);
			} finally {
				isRefreshing = false;
			}
		}

		// If refresh failed due to refresh token expired (e.g., 401/403/419 with a specific code), perform logout
		// Only force logout for specific endpoints or after multiple failed attempts
		// Don't force logout for group operations as they might have different permission requirements
		if ((status === 401 || status === 403 || status === 419) && 
			(original.url?.includes('/auth/') || original.url?.includes('/user/') || original.url?.includes('/profile')) &&
			!original.url?.includes('/groups/')) {
			console.warn('[Auth] Authorization failed after refresh for auth endpoint. Forcing logout.');
			try {
				const { clearAccessToken } = await import('./tokenService');
				clearAccessToken();
				// Broadcast and redirect if app desires
				window.dispatchEvent(new CustomEvent('userLoggedOut'));
				// Optional: navigate to login page
				if (typeof window !== 'undefined') {
					setTimeout(() => { window.location.href = '/login'; }, 0);
				}
			} catch {}
		} else if ((status === 401 || status === 403 || status === 419) && original.url?.includes('/groups/')) {
			console.warn('[Auth] Authorization failed for group operation. Not forcing logout, letting component handle error.');
		}

		return Promise.reject(error);
	}
);

export default api; 