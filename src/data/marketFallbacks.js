export const FALLBACK_MARKETS = [
    // Tamil Nadu
    { market: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1850' },
    { market: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', commodity: 'Onion', modal_price: '2400' },
    { market: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', commodity: 'Brinjal', modal_price: '1200' },
    { market: 'Trichy', district: 'Trichy', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1900' },
    { market: 'Salem', district: 'Salem', state: 'Tamil Nadu', commodity: 'Cabbage', modal_price: '1100' },
    { market: 'Erode', district: 'Erode', state: 'Tamil Nadu', commodity: 'Turmeric', modal_price: '7500' },
    { market: 'Trichy', district: 'Trichy', state: 'Tamil Nadu', commodity: 'Carrot', modal_price: '2800' },
    { market: 'Ottanchatram', district: 'Dindigul', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1600' },
    { market: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', commodity: 'Rice', modal_price: '3200' },
    { market: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', commodity: 'Mango', modal_price: '4800' },

    // Andhra Pradesh
    { market: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', commodity: 'Rice', modal_price: '3600' },
    { market: 'Vijayawada', district: 'Krishna', state: 'Andhra Pradesh', commodity: 'Mango', modal_price: '4500' },
    { market: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', commodity: 'Chilli', modal_price: '18000' },
    { market: 'Nellore', district: 'Nellore', state: 'Andhra Pradesh', commodity: 'Tomato', modal_price: '1750' },
    { market: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', commodity: 'Onion', modal_price: '2100' },
    { market: 'Tirupati', district: 'Chittoor', state: 'Andhra Pradesh', commodity: 'Green Chillies', modal_price: '3200' },
    { market: 'Anantapur', district: 'Anantapur', state: 'Andhra Pradesh', commodity: 'Groundnut', modal_price: '6500' },
    { market: 'Rajahmundry', district: 'East Godavari', state: 'Andhra Pradesh', commodity: 'Coconut', modal_price: '2700' },

    // Kerala
    { market: 'Kochi', district: 'Ernakulam', state: 'Kerala', commodity: 'Coconut', modal_price: '2500' },
    { market: 'Trivandrum', district: 'Thiruvananthapuram', state: 'Kerala', commodity: 'Banana', modal_price: '3200' },
    { market: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', commodity: 'Potato', modal_price: '1500' },
    { market: 'Palakkad', district: 'Palakkad', state: 'Kerala', commodity: 'Rice', modal_price: '2800' },
    { market: 'Thrissur', district: 'Thrissur', state: 'Kerala', commodity: 'Pineapple', modal_price: '3500' },
    { market: 'Kannur', district: 'Kannur', state: 'Kerala', commodity: 'Cashew', modal_price: '8500' },

    // Karnataka
    { market: 'Bangalore', district: 'Bangalore', state: 'Karnataka', commodity: 'Potato', modal_price: '1800' },
    { market: 'Mysore', district: 'Mysore', state: 'Karnataka', commodity: 'Carrot', modal_price: '2600' },
    { market: 'Hubli', district: 'Dharwad', state: 'Karnataka', commodity: 'Onion', modal_price: '1900' },
    { market: 'Belgaum', district: 'Belgaum', state: 'Karnataka', commodity: 'Sugarcane', modal_price: '3200' },
    { market: 'Mangalore', district: 'Dakshina Kannada', state: 'Karnataka', commodity: 'Coconut', modal_price: '2400' },

    // Telangana
    { market: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', commodity: 'Tomato', modal_price: '1950' },
    { market: 'Warangal', district: 'Warangal', state: 'Telangana', commodity: 'Turmeric', modal_price: '7800' },
    { market: 'Nizamabad', district: 'Nizamabad', state: 'Telangana', commodity: 'Rice', modal_price: '3400' },
    { market: 'Karimnagar', district: 'Karimnagar', state: 'Telangana', commodity: 'Chilli', modal_price: '17500' },

    // Maharashtra
    { market: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', commodity: 'Onion', modal_price: '2600' },
    { market: 'Pune', district: 'Pune', state: 'Maharashtra', commodity: 'Tomato', modal_price: '2100' },
    { market: 'Nashik', district: 'Nashik', state: 'Maharashtra', commodity: 'Grapes', modal_price: '6500' },
    { market: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', commodity: 'Orange', modal_price: '5500' },

    // Odisha
    { market: 'Bhubaneswar', district: 'Khurda', state: 'Odisha', commodity: 'Rice', modal_price: '3100' },
    { market: 'Cuttack', district: 'Cuttack', state: 'Odisha', commodity: 'Vegetables', modal_price: '1800' },
    { market: 'Berhampur', district: 'Ganjam', state: 'Odisha', commodity: 'Turmeric', modal_price: '7200' }
];

export const MOCK_CROPS = [
    'Bitter Guard', 'Methi Leaves', 'Thota-Kura', 'Beet-root', 'Ladies Finger',
    'Ginger', 'Sweet Potato', 'Ivy Gourd', 'Bottle Gourd', 'Grafting Beera',
    'Cucumber', 'Broccoli', 'Red Cabbage'
];

export const MARKET_COORDINATES = {
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
    // Odisha
    'Karanjia': { lat: 21.9213, lon: 85.9723 },
    'Mayurbhanj': { lat: 21.9351, lon: 86.7324 },
    // More Regions
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
