import Cookies from 'js-cookie';

export function getAccessToken() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return token || '';
}

export function setAccessToken(token) {
    if (!token) return clearAccessToken();
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    window.dispatchEvent(new CustomEvent('authTokenUpdated', { detail: token }));
}

export function clearAccessToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('authTokenCleared'));
}

export function saveLoginTime() {
    const now = new Date().toISOString();
    localStorage.setItem('loginTime', now);
    return now;
}

export function isAuthenticated() {
    const token = getAccessToken();
    const loginTime = localStorage.getItem('loginTime');
    
    if (!token || !loginTime) return false;
    
    // Optional: Add token expiration check if needed
    // const loginDate = new Date(loginTime);
    // const now = new Date();
    // const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60);
    // return hoursSinceLogin < 24; // Example: 24-hour session
    
    return true;
}

export function storeAccessToken(token) {
    setAccessToken(token);
}