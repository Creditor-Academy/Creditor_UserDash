/**
 * Cookie Service for secure cross-tab authentication
 * This service manages authentication cookies to prevent token leakage through URLs
 */

export const cookieService = {
  /**
   * Set authentication cookie for SCORM access
   * @param {string} token - Authentication token
   * @param {number} expirationMinutes - Cookie expiration in minutes (default: 30)
   */
  setAuthCookie(token, expirationMinutes = 30) {
    if (!token) {
      console.warn('No token provided to setAuthCookie');
      return;
    }

    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (expirationMinutes * 60 * 1000));
    
    // Set secure cookie for SCORM authentication
    document.cookie = `scorm_auth=${encodeURIComponent(token)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
    
    console.log('SCORM auth cookie set successfully');
  },

  /**
   * Get authentication cookie value
   * @returns {string|null} - Authentication token or null if not found
   */
  getAuthCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'scorm_auth') {
        return decodeURIComponent(value);
      }
    }
    return null;
  },

  /**
   * Clear authentication cookie
   */
  clearAuthCookie() {
    document.cookie = 'scorm_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
    console.log('SCORM auth cookie cleared');
  },

  /**
   * Check if authentication cookie exists and is valid
   * @returns {boolean} - True if valid cookie exists
   */
  hasValidAuthCookie() {
    const token = this.getAuthCookie();
    return token && token.length > 0;
  }
};

export default cookieService;
