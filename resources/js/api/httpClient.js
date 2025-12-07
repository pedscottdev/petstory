import axios from "axios";

/**
 * Helper function to get auth token from localStorage
 * This token is used for Bearer token authentication
 * Uses separate tokens for admin and user to prevent conflicts
 */
const getAuthToken = () => {
    // Check if on admin pages - use admin token
    const isAdminArea = window.location.pathname.startsWith('/admin');
    
    if (isAdminArea) {
        return localStorage.getItem('admin_auth_token') || '';
    }
    
    // For user pages, use user token
    return localStorage.getItem('auth_token') || '';
};

const httpClient = axios.create({
    baseURL: "/api",
    timeout: 30000, 
    headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest", 
    },
    withCredentials: true,
});

// Request interceptor - Fetch CSRF token and add Authorization header
httpClient.interceptors.request.use(
    async (config) => {
        // Fetch CSRF cookie if not present
        if (!document.cookie.includes('XSRF-TOKEN')) {
            try {
                await axios.get('/sanctum/csrf-cookie', {
                    withCredentials: true
                });
            } catch (error) {
                console.error('Failed to fetch CSRF cookie:', error);
            }
        }
        
        // Add Authorization header with Bearer token (if available)
        // This ensures token-based auth works even when session cookies are stale
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
httpClient.interceptors.response.use(
    (response) => {
        // Return only the data part of the response
        return response.data;
    },
    (error) => {
        // Handle common error responses
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized
                    // Don't auto-redirect on authentication endpoints and session checks
                    // Allow login pages (/login, /admin/login) and API endpoints to handle their own errors
                    if (
                        window.location.pathname !== "/login" &&
                        window.location.pathname !== "/admin/login" &&
                        window.location.pathname !== "/signup" &&
                        !error.config.url.includes('/user') &&
                        !error.config.url.includes('/auth/login') &&
                        !error.config.url.includes('/auth/admin-login') &&
                        !error.config.url.includes('/auth/register') &&
                        !error.config.url.includes('/auth/generate-otp') &&
                        !error.config.url.includes('/auth/verify-otp')
                    ) {
                        // Check if user is in admin area
                        const isAdminArea = window.location.pathname.startsWith('/admin');
                        
                        // Check if admin is authenticated by looking at localStorage
                        const adminAuth = localStorage.getItem('admin_auth_user');
                        
                        // Redirect to appropriate login page
                        if (isAdminArea || adminAuth) {
                            window.location.href = "/admin/login";
                        } else {
                            window.location.href = "/login";
                        }
                    }
                    break;
                case 403:
                    // Forbidden - show appropriate message
                    console.error("Access forbidden");
                    break;
                case 422:
                    // Validation errors
                    console.error("Validation failed", error.response.data);
                    break;
                case 500:
                    // Server error
                    console.error("Server error occurred");
                    break;
                default:
                    console.error("An error occurred", error.response.data);
            }
        } else if (error.request) {
            // Network error
            console.error("Network error occurred");
        } else {
            // Other errors
            console.error("Error", error.message);
        }

        return Promise.reject(error);
    }
);

export default httpClient;