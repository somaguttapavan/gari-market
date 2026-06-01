/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../services/apiConfig';

const AuthContext = createContext();

// ─── Retry helper ────────────────────────────────────────────────────────────
// On pure network errors (no response at all) the Render free-tier server may
// still be waking up. Retry up to MAX_RETRIES times before giving up.
const MAX_RETRIES     = 3;
const RETRY_DELAY_MS  = 5000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const res = await fetch(url, options);
            return res; // Got a real HTTP response — return regardless of status
        } catch (networkErr) {
            const isLast = attempt > retries;
            console.warn(`[Auth] Fetch attempt ${attempt} failed:`, networkErr.message);
            if (isLast) throw networkErr;
            console.log(`[Auth] Retrying in ${RETRY_DELAY_MS / 1000}s…`);
            await sleep(RETRY_DELAY_MS);
        }
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('agri_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading] = useState(false);

    const login = async (credentials) => {
        try {
            const response = await fetchWithRetry(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                let errorMsg = 'Login failed';
                try {
                    const error = await response.json();
                    errorMsg = error.detail || errorMsg;
                } catch {
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
            const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
            return {
                success: false,
                error: isNetworkError
                    ? 'Cannot reach the server. It may still be starting up — please wait a moment and try again.'
                    : err.message,
            };
        }
    };

    const googleLogin = (userData) => {
        console.log('[AuthContext] googleLogin called with:', userData);
        const authData = {
            ...userData,
            token: userData.sub,
            source: 'google',
        };
        localStorage.setItem('agri_user', JSON.stringify(authData));
        setUser(authData);
        console.log('[AuthContext] User state updated to:', authData);
        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem('agri_user');
        setUser(null);
    };

    const register = async (userData) => {
        try {
            const response = await fetchWithRetry(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                let errorMsg = 'Registration failed';
                try {
                    const error = await response.json();
                    errorMsg = error.detail || errorMsg;
                } catch {
                    errorMsg = `Server error (${response.status}): ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            return { success: true };
        } catch (err) {
            console.error('Registration error:', err);
            const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
            return {
                success: false,
                error: isNetworkError
                    ? 'Cannot reach the server. It may still be starting up — please wait a moment and try again.'
                    : err.message,
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, googleLogin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

