/**
 * Dynamically determines the API Base URL.
 * - Local dev: uses localhost:8000 (via Vite proxy or direct)
 * - Production (Vercel/APK): uses the deployed Render backend
 */
const PRODUCTION_API = 'https://gari-market-backend.onrender.com';

const getBaseUrl = () => {
    // If environment variable is injected by Vite, use it!
    if (import.meta.env && import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // If we're in a browser/WebView
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;

        // If it's localhost or a local IP, use the current hostname but port 8000
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
            return `http://${hostname}:8000`;
        }
    }

    // Production: use the deployed Render backend
    return PRODUCTION_API;
};

export const API_BASE_URL = getBaseUrl();

