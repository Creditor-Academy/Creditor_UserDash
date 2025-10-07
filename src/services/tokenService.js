import Cookies from 'js-cookie';

export function getAccessToken() {
	// Check localStorage first, then cookies for accesstoken
	const token = localStorage.getItem('authToken') || localStorage.getItem('token') || Cookies.get('accesstoken');
	
	// If token found in cookies, automatically store it in localStorage for future use
	if (!localStorage.getItem('authToken') && !localStorage.getItem('token') && Cookies.get('accesstoken')) {
		const cookieToken = Cookies.get('accesstoken');
		localStorage.setItem('authToken', cookieToken);
		localStorage.setItem('token', cookieToken);
	}
	
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
	// Also remove accesstoken cookie
	Cookies.remove('accesstoken');
	window.dispatchEvent(new CustomEvent('authTokenCleared'));
}

// Friendly alias requested by product spec
export function storeAccessToken(token) {
	setAccessToken(token);
}