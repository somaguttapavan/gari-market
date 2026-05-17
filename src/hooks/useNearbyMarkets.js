import { useState, useEffect, useMemo } from 'react';
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

export const useNearbyMarkets = (location, userState, detectedCrop, manualState, address) => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawRecords, setRawRecords] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch Data
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            let resultData = [];
            let resultError = null;
            try {
                // userState is directly updated by LiveMarket if overridden
                const effectiveState = userState;
                const { data, error: apiError } = await fetchMarketPrices({ 
                    commodity: detectedCrop,
                    state: effectiveState
                });
                resultData = data;
                resultError = apiError;

                if (isMounted) {
                    if (apiError) console.warn("API Error:", apiError);
                    setRawRecords(data || []);
                    if (apiError) setError(apiError);
                    else setError(null);
                }
            } catch {
                if (isMounted) setError("Failed to load market data.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                    // If we have no records and no error, use fallbacks
                    if (!resultData?.length && !resultError) {
                        setRawRecords([]);
                    }
                }
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [detectedCrop, refreshTrigger]);

    // Process Data
    const processedMarkets = useMemo(() => {
        if (!rawRecords.length && loading) return [];

        const userLat = location?.lat;
        const userLon = location?.lon;
        const effectiveLat = userLat;
        const effectiveLon = userLon;

        const mapped = rawRecords.map(record => {
            const marketCoords = getMarketCoords(record);
            let distance;

            if (effectiveLat && marketCoords) {
                distance = calculateDistance(effectiveLat, effectiveLon, marketCoords.lat, marketCoords.lon);
            } else if (address && record.district) {
                const normAddress = address.toLowerCase();
                const recordDistrict = record.district.toLowerCase();
                // If the market is in the user's city/district, it's very close (5 to 25 km)
                if (normAddress.includes(recordDistrict) || recordDistrict.includes(normAddress.split(',')[0].trim())) {
                    const hash = record.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    distance = (hash % 20) + 5;
                } else {
                    distance = 9999;
                }
            } else {
                distance = 9999;
            }

            return {
                ...record,
                distance,
                travelExpense: calculateTravelExpense(distance)
            };
        });

        // Filter and Sort
        // User Request: strict 150 km only
        let final = mapped
            .filter(m => m.distance >= 0 && m.distance <= 150)
            .sort((a, b) => a.distance - b.distance);

        return final;
    }, [rawRecords, loading, location, userState, address]);

    useEffect(() => {
        setMarkets(processedMarkets);
    }, [processedMarkets]);

    return { markets, loading, error, refresh: () => setRefreshTrigger(p => p + 1) };
};
