import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication on mount
    useEffect(() => {
        profile();
    }, []);

    const profile = async () => {
        try {
            const res = await api.get('/auth/profile');
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.success) {
            setUser(res.data.user);
        }
        return res.data;
    };

    const signup = async (name, email, password) => {
        const res = await api.post('/auth/signup', { name, email, password });
        if (res.data.success) {
            setUser(res.data.user);
        }
        return res.data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    const updateProfile = async (data) => {
        const res = await api.put('/auth/update-profile', data);
        if (res.data.success) {
            setUser(res.data.user);
        }
        return res.data;
    };

    const deleteAccount = async (password) => {
        const res = await api.delete('/auth/delete-account', { data: { password } });
        if (res.data.success) {
            setUser(null);
        }
        return res.data;
    };

    const forgotPassword = async (email) => {
        const res = await api.post('/auth/forgot-password', { email });
        return res.data;
    };

    const resetPassword = async (token, newPassword) => {
        const res = await api.post('/auth/reset-password', { token, newPassword });
        return res.data;
    };

    // TODO: Enable when backend verify-email endpoint is implemented
    // const verifyEmail = async (token) => {
    //     const res = await api.post('/auth/verify-email', { token });
    //     if (res.data.success) {
    //         setUser(res.data.user);
    //     }
    //     return res.data;
    // };

    // TODO: Enable when backend resend-verification endpoint is implemented
    // const resendVerificationEmail = async (email) => {
    //     const res = await api.post('/auth/resend-verification', { email });
    //     return res.data;
    // };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        deleteAccount,
        forgotPassword,
        resetPassword,
        // TODO: Enable when backend endpoints are implemented
        // verifyEmail,
        // resendVerificationEmail,
        profile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}