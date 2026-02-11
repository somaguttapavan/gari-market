import { calculateDistance, getMarketCoords, calculateTravelExpense } from '../src/services/marketService.js';

// Records including Karanjia (Odisha) which was causing issues
const records = [
    { market: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', commodity: 'Tomato', modal_price: '1850' },
    { market: 'Karanjia APMC', district: 'Mayurbhanja', state: 'Odisha', commodity: 'Tomato', modal_price: '2787' },
    { market: 'Nellore', district: 'Nellore', state: 'Andhra Pradesh', commodity: 'Tomato', modal_price: '1750' }
];

const userLoc = { name: 'Tamil Nadu (Chennai)', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' };

function testBugFix() {
    console.log(`Verifying Fix for User in: ${userLoc.name}\n`);

    const processedMarkets = records.map(record => {
        const marketCoords = getMarketCoords(record);
        let distance;

        if (marketCoords) {
            distance = calculateDistance(userLoc.lat, userLoc.lon, marketCoords.lat, marketCoords.lon);
        } else {
            // New fallback logic from LiveMarket.jsx
            const normUser = userLoc.state.toLowerCase().replace('state', '').trim();
            const recordState = record.state.toLowerCase();
            const isLocal = recordState.includes(normUser);

            if (isLocal) {
                const hash = record.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                distance = (hash % 60) + 20;
            } else {
                distance = 999;
            }
        }

        return {
            ...record,
            distance,
            travelExpense: calculateTravelExpense(distance)
        };
    });

    console.log("All Markets (Before Filtering):");
    processedMarkets.forEach(m => {
        console.log(`- ${m.market} (${m.state}): ${m.distance} km away`);
    });

    const filtered = processedMarkets.filter(m => m.distance <= 110);

    console.log("\nFiltered Markets (Within 110km):");
    filtered.forEach(m => {
        console.log(`- ${m.market} (${m.state}): ${m.distance} km away`);
    });

    const karanjia = processedMarkets.find(m => m.market.includes('Karanjia'));
    if (karanjia && karanjia.distance > 110) {
        console.log("\n✅ SUCCESS: Distant market 'Karanjia' is now correctly excluded.");
    } else {
        console.log("\n❌ FAILURE: Distant market 'Karanjia' is still showing as nearby!");
    }
}

testBugFix();
