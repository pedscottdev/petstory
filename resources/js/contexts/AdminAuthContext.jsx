import React, { createContext, useContext, useState, useEffect } from 'react';
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
            await httpClient.get('/sanctum/csrf-cookie');
        } catch (error) {
            console.error('Failed to fetch CSRF cookie:', error);
        }
    };

    const checkAdminSession = async () => {
        try {
            const response = await authApi.getUser();
            if (response?.success && response?.data) {
                const user = response.data;
                // Only set admin if the user role is 'admin'
                if (user.role === 'admin') {
                    setAdmin(user);
                    setIsAuthenticated(true);
                    saveAdminToStorage(user);
                } else {
                    // If logged in as user but checking admin session, clear admin state
                    setAdmin(null);
                    setIsAuthenticated(false);
                    removeAdminFromStorage();
                }
            } else {
                // Check if localStorage has admin data
                const stored = localStorage.getItem(STORAGE_KEY);
                if (!stored) {
                    setAdmin(null);
                    setIsAuthenticated(false);
                }
            }
        } catch (error) {
            // If there's an error, check localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                setAdmin(null);
                setIsAuthenticated(false);
            }
            console.error('Admin session check error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            // Fetch CSRF cookie first
            await fetchCsrfCookie();

            // Call admin login API
            const response = await authApi.loginAdmin({ email, password });

            if (response?.success && response?.data?.user) {
                const adminData = response.data.user;
                setAdmin(adminData);
                setIsAuthenticated(true);
                saveAdminToStorage(adminData);
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
            // Call logout API
            await authApi.logout();
        } catch (error) {
            console.error('Admin logout error:', error);
        } finally {
            // Clear admin state
            setAdmin(null);
            setIsAuthenticated(false);
            removeAdminFromStorage();
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Hydrate from localStorage on mount
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedAdmin = JSON.parse(stored);
                setAdmin(parsedAdmin);
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Cannot parse stored admin', e);
        }

        // 2. Check admin session with server
        const initializeAdminAuth = async () => {
            try {
                // Fetch CSRF cookie first
                await fetchCsrfCookie();
                // Then check admin session
                await checkAdminSession();
            } catch (error) {
                console.error('Admin auth initialization failed:', error);
                setLoading(false);
            }
        };
        
        initializeAdminAuth();
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
