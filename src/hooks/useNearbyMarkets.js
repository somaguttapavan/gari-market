import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMarketPrices, calculateDistance, getMarketCoords, calculateTravelExpense } from '../services/marketService';

const STATE_CAPITALS = {
    'Tamil Nadu': { lat: 13.0827, lon: 80.2707 },
    'Andhra Pradesh': { lat: 17.6868, lon: 83.2185 },
    'Kerala': { lat: 8.5241, lon: 76.9366 },
    'Karnataka': { lat: 12.9716, lon: 77.5946 },
    'Telangana': { lat: 17.3850, lon: 78.4867 },
    'Maharashtra': { lat: 19.0760, lon: 72.8777 },
    'Odisha': { lat: 20.2961, lon: 85.8245 }
};

export const useNearbyMarkets = (location, userState, detectedCrop, manualState) => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawRecords, setRawRecords] = useState([]);

    // 1. Fetch Data (Only depends on detectedCrop)
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const { data, error: apiError } = await fetchMarketPrices({ commodity: detectedCrop });
                if (isMounted) {
                    if (apiError) console.warn("API Error:", apiError);
                    setRawRecords(data || []);
                    // Don't set error here to fail hard, just log or show partial?
                    // actually if fallbacks are returned, error might be set.
                }
            } catch (err) {
                if (isMounted) setError("Failed to load market data.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [detectedCrop]);

    // 2. Process Data (Depends on location, manualState, userState, and rawRecords)
    const processedMarkets = useMemo(() => {
        if (!rawRecords.length && loading) return []; // processing...

        const effectiveState = manualState || userState;
        const userLat = location?.lat;
        const userLon = location?.lon;
        const effectiveLat = manualState && STATE_CAPITALS[manualState] ? STATE_CAPITALS[manualState].lat : userLat;
        const effectiveLon = manualState && STATE_CAPITALS[manualState] ? STATE_CAPITALS[manualState].lon : userLon;

        const mapped = rawRecords.map(record => {
            const marketCoords = getMarketCoords(record);
            let distance;

            if (effectiveLat && marketCoords) {
                distance = calculateDistance(effectiveLat, effectiveLon, marketCoords.lat, marketCoords.lon);
            } else if (effectiveState && record.state) {
                const normUser = effectiveState.toLowerCase().replace('state', '').trim();
                const recordState = record.state.toLowerCase();
                // Logic from previous version
                if (recordState.includes(normUser)) {
                    const hash = record.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    distance = (hash % 60) + 20;
                } else {
                    distance = 999;
                }
            } else {
                const hash = record.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                distance = (hash % 80) + 120;
            }

            return {
                ...record,
                distance,
                travelExpense: calculateTravelExpense(distance)
            };
        });

        // Filter and Sort
        let final;
        if (effectiveState) {
            const normUser = effectiveState.toLowerCase().replace('state', '').trim();
            const stateMarkets = mapped.filter(m => {
                if (!m.state) return false;
                return m.state.toLowerCase().includes(normUser);
            }).sort((a, b) => a.distance - b.distance);

            if (stateMarkets.length > 0) {
                final = stateMarkets;
            } else {
                final = mapped.filter(m => m.distance <= 110).sort((a, b) => a.distance - b.distance);
                if (final.length === 0) final = mapped.slice(0, 15);
            }
        } else {
            final = mapped.filter(m => m.distance <= 110).sort((a, b) => a.distance - b.distance);
            if (final.length === 0) final = mapped.slice(0, 15);
        }

        return final;

    }, [rawRecords, loading, location, manualState, userState]);

    useEffect(() => {
        setMarkets(processedMarkets);
    }, [processedMarkets]);

    // Payload to trigger refresh
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data, error } = await fetchMarketPrices({ commodity: detectedCrop });
                if (isMounted) {
                    setRawRecords(data || []);
                    if (error) setError(error); // Pass warning as error?
                    else setError(null);
                }
            } catch (e) {
                if (isMounted) setError("Failed.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [detectedCrop, refreshTrigger]);

    return { markets, loading, error, refresh: () => setRefreshTrigger(p => p + 1) };
};
