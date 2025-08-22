import api from './apiClient';
import { storeAccessToken } from './tokenService';

export async function refreshAccessTokenNow() {
	console.log('[Auth] Manual refresh requested');
	const response = await api.get('/api/auth/refresh');
	const newToken = response.data?.token || response.data?.accessToken || response.data?.data?.token || response.headers?.['x-access-token'];
	if (newToken) {
		storeAccessToken(newToken);
		console.log('[Auth] Manual refresh stored new token');
	}
	return newToken;
}

// Optional: call this after login with expiresIn seconds
let refreshTimerId = null;
export function scheduleProactiveRefresh(expiresInSeconds = 300, skewSeconds = 30) {
	if (refreshTimerId) clearTimeout(refreshTimerId);
	const safeExpires = Number(expiresInSeconds);
	const delay = Math.max(5, ((Number.isNaN(safeExpires) ? 300 : safeExpires) - skewSeconds) * 1000);
	console.log('[Auth] Proactive refresh scheduled in ms:', delay);
	refreshTimerId = setTimeout(async () => {
		try {
			console.log('[Auth] Proactive refresh timer fired');
			await refreshAccessTokenNow();
		} catch (e) {
			console.warn('[Auth] Proactive refresh failed:', e?.message || e);
		}
	}, delay);
}

export function cancelProactiveRefresh() {
	if (refreshTimerId) clearTimeout(refreshTimerId);
	refreshTimerId = null;
	console.log('[Auth] Proactive refresh canceled');
} 