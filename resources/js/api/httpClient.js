import axios from "axios";

// Create an axios instance with default configuration
const httpClient = axios.create({
    baseURL: "/api", // Base URL for all API requests
    timeout: 10000, // Request timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true, // Required for Laravel Sanctum session-based authentication
});

// Request interceptor
httpClient.interceptors.request.use(
    (config) => {
        // For Laravel Sanctum, we don't need to manually add Authorization header
        // The session is handled via cookies
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
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