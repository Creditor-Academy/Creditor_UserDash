import axios from 'axios';

const ACCESS_TOKEN_KEY = 'token';
const LOGIN_TIME_KEY = 'loginTime';
const REFRESH_ENDPOINT = 'https://creditor-backend-1-iijy.onrender.com/api/auth/refresh';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://creditor-backend-1-iijy.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, add to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
      .then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      })
      .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(REFRESH_ENDPOINT, {}, { withCredentials: true });
      
      if (response.data.accessToken) {
        const newToken = response.data.accessToken;
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        
        // Update the auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Process the queue
        processQueue(null, newToken);
        
        // Retry the original request
        return api(originalRequest);
      }
      
      throw new Error('No access token in response');
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      // Clear auth data and redirect to login
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(LOGIN_TIME_KEY);
      window.dispatchEvent(new Event('tokenRefreshFailed'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Save login time when user logs in
const saveLoginTime = () => {
  const loginTime = Date.now();
  localStorage.setItem(LOGIN_TIME_KEY, loginTime.toString());
  console.log(`[${new Date().toLocaleTimeString()}] � Login successful!`);
  return loginTime;
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Logout function
const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(LOGIN_TIME_KEY);
  delete api.defaults.headers.common['Authorization'];
  window.dispatchEvent(new Event('tokenRefreshFailed'));
};

export { 
  api,
  saveLoginTime, 
  isAuthenticated,
  logout
};
