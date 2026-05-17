import { useState, useEffect, useRef, useCallback } from 'react';
import {
    fetchMarketPrices,
    calculateDistance,
    getMarketCoords,
    calculateTravelExpense,
    getGeocodeCache,
    saveGeocodeCache,
    fetchGeocode
} from '../services/marketService';

const MAX_DISTANCE_KM = 150;
const GEOCODE_INTERVAL_MS = 1100; // 1.1s between calls to respect Nominatim's 1 req/s limit

const makeGeoKey = (market, district, state) =>
    `${market}|${district}|${state}`.toLowerCase().replace(/\s+/g, '_');

export const useNearbyMarkets = (location, userState, detectedCrop, manualState, address) => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawRecords, setRawRecords] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Geocode cache in React state so updates trigger re-render
    const [geocodeCache, setGeocodeCache] = useState(() => getGeocodeCache());
    // Queue of records that still need geocoding
    const geocodeQueue = useRef([]);
    const geocodeTimerRef = useRef(null);
    const isMountedRef = useRef(true);

    // ── 1. Fetch raw market records from Government API ─────────────────────
    useEffect(() => {
        isMountedRef.current = true;
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            let resultData = [];
            let resultError = null;
            try {
                const { data, error: apiError } = await fetchMarketPrices({
                    commodity: detectedCrop
                });
                resultData = data;
                resultError = apiError;

                if (isMounted) {
                    if (apiError) console.warn('API Error:', apiError);
                    setRawRecords(data || []);
                    setError(apiError || null);
                }
            } catch {
                if (isMounted) setError('Failed to load market data.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            isMountedRef.current = false;
        };
    }, [detectedCrop, refreshTrigger]);

    // ── 2. Background geocoding queue processor ──────────────────────────────
    const processGeocodeQueue = useCallback(async () => {
        if (geocodeQueue.current.length === 0) return;

        const record = geocodeQueue.current.shift();
        const key = makeGeoKey(record.market, record.district, record.state);

        // Double-check it wasn't cached by a parallel call
        const latestCache = getGeocodeCache();
        if (latestCache[key]) {
            setGeocodeCache({ ...latestCache });
            // Schedule next immediately
            if (geocodeQueue.current.length > 0 && isMountedRef.current) {
                geocodeTimerRef.current = setTimeout(processGeocodeQueue, GEOCODE_INTERVAL_MS);
            }
            return;
        }

        const coords = await fetchGeocode(record.market, record.district, record.state);

        if (coords && isMountedRef.current) {
            saveGeocodeCache(key, coords);
            setGeocodeCache(getGeocodeCache()); // Trigger re-render with new coords
        } else if (coords === null && isMountedRef.current) {
            // Mark as "not found" so we don't retry every time
            saveGeocodeCache(key, 'NOT_FOUND');
        }

        // Schedule the next item
        if (geocodeQueue.current.length > 0 && isMountedRef.current) {
            geocodeTimerRef.current = setTimeout(processGeocodeQueue, GEOCODE_INTERVAL_MS);
        }
    }, []);

    // ── 3. Process raw records → compute distances, queue unknowns ───────────
    useEffect(() => {
        if (!rawRecords.length && loading) return;

        const userLat = location?.lat;
        const userLon = location?.lon;
        const newQueue = [];
        const latestCache = getGeocodeCache();

        const mapped = rawRecords.map(record => {
            const key = makeGeoKey(record.market, record.district, record.state);

            // Priority 1: Exact GPS from our hardcoded database
            const hardcodedCoords = getMarketCoords(record);
            if (hardcodedCoords && userLat && userLon) {
                const dist = calculateDistance(userLat, userLon, hardcodedCoords.lat, hardcodedCoords.lon);
                return {
                    ...record,
                    distance: dist,
                    distanceExact: true,
                    travelExpense: calculateTravelExpense(dist)
                };
            }

            // Priority 2: Cached geocode result from OpenStreetMap
            const cached = latestCache[key];
            if (cached && cached !== 'NOT_FOUND' && userLat && userLon) {
                const dist = calculateDistance(userLat, userLon, cached.lat, cached.lon);
                return {
                    ...record,
                    distance: dist,
                    distanceExact: true,
                    travelExpense: calculateTravelExpense(dist)
                };
            }

            // Priority 3: Queue it for background geocoding
            if (cached !== 'NOT_FOUND') {
                newQueue.push(record);
            }

            // While waiting for geocode: estimate if in same state, else skip
            let estimatedDist = null;
            if (userState && record.state && record.state.toLowerCase().includes(userState.toLowerCase())) {
                const hash = record.market.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                estimatedDist = (hash % 110) + 30;
            }

            return {
                ...record,
                distance: estimatedDist,
                distanceExact: false,
                distancePending: cached !== 'NOT_FOUND',
                travelExpense: estimatedDist !== null ? calculateTravelExpense(estimatedDist) : null
            };
        });

        // Filter: keep markets with exact distance ≤ 150km, or estimated distance ≤ 150km
        const final = mapped
            .filter(m => m.distance !== null && m.distance <= MAX_DISTANCE_KM)
            .sort((a, b) => {
                // Exact distances always sort above estimated ones
                if (a.distanceExact && !b.distanceExact) return -1;
                if (!a.distanceExact && b.distanceExact) return 1;
                return a.distance - b.distance;
            });

        setMarkets(final);

        // Update the queue and kick off geocoding if not already running
        if (newQueue.length > 0) {
            geocodeQueue.current = newQueue;
            if (!geocodeTimerRef.current) {
                geocodeTimerRef.current = setTimeout(processGeocodeQueue, 500);
            }
        }

        return () => {
            clearTimeout(geocodeTimerRef.current);
            geocodeTimerRef.current = null;
        };
    }, [rawRecords, loading, location, userState, geocodeCache, processGeocodeQueue]);

    return {
        markets,
        loading,
        error,
        refresh: () => {
            geocodeQueue.current = [];
            clearTimeout(geocodeTimerRef.current);
            geocodeTimerRef.current = null;
            setRefreshTrigger(p => p + 1);
        }
    };
};
