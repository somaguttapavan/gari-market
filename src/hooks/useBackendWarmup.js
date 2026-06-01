import { useState, useEffect, useRef } from 'react';

const BACKEND_URL = 'https://gari-market-backend.onrender.com';
const PING_TIMEOUT_MS  = 8000;   // Individual request timeout
const RETRY_INTERVAL_MS = 5000;  // How often to retry
const MAX_ATTEMPTS = 15;         // 15 × 5s = 75 seconds max

/**
 * Polls the Render backend until it wakes up from free-tier sleep.
 * Returns:
 *   isChecking – true while we're still trying
 *   isReady    – true once the backend has responded with HTTP 200
 *   retries    – number of ping attempts so far (for UI copy)
 */
export const useBackendWarmup = () => {
    const [isReady, setIsReady]     = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [retries, setRetries]     = useState(0);
    const mountedRef  = useRef(true);
    const timerRef    = useRef(null);
    const attemptsRef = useRef(0);

    useEffect(() => {
        mountedRef.current = true;

        const ping = async () => {
            if (!mountedRef.current) return;

            const controller = new AbortController();
            const timeoutId  = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

            try {
                const res = await fetch(`${BACKEND_URL}/`, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                if (mountedRef.current && res.ok) {
                    console.log('[Warmup] Backend is awake after', attemptsRef.current, 'attempt(s).');
                    setIsReady(true);
                    setIsChecking(false);
                    return; // Done!
                }
            } catch {
                clearTimeout(timeoutId);
                // Still waking up — schedule next retry below
            }

            if (!mountedRef.current) return;

            attemptsRef.current += 1;
            setRetries(attemptsRef.current);

            if (attemptsRef.current < MAX_ATTEMPTS) {
                timerRef.current = setTimeout(ping, RETRY_INTERVAL_MS);
            } else {
                // Gave up after 75s — let the user try anyway and show real error
                console.warn('[Warmup] Backend did not respond after max retries.');
                setIsChecking(false);
            }
        };

        // First ping fires immediately
        ping();

        return () => {
            mountedRef.current = false;
            clearTimeout(timerRef.current);
        };
    }, []);

    return { isReady, isChecking, retries };
};
