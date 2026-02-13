import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Database of major Indian regions and mandis with coordinates (Ported from marketService.js)
const MARKET_COORDINATES = {
    'Chennai': { lat: 13.0827, lon: 80.2707 },
    'Coimbatore': { lat: 11.0168, lon: 76.9558 },
    'Madurai': { lat: 9.9252, lon: 78.1198 },
    'Trichy': { lat: 10.7905, lon: 78.7047 },
    'Salem': { lat: 11.6643, lon: 78.1460 },
    'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
    'Vijayawada': { lat: 16.5062, lon: 80.6480 },
    'Guntur': { lat: 16.3067, lon: 80.4365 },
    'Nellore': { lat: 14.4426, lon: 79.9865 },
    'Kurnool': { lat: 15.8281, lon: 78.0373 },
    'Trivandrum': { lat: 8.5241, lon: 76.9366 },
    'Kochi': { lat: 9.9312, lon: 76.2673 },
    'Kozhikode': { lat: 11.2588, lon: 75.7804 },
    'Thrissur': { lat: 10.5276, lon: 76.2144 },
    'Karanjia': { lat: 21.9213, lon: 85.9723 },
    'Mayurbhanj': { lat: 21.9351, lon: 86.7324 },
    'Erode': { lat: 11.3410, lon: 77.7172 },
    'Tuticorin': { lat: 8.8053, lon: 78.1460 },
    'Thanjavur': { lat: 10.7852, lon: 79.1378 },
    'Tirupati': { lat: 13.6288, lon: 79.4192 },
    'Anantapur': { lat: 14.6819, lon: 77.6006 },
    'Nashik': { lat: 19.997, lon: 73.789 },
    'Pune': { lat: 18.520, lon: 73.856 },
    'Mumbai': { lat: 19.076, lon: 72.877 },
    'Indore': { lat: 22.719, lon: 75.857 },
    'Karnal': { lat: 29.686, lon: 76.990 },
    'Azadpur': { lat: 28.707, lon: 77.181 }
};

const STORED_MARKETS = [
    { market: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1850' },
    { market: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', commodity: 'Onion', modal_price: '2400' },
    { market: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', commodity: 'Brinjal', modal_price: '1200' },
    { market: 'Trichy', district: 'Trichy', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1900' },
    { market: 'Salem', district: 'Salem', state: 'Tamil Nadu', commodity: 'Cabbage', modal_price: '1100' },
    { market: 'Erode', district: 'Erode', state: 'Tamil Nadu', commodity: 'Turmeric', modal_price: '7500' },
    { market: 'Ottanchatram', district: 'Dindigul', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1600' },
    { market: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', commodity: 'Rice', modal_price: '3200' },
    { market: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', commodity: 'Mango', modal_price: '4800' },
    { market: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', commodity: 'Rice', modal_price: '3600' },
    { market: 'Vijayawada', district: 'Krishna', state: 'Andhra Pradesh', commodity: 'Mango', modal_price: '4500' },
    { market: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', commodity: 'Chilli', modal_price: '18000' },
    { market: 'Nellore', district: 'Nellore', state: 'Andhra Pradesh', commodity: 'Tomato', modal_price: '1750' },
    { market: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', commodity: 'Onion', modal_price: '2100' },
    { market: 'Tirupati', district: 'Chittoor', state: 'Andhra Pradesh', commodity: 'Green Chillies', modal_price: '3200' },
    { market: 'Anantapur', district: 'Anantapur', state: 'Andhra Pradesh', commodity: 'Groundnut', modal_price: '6500' },
    { market: 'Rajahmundry', district: 'East Godavari', state: 'Andhra Pradesh', commodity: 'Coconut', modal_price: '2700' },
    { market: 'Kochi', district: 'Ernakulam', state: 'Kerala', commodity: 'Coconut', modal_price: '2500' },
    { market: 'Trivandrum', district: 'Thiruvananthapuram', state: 'Kerala', commodity: 'Banana', modal_price: '3200' },
    { market: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', commodity: 'Potato', modal_price: '1500' },
    { market: 'Palakkad', district: 'Palakkad', state: 'Kerala', commodity: 'Rice', modal_price: '2800' },
    { market: 'Thrissur', district: 'Thrissur', state: 'Kerala', commodity: 'Pineapple', modal_price: '3500' },
    { market: 'Kannur', district: 'Kannur', state: 'Kerala', commodity: 'Cashew', modal_price: '8500' },
    { market: 'Bangalore', district: 'Bangalore', state: 'Karnataka', commodity: 'Potato', modal_price: '1800' },
    { market: 'Mysore', district: 'Mysore', state: 'Karnataka', commodity: 'Carrot', modal_price: '2600' },
    { market: 'Hubli', district: 'Dharwad', state: 'Karnataka', commodity: 'Onion', modal_price: '1900' },
    { market: 'Belgaum', district: 'Belgaum', state: 'Karnataka', commodity: 'Sugarcane', modal_price: '3200' },
    { market: 'Mangalore', district: 'Dakshina Kannada', state: 'Karnataka', commodity: 'Coconut', modal_price: '2400' },
    { market: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', commodity: 'Tomato', modal_price: '1950' },
    { market: 'Warangal', district: 'Warangal', state: 'Telangana', commodity: 'Turmeric', modal_price: '7800' },
    { market: 'Nizamabad', district: 'Nizamabad', state: 'Telangana', commodity: 'Rice', modal_price: '3400' },
    { market: 'Karimnagar', district: 'Karimnagar', state: 'Telangana', commodity: 'Chilli', modal_price: '17500' },
    { market: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', commodity: 'Onion', modal_price: '2600' },
    { market: 'Pune', district: 'Pune', state: 'Maharashtra', commodity: 'Tomato', modal_price: '2100' },
    { market: 'Nashik', district: 'Nashik', state: 'Maharashtra', commodity: 'Grapes', modal_price: '6500' },
    { market: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', commodity: 'Orange', modal_price: '5500' },
    { market: 'Bhubaneswar', district: 'Khurda', state: 'Odisha', commodity: 'Rice', modal_price: '3100' },
    { market: 'Cuttack', district: 'Cuttack', state: 'Odisha', commodity: 'Vegetables', modal_price: '1800' },
    { market: 'Berhampur', district: 'Ganjam', state: 'Odisha', commodity: 'Turmeric', modal_price: '7200' }
];

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;

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

const getMarketCoords = (marketName) => {
    return MARKET_COORDINATES[marketName] || null;
};

// API Endpoint
app.get('/api/markets/nearby', (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({ error: 'Invalid Latitude or Longitude' });
    }

    const nearbyMarkets = STORED_MARKETS.map(market => {
        const coords = getMarketCoords(market.market);
        if (!coords) return null;

        const distance = calculateDistance(userLat, userLon, coords.lat, coords.lon);
        return { ...market, distance };
    })
        .filter(market => market !== null && market.distance <= 100)
        .sort((a, b) => a.distance - b.distance);

    res.json(nearbyMarkets);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
