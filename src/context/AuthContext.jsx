/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        setTimeout(() => {
            const storedUser = localStorage.getItem('agri_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        }, 0);
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
