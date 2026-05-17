import axios from 'axios';
import { FALLBACK_MARKETS, MOCK_CROPS, MARKET_COORDINATES } from '../data/marketFallbacks';

const API_KEY = '579b464db66ec23bdd000001b73df47ab4804781628ccb38420ee62a';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource';

/**
 * Fetches market prices with fallback support.
 * Returns { data, error }
 */
export const fetchMarketPrices = async (params = {}) => {
    let apiRecords = [];
    let apiError = null;

    try {
        const queryParams = {
            'api-key': API_KEY,
            format: 'json',
            limit: 500 // Increased for better regional coverage
        };

        if (params.commodity) {
            queryParams['filters[commodity]'] = params.commodity;
        }

        const response = await axios.get(`${BASE_URL}/${RESOURCE_ID}`, {
            params: queryParams,
            timeout: 15000 // INCREASED FROM 8000 to fix slow server issue
        });

        if (response.data && response.data.records) {
            apiRecords = response.data.records;
            
            // STRICT FILTERING: Gov API sometimes ignores filters and returns all crops.
            if (params.commodity) {
                apiRecords = apiRecords.filter(record => 
                    record.commodity && 
                    record.commodity.toLowerCase().includes(params.commodity.toLowerCase())
                );
            }
        }
    } catch (error) {
        console.error('Error fetching market prices:', error);
        apiError = error.code === 'ECONNABORTED' ? 'Market server is slow. Showing offline data.' : 'Network error. Showing offline data.';
    }

    // Always merge with fallbacks for better coverage in major cities
    const fallbackRecords = getFallbackMarkets(params.commodity);

    // De-duplicate: If a market exists in both, prefer API record but keep fallbacks that are missing
    const combined = [...apiRecords];
    fallbackRecords.forEach(fb => {
        const exists = apiRecords.some(api =>
            api.market.toLowerCase() === fb.market.toLowerCase() &&
            api.commodity.toLowerCase() === fb.commodity.toLowerCase()
        );
        if (!exists) combined.push(fb);
    });

    return { data: combined, error: apiError };
};

const getFallbackMarkets = (commodity) => {
    const all = [...FALLBACK_MARKETS];

    // Add dynamic mocks if they don't exist
    MOCK_CROPS.forEach(c => {
        if (!all.find(m => m.commodity.toLowerCase() === c.toLowerCase())) {
            all.push({
                market: 'Regional Mandi',
                district: 'Local District',
                state: 'Near You',
                commodity: c,
                modal_price: (Math.floor(Math.random() * 2000) + 1000).toString()
            });
        }
    });

    if (commodity) {
        const filtered = all.filter(m => m.commodity.toLowerCase().includes(commodity.toLowerCase()));
        return filtered; // Return empty array if no matches, don't return random crops!
    }
    return all;
};

// Real Haversine distance calculation
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;

    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

export const getMarketCoords = (record) => {
    const { market, district, state } = record;
    const searchTerms = [market, district, state];

    for (const term of searchTerms) {
        if (!term) continue;
        const normalizedTerm = term.toLowerCase().trim();
        for (const key in MARKET_COORDINATES) {
            const normalizedKey = key.toLowerCase();
            if (normalizedTerm.includes(normalizedKey) || normalizedKey.includes(normalizedTerm) ||
                (normalizedTerm.startsWith('banglor') && normalizedKey.startsWith('bangalore')) ||
                (normalizedTerm.startsWith('hyd') && normalizedKey.startsWith('hyderabad'))) {
                return MARKET_COORDINATES[key];
            }
        }
    }
    return null;
};

// Travel expense calculation
export const calculateTravelExpense = (distance) => {
    const ratePerKm = 10;
    return distance * ratePerKm;
};

// ─── OpenStreetMap Geocoding with LocalStorage Cache ───────────────────────

const GEOCACHE_KEY = 'agrigrowth_geocache_v1';

export const getGeocodeCache = () => {
    try {
        const raw = localStorage.getItem(GEOCACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

export const saveGeocodeCache = (key, coords) => {
    try {
        const cache = getGeocodeCache();
        cache[key] = coords;
        localStorage.setItem(GEOCACHE_KEY, JSON.stringify(cache));
    } catch {
        // LocalStorage might be full or unavailable, silently ignore
    }
};

/**
 * Fetches exact GPS coordinates from OpenStreetMap Nominatim for a given market.
 * Returns { lat, lon } on success, or null on failure.
 * NOTE: Nominatim allows max 1 request/second. Always use rate-limiting on callers!
 */
export const fetchGeocode = async (market, district, state, country = 'India') => {
    // Build a progressively specific search query
    const queries = [
        `${market}, ${district}, ${state}, ${country}`,
        `${district}, ${state}, ${country}`,
    ];

    for (const query of queries) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
            const res = await fetch(url, {
                headers: { 'Accept-Language': 'en', 'User-Agent': 'AgriGrowth-App/1.0' }
            });
            if (!res.ok) continue;
            const data = await res.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
        } catch {
            // Network error, try next query
        }
    }
    return null; // Could not geocode this market
};
