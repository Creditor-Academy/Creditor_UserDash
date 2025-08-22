export function getAccessToken() {
	const token = localStorage.getItem('authToken') || localStorage.getItem('token');
	return token || '';
}

export function setAccessToken(token) {
	if (!token) return clearAccessToken();
	localStorage.setItem('authToken', token);
	localStorage.setItem('token', token);
	// Notify listeners that the token changed
	window.dispatchEvent(new CustomEvent('authTokenUpdated', { detail: token }));
}

export function clearAccessToken() {
	localStorage.removeItem('authToken');
	localStorage.removeItem('token');
	window.dispatchEvent(new CustomEvent('authTokenCleared'));
}

// Friendly alias requested by product spec
export function storeAccessToken(token) {
	setAccessToken(token);
} 