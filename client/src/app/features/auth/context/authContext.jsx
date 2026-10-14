import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    loginUser as apiLoginUser,
    registerUser as apiRegisterUser,
    logoutUser as apiLogoutUser,
    getMe as apiGetMe,
} from '../services/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiGetMe();
            const userData = response?.data || null;
            setUser(userData);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (credentials) => {
        try {
            setError(null);
            const response = await apiLoginUser(credentials);
            const userData = response?.data || { email: credentials.email };
            setUser(userData);
            return response;
        } catch (err) {
            const msg = err.message || (err.details ? err.details.map(d => d.message).join(', ') : 'Login failed');
            setError(msg);
            throw { message: msg, ...err };
        }
    }, []);

    const register = useCallback(async (payload) => {
        try {
            setError(null);
            const response = await apiRegisterUser(payload);
            return response;
        } catch (err) {
            const msg = err.message || (err.details ? err.details.map(d => d.message).join(', ') : 'Registration failed');
            setError(msg);
            throw { message: msg, ...err };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setError(null);
            await apiLogoutUser();
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setUser(null);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        clearError,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
