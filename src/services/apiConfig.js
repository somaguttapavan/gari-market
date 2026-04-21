/**
 * Dynamically determines the API Base URL.
 * When running in a browser (on laptop or mobile), 'window.location.hostname' 
 * points to the laptop's IP address.
 */
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

    // Default fallback
    return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();
