import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // loading trạng thái "đang check server"

    const STORAGE_KEY = 'auth_user';
    const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check session every 5 minutes

    const saveUserToStorage = (userData) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        } catch (e) {
            console.error('Cannot save user to localStorage', e);
        }
    };

    const removeUserFromStorage = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Cannot remove user from localStorage', e);
        }
    };

    const fetchCsrfCookie = async () => {
        try {
            // Use axios directly to avoid /api prefix from httpClient
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true,
                baseURL: ''
            });
        } catch (error) {
            console.error('Failed to fetch CSRF cookie:', error);
        }
    };

    const checkUserSession = async (silent = false) => {
        try {
            const response = await authApi.getUser();
            if (response?.success && response?.data) {
                // Session is valid - update user data
                setUser(response.data);
                setIsAuthenticated(true);
                saveUserToStorage(response.data);
                return true;
            } else {
                // Session is invalid - force logout
                if (!silent) {
                    console.warn('Session expired or invalid');
                }
                setUser(null);
                setIsAuthenticated(false);
                removeUserFromStorage();
                return false;
            }
        } catch (error) {
            // On error (401, 500, etc.), session is invalid - force logout
            if (!silent) {
                console.error('Session validation failed:', error.message);
            }
            setUser(null);
            setIsAuthenticated(false);
            removeUserFromStorage();
            return false;
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            // Clear any existing session/token before login to prevent race conditions
            // This ensures a clean slate when switching between users
            localStorage.removeItem('auth_token');
            localStorage.removeItem(STORAGE_KEY);

            await fetchCsrfCookie();

            const response = await authApi.loginUser({ email, password });

            if (response?.success && response?.data?.user) {
                const userData = response.data.user;
                const token = response.data.token;

                setUser(userData);
                setIsAuthenticated(true);
                saveUserToStorage(userData);

                // Save token to localStorage for Echo.js broadcasting auth
                if (token) {
                    localStorage.setItem('auth_token', token);

                    // Update Echo.js auth headers dynamically
                    try {
                        const { updateAuthToken } = await import('../lib/echo.js');
                        updateAuthToken(token);
                    } catch (error) {
                        console.error('Failed to update Echo auth token:', error);
                    }
                }

                return { success: true };
            } else {
                return { success: false, message: response?.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            // Attempt to call the user-specific logout API
            await authApi.logoutUser();
        } catch (error) {
            // Even if the API call fails, we still want to ensure the user is logged out
            console.error('Logout API error (but proceeding with local logout):', error);
        } finally {
            // Always clear local state regardless of API result
            setUser(null);
            setIsAuthenticated(false);
            removeUserFromStorage();

            // Remove token from localStorage
            localStorage.removeItem('auth_token');

            // Clear Echo.js auth headers
            try {
                const { clearAuthToken } = await import('../lib/echo.js');
                clearAuthToken();
            } catch (error) {
                console.error('Failed to clear Echo auth token:', error);
            }

            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Hydrate từ localStorage trước cho UI mượt
        let hasStoredUser = false;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedUser = JSON.parse(stored);
                setUser(parsedUser);
                setIsAuthenticated(true);
                hasStoredUser = true;
            }
        } catch (e) {
            console.error('Cannot parse stored user', e);
        }

        // 2. Fetch CSRF cookie và kiểm tra session ONLY if there's stored user data AND a token
        // This prevents unnecessary 401 errors during initialization
        const initializeAuth = async () => {
            try {
                const hasToken = !!localStorage.getItem('auth_token');

                // Only check session if we have valid credentials
                if (hasStoredUser && hasToken) {
                    // Luôn fetch CSRF cookie đầu tiên
                    await fetchCsrfCookie();
                    // Sau đó kiểm tra session
                    await checkUserSession();
                } else {
                    // No stored credentials, just set loading to false
                    setLoading(false);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                setLoading(false);
            }
        };

        initializeAuth();

        // 3. Set up periodic session validation
        const sessionCheckInterval = setInterval(async () => {
            // Only check if user is authenticated
            if (localStorage.getItem(STORAGE_KEY)) {
                const isValid = await checkUserSession(true); // silent check
                if (!isValid) {
                    // Session expired - redirect to login if not already there
                    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                        window.location.href = '/login';
                    }
                }
            }
        }, SESSION_CHECK_INTERVAL);

        // Cleanup interval on unmount
        return () => {
            clearInterval(sessionCheckInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Hàm để update user từ API (khi cần refresh info mới)
    const refreshUserFromServer = async () => {
        try {
            const response = await authApi.getUser();
            if (response?.success && response?.data) {
                setUser(response.data);
                saveUserToStorage(response.data);
                return response.data;
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
        return null;
    };

    const value = {
        user,
        setUser,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshUserFromServer,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};