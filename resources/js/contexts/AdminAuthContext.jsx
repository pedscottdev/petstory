import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import httpClient from '../api/httpClient';
import authApi from '../api/authApi';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const STORAGE_KEY = 'admin_auth_user';
    const TOKEN_KEY = 'admin_auth_token';  // Separate token key for admin
    const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check session every 5 minutes

    const saveAdminToStorage = (adminData) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
        } catch (e) {
            console.error('Cannot save admin to localStorage', e);
        }
    };

    const removeAdminFromStorage = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Cannot remove admin from localStorage', e);
        }
    };

    const fetchCsrfCookie = async () => {
        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true,
                baseURL: ''
            });
        } catch (error) {
            console.error('Failed to fetch CSRF cookie:', error);
        }
    };

    const checkAdminSession = async (silent = false) => {
        try {
            const response = await authApi.getUser();
            if (response?.success && response?.data) {
                const user = response.data;
                // Only set admin if the user role is 'admin'
                if (user.role === 'admin') {
                    setAdmin(user);
                    setIsAuthenticated(true);
                    saveAdminToStorage(user);
                    return true;
                } else {
                    // If logged in as user but checking admin session, clear admin state
                    if (!silent) {
                        console.warn('User is not an admin');
                    }
                    setAdmin(null);
                    setIsAuthenticated(false);
                    removeAdminFromStorage();
                    return false;
                }
            } else {
                // Session is invalid - force logout
                if (!silent) {
                    console.warn('Admin session expired or invalid');
                }
                setAdmin(null);
                setIsAuthenticated(false);
                removeAdminFromStorage();
                return false;
            }
        } catch (error) {
            // On error, session is invalid - force logout
            if (!silent) {
                console.error('Admin session check error:', error.message);
            }
            setAdmin(null);
            setIsAuthenticated(false);
            removeAdminFromStorage();
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
            // Clear any existing admin session/token before login to prevent race conditions
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(STORAGE_KEY);

            // Fetch CSRF cookie first
            await fetchCsrfCookie();

            // Call admin login API
            const response = await authApi.loginAdmin({ email, password });

            if (response?.success && response?.data?.user) {
                const adminData = response.data.user;
                const token = response.data.token;

                setAdmin(adminData);
                setIsAuthenticated(true);
                saveAdminToStorage(adminData);

                // Save token to localStorage for Bearer token authentication
                if (token) {
                    localStorage.setItem(TOKEN_KEY, token);
                }

                return { success: true };
            } else {
                return { success: false, message: response?.message || 'Đăng nhập thất bại' };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.email?.[0] || 'Đăng nhập thất bại';
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            // Call admin-specific logout API
            await authApi.logoutAdmin();
        } catch (error) {
            console.error('Admin logout error:', error);
        } finally {
            // Clear admin state
            setAdmin(null);
            setIsAuthenticated(false);
            removeAdminFromStorage();

            // Clear token from localStorage
            localStorage.removeItem(TOKEN_KEY);

            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Hydrate from localStorage on mount
        let hasStoredAdmin = false;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedAdmin = JSON.parse(stored);
                setAdmin(parsedAdmin);
                setIsAuthenticated(true);
                hasStoredAdmin = true;
            }
        } catch (e) {
            console.error('Cannot parse stored admin', e);
        }

        // 2. Check admin session with server ONLY if there's stored admin data AND a token
        // This prevents unnecessary 401 errors during initialization
        const initializeAdminAuth = async () => {
            try {
                const hasToken = !!localStorage.getItem(TOKEN_KEY);

                // Only check session if we have valid credentials
                if (hasStoredAdmin && hasToken) {
                    // Fetch CSRF cookie first
                    await fetchCsrfCookie();
                    // Then check admin session
                    await checkAdminSession();
                } else {
                    // No stored credentials, just set loading to false
                    setLoading(false);
                }
            } catch (error) {
                console.error('Admin auth initialization failed:', error);
                setLoading(false);
            }
        };

        initializeAdminAuth();

        // 3. Set up periodic session validation
        const sessionCheckInterval = setInterval(async () => {
            // Only check if admin is authenticated
            if (localStorage.getItem(STORAGE_KEY)) {
                const isValid = await checkAdminSession(true); // silent check
                if (!isValid) {
                    // Session expired - redirect to admin login if not already there
                    if (window.location.pathname !== '/admin/login') {
                        window.location.href = '/admin/login';
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

    const value = {
        admin,
        setAdmin,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export default AdminAuthContext;
