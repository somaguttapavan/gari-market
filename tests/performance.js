
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\nStarting Agri-Growth Performance Suite...");
console.log("==============================================\n");

// --- TEST 1: Network Latency (Nominatim API) ---
function testNetworkLatency() {
    return new Promise((resolve) => {
        console.log("TEST 1: Checking Network Latency (OpenStreetMap API)...");
        const start = Date.now();

        const req = https.get('https://nominatim.openstreetmap.org/search?q=Guntur&format=json', {
            headers: { 'User-Agent': 'AgriGrowthPerformanceTest/1.0' }
        }, (res) => {
            const end = Date.now();
            const duration = end - start;

            if (res.statusCode === 200) {
                if (duration < 800) console.log(`[PASS] Latency is Excellent: ${duration}ms`);
                else if (duration < 2000) console.log(`[WARN] Latency is Moderate: ${duration}ms`);
                else console.log(`[FAIL] Latency is Slow: ${duration}ms`);
            } else {
                console.log(`[FAIL] API Status: ${res.statusCode}`);
            }
            resolve();
        });

        req.on('error', (e) => {
            console.log(`[ERROR] Network request failed: ${e.message}`);
            resolve();
        });
    });
}

// --- TEST 2: Logic Stress Test (Distance Calculation) ---
function stressTestDistanceCalculation() {
    console.log("\nTEST 2: Stress Testing Distance Logic (1 Million Iterations)...");

    // Haversine Formula Implementation
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const start = Date.now();
    for (let i = 0; i < 1000000; i++) {
        calculateDistance(16.3067, 80.4365, 17.3850, 78.4867);
    }
    const end = Date.now();
    const duration = end - start;

    if (duration < 500) console.log(`[PASS] 1M calcs in ${duration}ms (Super fast)`);
    else if (duration < 1000) console.log(`[PASS] 1M calcs in ${duration}ms (Good)`);
    else console.log(`[WARN] 1M calcs took ${duration}ms`);
}

// --- TEST 3: App Source Size Analysis ---
function checkSourceSize() {
    console.log("\nTEST 3: Analyzing Source Code Size...");

    const srcPath = path.join(__dirname, '../src');

    let fileCount = 0;
    let totalSize = 0;

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filepath = path.join(dir, file);
            const stats = fs.statSync(filepath);
            if (stats.isDirectory()) {
                walk(filepath);
            } else {
                fileCount++;
                totalSize += stats.size;
            }
        });
    }

    walk(srcPath);
    const sizeInKB = (totalSize / 1024).toFixed(2);

    console.log(`Source Stats: ${fileCount} files, Total Size: ${sizeInKB} KB`);

    if (sizeInKB < 2000) console.log(`[PASS] Source code is lightweight (< 2MB)`);
    else console.log(`[WARN] Source code is getting large (> 2MB)`);
}

async function runTests() {
    try {
        await testNetworkLatency();
        stressTestDistanceCalculation();
        checkSourceSize();
        console.log("\nPerformance Tests Completed.");
    } catch (err) {
        console.error("Test Suite Failed:", err);
    }
}

runTests();
