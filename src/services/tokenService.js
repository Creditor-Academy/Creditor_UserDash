import Cookies from 'js-cookie';

export function getAccessToken() {
	// For cross-domain, prioritize localStorage over cookies
	const token = localStorage.getItem('authToken') || localStorage.getItem('token');
	return token || '';
}

export function setAccessToken(token) {
	if (!token) return clearAccessToken();
	
	// Primary storage: localStorage (works across domains)
	localStorage.setItem('authToken', token);
	localStorage.setItem('token', token);
	
	// Optional: Store in cookies for same-domain features (like sidebar)
	// But don't rely on them for authentication
	try {
		Cookies.set('token', token, { 
			expires: 7,
			secure: window.location.protocol === 'https:',
			sameSite: 'lax' // More permissive for cross-domain
		});
	} catch (error) {
		console.warn('Could not set cookie (cross-domain):', error);
	}
	
	// Notify listeners that the token changed
	window.dispatchEvent(new CustomEvent('authTokenUpdated', { detail: token }));
}

export function clearAccessToken() {
	// Clear from localStorage (primary storage)
	localStorage.removeItem('authToken');
	localStorage.removeItem('token');
	
	// Try to clear cookies (may fail on cross-domain)
	try {
		Cookies.remove('token');
		Cookies.remove('userId');
	} catch (error) {
		console.warn('Could not clear cookies (cross-domain):', error);
	}
	
	window.dispatchEvent(new CustomEvent('authTokenCleared'));
}

// Friendly alias requested by product spec
export function storeAccessToken(token) {
	setAccessToken(token);
}

// New function to clear all authentication data
export function clearAllAuthData() {
	clearAccessToken();
	// Clear any other auth-related data
	localStorage.removeItem('userId');
	localStorage.removeItem('userRole');
	localStorage.removeItem('userRoles');
	
	// Try to clear cookies
	try {
		Cookies.remove('userId');
	} catch (error) {
		console.warn('Could not clear userId cookie (cross-domain):', error);
	}
} 