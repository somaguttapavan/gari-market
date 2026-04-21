/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../services/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('agri_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading] = useState(false);

    const login = async (credentials) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                let errorMsg = 'Login failed';
                try {
                    const error = await response.json();
                    errorMsg = error.detail || errorMsg;
                } catch (e) {
                    errorMsg = `Server error (${response.status}): ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            const userData = await response.json();
            localStorage.setItem('agri_user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('agri_user');
        setUser(null);
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                let errorMsg = 'Registration failed';
                try {
                    const error = await response.json();
                    errorMsg = error.detail || errorMsg;
                } catch (e) {
                    errorMsg = `Server error (${response.status}): ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            return { success: true };
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, error: err.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
