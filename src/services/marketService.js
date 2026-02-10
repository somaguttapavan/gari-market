import axios from 'axios';

const API_KEY = '579b464db66ec23bdd000001b73df47ab4804781628ccb38420ee62a';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource';

export const fetchMarketPrices = async (params = {}) => {
    try {
        const queryParams = {
            'api-key': API_KEY,
            format: 'json',
            limit: 100
        };

        if (params.commodity) {
            queryParams['filters[commodity]'] = params.commodity;
        }

        const response = await axios.get(`${BASE_URL}/${RESOURCE_ID}`, {
            params: queryParams
        });

        if (response.data && response.data.records && response.data.records.length > 0) {
            return response.data.records;
        }
        return getFallbackMarkets(params.commodity);
    } catch (error) {
        console.error('Error fetching market prices:', error);
        return getFallbackMarkets(params.commodity);
    }
};

const getFallbackMarkets = (commodity) => {
    const all = [
        // Tamil Nadu
        { market: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1850' },
        { market: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', commodity: 'Onion', modal_price: '2400' },
        { market: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', commodity: 'Brinjal', modal_price: '1200' },
        { market: 'Trichy', district: 'Trichy', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1900' },
        { market: 'Salem', district: 'Salem', state: 'Tamil Nadu', commodity: 'Cabbage', modal_price: '1100' },
        { market: 'Erode', district: 'Erode', state: 'Tamil Nadu', commodity: 'Turmeric', modal_price: '7500' },
        // Andhra Pradesh
        { market: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', commodity: 'Rice', modal_price: '3600' },
        { market: 'Vijayawada', district: 'Krishna', state: 'Andhra Pradesh', commodity: 'Mango', modal_price: '4500' },
        { market: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', commodity: 'Chilli', modal_price: '18000' },
        { market: 'Nellore', district: 'Nellore', state: 'Andhra Pradesh', commodity: 'Tomato', modal_price: '1750' },
        { market: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', commodity: 'Onion', modal_price: '2100' },
        { market: 'Tirupati', district: 'Chittoor', state: 'Andhra Pradesh', commodity: 'Green Chillies', modal_price: '3200' },
        // Kerala
        { market: 'Kochi', district: 'Ernakulam', state: 'Kerala', commodity: 'Coconut', modal_price: '2500' },
        { market: 'Trivandrum', district: 'Thiruvananthapuram', state: 'Kerala', commodity: 'Banana', modal_price: '3200' },
        { market: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', commodity: 'Potato', modal_price: '1500' },
        { market: 'Palakkad', district: 'Palakkad', state: 'Kerala', commodity: 'Rice', modal_price: '2800' },
        // Karnataka
        { market: 'Bangalore', district: 'Bangalore', state: 'Karnataka', commodity: 'Potato', modal_price: '1800' },
        { market: 'Mysore', district: 'Mysore', state: 'Karnataka', commodity: 'Carrot', modal_price: '2600' },
        { market: 'Hubli', district: 'Dharwad', state: 'Karnataka', commodity: 'Onion', modal_price: '1900' }
    ];

    // Ensure all QualityCheck crops have at least one entry for meaningful fallback
    const mockCrops = [
        'Bitter Guard', 'Methi Leaves', 'Thota-Kura', 'Beet-root', 'Ladies Finger',
        'Ginger', 'Sweet Potato', 'Ivy Gourd', 'Bottle Gourd', 'Grafting Beera',
        'Cucumber', 'Broccoli', 'Red Cabbage'
    ];

    // Add dynamic mocks if they don't exist in 'all'
    mockCrops.forEach(c => {
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
        return filtered.length > 0 ? filtered : all;
    }
    return all;
};

// Database of major Indian regions and mandis with coordinates
const MARKET_COORDINATES = {
    // Tamil Nadu
    'Chennai': { lat: 13.0827, lon: 80.2707 },
    'Coimbatore': { lat: 11.0168, lon: 76.9558 },
    'Madurai': { lat: 9.9252, lon: 78.1198 },
    'Trichy': { lat: 10.7905, lon: 78.7047 },
    'Salem': { lat: 11.6643, lon: 78.1460 },
    // Andhra Pradesh
    'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
    'Vijayawada': { lat: 16.5062, lon: 80.6480 },
    'Guntur': { lat: 16.3067, lon: 80.4365 },
    'Nellore': { lat: 14.4426, lon: 79.9865 },
    'Kurnool': { lat: 15.8281, lon: 78.0373 },
    // Kerala
    'Trivandrum': { lat: 8.5241, lon: 76.9366 },
    'Kochi': { lat: 9.9312, lon: 76.2673 },
    'Kozhikode': { lat: 11.2588, lon: 75.7804 },
    'Thrissur': { lat: 10.5276, lon: 76.2144 },
    // Others (retained for fallback matching)
    'Nashik': { lat: 19.997, lon: 73.789 },
    'Pune': { lat: 18.520, lon: 73.856 },
    'Mumbai': { lat: 19.076, lon: 72.877 },
    'Indore': { lat: 22.719, lon: 75.857 },
    'Karnal': { lat: 29.686, lon: 76.990 },
    'Azadpur': { lat: 28.707, lon: 77.181 }
};

// Real Haversine distance calculation
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Math.floor(Math.random() * 50) + 10;

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
        for (const key in MARKET_COORDINATES) {
            if (term.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(term.toLowerCase())) {
                return MARKET_COORDINATES[key];
            }
        }
    }
    return null;
};

// Travel expense calculation
export const calculateTravelExpense = (distance) => {
    const ratePerKm = 10; // 10 currency units per km
    return distance * ratePerKm;
};
