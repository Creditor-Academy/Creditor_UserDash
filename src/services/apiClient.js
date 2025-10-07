import axios from 'axios';
import { getAccessToken, clearAccessToken } from './tokenService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

export const api = axios.create({
	baseURL: API_BASE,
	withCredentials: true,
});

// Attach bearer token to requests
api.interceptors.request.use((config) => {
	const token = getAccessToken();
	if (token) {
		config.headers = config.headers || {};
		config.headers['Authorization'] = `Bearer ${token}`;
		console.debug('[Auth] Attached access token to request:', { url: config?.url });
	} else {
		console.debug('[Auth] No access token present for request:', { url: config?.url });
	}
	return config;
});

// Handle authentication errors by clearing tokens and forcing logout
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