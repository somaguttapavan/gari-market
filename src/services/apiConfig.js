/**
 * Dynamically determines the API Base URL.
 * - Local dev (localhost): uses Vite proxy -> localhost:8000
 * - LAN dev (nip.io domain): extracts embedded IP, calls port 8000 directly
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

        // nip.io domain: hostname like "10.221.48.129.nip.io" embeds the real LAN IP
        // Extract the IP and talk directly to backend on port 8000
        if (hostname.endsWith('.nip.io')) {
            const embeddedIP = hostname.replace('.nip.io', '');
            return `http://${embeddedIP}:8000`;
        }

        // Direct local IP or localhost — use current hostname on port 8000
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
            return `http://${hostname}:8000`;
        }
    }

    // Production: use the deployed Render backend
    return PRODUCTION_API;
};

export const API_BASE_URL = getBaseUrl();
