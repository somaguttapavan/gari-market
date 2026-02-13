import { calculateDistance, calculateTravelExpense, getMarketCoords } from '../src/services/marketService';

describe('marketService', () => {
    describe('calculateDistance', () => {
        it('should return 0 when coordinates are the same', () => {
            const distance = calculateDistance(13.0827, 80.2707, 13.0827, 80.2707);
            expect(distance).toBe(0);
        });

        it('should correctly calculate distance between Chennai and Bangalore', () => {
            // Approx distance between Chennai (13.08, 80.27) and Bangalore (12.97, 77.59) is ~290km
            const distance = calculateDistance(13.0827, 80.2707, 12.9716, 77.5946);
            expect(distance).toBeGreaterThan(280);
            expect(distance).toBeLessThan(300);
        });

        it('should return 999 for invalid coordinates', () => {
            expect(calculateDistance(null, 80, 13, 80)).toBe(999);
        });
    });

    describe('calculateTravelExpense', () => {
        it('should return distance * 10', () => {
            expect(calculateTravelExpense(100)).toBe(1000);
            expect(calculateTravelExpense(0)).toBe(0);
        });
    });

    describe('getMarketCoords', () => {
        it('should return coordinates for known markets', () => {
            const coords = getMarketCoords({ market: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' });
            expect(coords).not.toBeNull();
            expect(coords.lat).toBe(13.0827);
        });

        it('should return null for unknown markets', () => {
            const coords = getMarketCoords({ market: 'Unknown City' });
            expect(coords).toBeNull();
        });
    });
});
