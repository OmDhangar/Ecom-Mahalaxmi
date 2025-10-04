import axios from 'axios';

// Define public/non-protected API endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/api/shop/products/get',
  '/api/shop/products/featured',
  '/api/shop/carousel/active',
  '/api/shop/carousel',
  '/api/common/feature/get',
  '/api/common/feature',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/verify-otp',
  '/api/auth/reset-password'
];

// Define endpoints that should not redirect on 401 but may require auth if token exists
const OPTIONAL_AUTH_ENDPOINTS = [
  '/api/auth/check-auth'
];

// Helper function to check if an endpoint is public
const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Helper function to check if an endpoint has optional auth (no redirect on 401)
const isOptionalAuthEndpoint = (url) => {
  return OPTIONAL_AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Create centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000, // Use env timeout or default to 10 seconds
});

// Request interceptor - cookies are automatically sent with requests
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle global errors and responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, request, message } = error;
    
    // Handle different types of errors
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.warn('🔒 Unauthorized access detected');
          
          const requestUrl = error.config?.url || '';
          
          // Handle different types of endpoints
          if (isPublicEndpoint(requestUrl) || isOptionalAuthEndpoint(requestUrl)) {
            // For public endpoints and optional auth endpoints, just log the 401 but don't redirect
            console.log('🔓 401 on public/optional endpoint - no redirect needed');
          } else {
            // Only clear user data and redirect for protected endpoints
            // Clear user data (cookies are cleared by server)
            localStorage.removeItem('user');
            
            // Show toast notification (if toast library is available)
            if (window.showToast) {
              window.showToast('Session expired. Please login again.', 'error');
            }
            
            // Redirect to login page only if not already there
            if (window.location.pathname !== '/auth/login' && 
                !window.location.pathname.startsWith('/auth/')) {
              window.location.href = '/auth/login';
            }
          }
          
          break;
          
        case 403:
          // Forbidden
          if (window.showToast) {
            window.showToast('Access denied. You don\'t have permission to perform this action.', 'error');
          }
          break;
          
        case 404:
          // Not found
          console.warn('🔍 Resource not found');
          break;
          
        case 422:
          // Validation error
          console.warn('📝 Validation error:', data?.message || 'Invalid data provided');
          break;
          
        case 429:
          // Too many requests
          if (window.showToast) {
            window.showToast('Too many requests. Please try again later.', 'warning');
          }
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('🔥 Server error:', status);
          if (window.showToast) {
            window.showToast('Server error occurred. Please try again later.', 'error');
          }
          break;
          
        default:
          console.error('❓ Unexpected error:', status, data?.message || message);
      }
      
      // Return standardized error format
      const errorMessage = data?.message || `HTTP ${status} Error`;
      return Promise.reject(new Error(errorMessage));
      
    } else if (request) {
      // Network error - request was made but no response received
      console.error('🌐 Network error - no response received');
      
      if (window.showToast) {
        window.showToast('Network error. Please check your internet connection.', 'error');
      }
      
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
      
    } else {
      // Something else happened
      console.error('⚠️ Request setup error:', message);
      
      if (window.showToast) {
        window.showToast('An unexpected error occurred.', 'error');
      }
      
      return Promise.reject(new Error(message || 'An unexpected error occurred'));
    }
  }
);

// Helper function to set up toast notifications
// Call this from your main App component to enable toast notifications
export const setupToastNotifications = (toastFunction) => {
  window.showToast = toastFunction;
};

// Helper function to manually clear auth data (useful for logout)
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

// Export the configured Axios instance as default
export default api;
