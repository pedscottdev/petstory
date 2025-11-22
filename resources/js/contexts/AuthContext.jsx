import React, { createContext, useContext, useState, useEffect } from 'react';
import httpClient from '../api/httpClient';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

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
            await httpClient.get('/sanctum/csrf-cookie');
        } catch (error) {
            console.error('Failed to fetch CSRF cookie:', error);
        }
    };

    const checkUserSession = async () => {
        try {
            const response = await authApi.getUser();
            if (response?.success && response?.data) {
                setUser(response.data);
                setIsAuthenticated(true);
                saveUserToStorage(response.data);
            } else {
                // Nếu API không trả về success, nhưng localStorage vẫn có user
                // thì giữ user từ localStorage (session có thể vẫn hoạt động)
                const stored = localStorage.getItem(STORAGE_KEY);
                if (!stored) {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
        } catch (error) {
            // Nếu có lỗi, kiểm tra xem có localStorage không
            const stored = localStorage.getItem(STORAGE_KEY);
            
            // Nếu không có localStorage thì clear user state
            // Nếu có localStorage thì giữ user (session có thể vẫn đãng nhập)
            if (!stored) {
                setUser(null);
                setIsAuthenticated(false);
            }
            
            // Chỉ log lỗi nếu có localStorage (sở hữu có user nhưng session không hợp lệ)
            if (stored) {
                console.error('Session validation failed, but user data exists in localStorage:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            await fetchCsrfCookie();

            const response = await authApi.loginUser({ email, password });

            if (response?.success && response?.data?.user) {
                const userData = response.data.user;
                setUser(userData);
                setIsAuthenticated(true);
                saveUserToStorage(userData);
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
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            removeUserFromStorage();
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Hydrate từ localStorage trước cho UI mượt
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedUser = JSON.parse(stored);
                setUser(parsedUser);
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Cannot parse stored user', e);
        }

        // 2. Fetch CSRF cookie và kiểm tra session
        const initializeAuth = async () => {
            try {
                // Luôn fetch CSRF cookie đầu tiên
                await fetchCsrfCookie();
                // Sau đó kiểm tra session
                await checkUserSession();
            } catch (error) {
                console.error('Auth initialization failed:', error);
                setLoading(false);
            }
        };
        
        initializeAuth();
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

export default AuthContext;
