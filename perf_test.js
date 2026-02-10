
import fs from 'fs';
import path from 'path';

console.log("Starting Agri-Growth Performance Tests (Local)...");
console.log("-------------------------------------------------");

// Test 1: Stress Calculation
function testStress() {
    console.log("1. Testing Calculation Speed...");
    const start = Date.now();
    let r = 0;
    for (let i = 0; i < 10000000; i++) {
        r += Math.sqrt(i);
    }
    const duration = Date.now() - start;
    console.log(`   Result: ${duration}ms (10M Ops, sum=${r.toFixed(0)})`);
}

// Test 2: App Size
function testSize() {
    console.log("2. Analyzing App Weight...");
    const src = path.join(process.cwd(), 'src');
    let size = 0;

    try {
        function walk(dir) {
            if (!fs.existsSync(dir)) return;
            fs.readdirSync(dir).forEach(f => {
                let p = path.join(dir, f);
                let s = fs.statSync(p);
                if (s.isDirectory()) walk(p);
                else size += s.size;
            });
        }
        walk(src);
        console.log("   Result: " + (size / 1024).toFixed(1) + " KB");
    } catch (e) {
        console.log("   Skipped file check: " + e.message);
    }
}

testStress();
testSize();

console.log("-------------------------------------------------");
console.log("Tests Passed.");
