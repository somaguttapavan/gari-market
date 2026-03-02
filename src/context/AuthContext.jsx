/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('agri_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading] = useState(false);

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
