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
            timeout: 8000 // 8 seconds timeout
        });

        if (response.data && response.data.records) {
            apiRecords = response.data.records;
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
        const filtered = all.filter(m => m.commodity.toLowerCase() === commodity.toLowerCase());
        return filtered.length > 0 ? filtered : [all[0]]; // Always return something relevant if possible
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
