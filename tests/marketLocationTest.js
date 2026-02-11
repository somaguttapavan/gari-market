import { calculateDistance, getMarketCoords, calculateTravelExpense } from '../src/services/marketService.js';

// Mock record for testing
const records = [
    { market: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1850' },
    { market: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', commodity: 'Onion', modal_price: '2400' },
    { market: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', commodity: 'Rice', modal_price: '3600' },
    { market: 'Kochi', district: 'Ernakulam', state: 'Kerala', commodity: 'Coconut', modal_price: '2500' }
];

const testUserLocations = [
    { name: 'Near Chennai', lat: 13.0, lon: 80.2, expectedState: 'Tamil Nadu' },
    { name: 'Near Vizag', lat: 17.7, lon: 83.2, expectedState: 'Andhra Pradesh' }
];

function runTests() {
    console.log("Starting Market Location Tests...\n");

    testUserLocations.forEach(userLoc => {
        console.log(`Testing for User Location: ${userLoc.name} (${userLoc.lat}, ${userLoc.lon})`);

        const processedMarkets = records.map(record => {
            const marketCoords = getMarketCoords(record);
            const distance = calculateDistance(userLoc.lat, userLoc.lon, marketCoords.lat, marketCoords.lon);
            return {
                ...record,
                distance,
                travelExpense: calculateTravelExpense(distance)
            };
        })
            .filter(m => m.distance <= 500) // Increased for testing variety
            .sort((a, b) => {
                // Local state priority
                const normUser = userLoc.expectedState.toLowerCase().replace('state', '').trim();
                const aIsLocal = a.state && a.state.toLowerCase().includes(normUser);
                const bIsLocal = b.state && b.state.toLowerCase().includes(normUser);
                if (aIsLocal && !bIsLocal) return -1;
                if (!aIsLocal && bIsLocal) return 1;
                return a.distance - b.distance;
            });

        console.log("Sorted Markets:");
        processedMarkets.forEach(m => {
            console.log(`- ${m.market} (${m.state}): ${m.distance} km away, Expense: ₹${m.travelExpense}`);
        });
        console.log("\n");
    });
}

try {
    runTests();
} catch (error) {
    console.error("Test execution failed:", error);
}
