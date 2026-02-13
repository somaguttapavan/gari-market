/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('agri_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("AuthContext: Error parsing stored user", e);
                localStorage.removeItem('agri_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('agri_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('agri_user');
        setUser(null);
    };

    const register = (userData) => {
        // For simulation, we just save the user and log them in
        localStorage.setItem('agri_user_data', JSON.stringify(userData));
        // We don't log them in immediately as per user request: "register -> message -> login"
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
