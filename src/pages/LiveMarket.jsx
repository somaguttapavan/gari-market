import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Info, TrendingUp, Smartphone, Globe } from 'lucide-react';
import { fetchMarketPrices, calculateTravelExpense, calculateDistance, getMarketCoords } from '../services/marketService';
import { useLocation } from '../context/LocationContext';
import { motion } from 'framer-motion';

const LiveMarket = () => {
    const [searchParams] = useSearchParams();
    const detectedCrop = searchParams.get('crop');

    const {
        location, setLocation,
        locationSource, setLocationSource,
        address, setAddress,
        userState, setUserState,
        isNative
    } = useLocation();

    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMarketData = React.useCallback(async () => {
        setLoading(true);
        const records = await fetchMarketPrices({ commodity: detectedCrop });

        const userLat = location?.lat;
        const userLon = location?.lon;

        // Calculate distances and filter to 110km radius (slight buffer for GPS jitter)
        const processedMarkets = (records || []).map(record => {
            // Pass the whole record for better matching (market/district/state)
            const marketCoords = getMarketCoords(record);
            let distance;

            if (userLat && marketCoords) {
                distance = calculateDistance(userLat, userLon, marketCoords.lat, marketCoords.lon);
            } else {
                // If we are in Tamil Nadu but the market is in Odisha, and we don't have coords,
                // we should NOT assign it a small distance.

                if (userState && record.state) {
                    const normUser = userState.toLowerCase().replace('state', '').trim();
                    const recordState = record.state.toLowerCase();
                    const isLocal = recordState.includes(normUser);

                    if (isLocal) {
                        const hash = record.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        distance = (hash % 60) + 20; // 20-80km for local unknown markets
                    } else {
                        distance = 999; // Far away for non-local unknown markets
                    }
                } else {
                    const hash = record.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    distance = (hash % 80) + 120; // 120-200km default for unknown location
                }
            }

            return {
                ...record,
                distance,
                travelExpense: calculateTravelExpense(distance)
            };
        })
            .filter(m => {
                // If we have pinpoint location and found markets within 110km, keep the limit.
                // However, we'll first calculate everything and then re-evaluate.
                return true;
            })
            .sort((a, b) => {
                // Priority 1: User's State (Normalized comparison)
                if (userState) {
                    const normUser = userState.toLowerCase().replace('state', '').trim();
                    const aIsLocal = a.state && a.state.toLowerCase().includes(normUser);
                    const bIsLocal = b.state && b.state.toLowerCase().includes(normUser);
                    if (aIsLocal && !bIsLocal) return -1;
                    if (!aIsLocal && bIsLocal) return 1;
                }
                // Priority 2: Distance
                return a.distance - b.distance;
            });

        // Final Filter: If we have nearby markets (<110km), show only those.
        // If NO nearby markets but we have state matches, show state matches.
        let finalMarkets = processedMarkets.filter(m => m.distance <= 110);

        if (finalMarkets.length === 0 && userState) {
            const normUser = userState.toLowerCase().replace('state', '').trim();
            finalMarkets = processedMarkets.filter(m => m.state && m.state.toLowerCase().includes(normUser));
        }

        // If still empty, show everything initially available
        if (finalMarkets.length === 0) finalMarkets = processedMarkets;

        setMarkets(finalMarkets);
        setLoading(false);
    }, [location, detectedCrop, userState]);

    useEffect(() => {
        // Set a timeout to load data even if geolocation prompt is ignored
        const timeoutId = setTimeout(() => {
            if (!location) {
                console.log("Geolocation timeout - loading data with default location");
                loadMarketData();
            }
        }, 5000);

        // Get user geolocation (Standard Web API) - Only if not native and no location yet
        if (navigator.geolocation && !isNative && !locationSource) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLocation(prev => {
                        if (prev && prev.lat === lat && prev.lon === lon) return prev;
                        console.log("LiveMarket: Location changed, updating state:", lat, lon);
                        return { lat, lon };
                    });
                    setLocationSource('BROWSER_GPS');

                    // Reverse Geocode
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data && data.address) {
                                const city = data.address.city || data.address.town || data.address.village || data.address.county;
                                const state = data.address.state;
                                setAddress(`${city}, ${state}`);
                                if (state) setUserState(state);
                            }
                        })
                        .catch(e => console.error("Geocoding error", e));
                },
                (err) => {
                    clearTimeout(timeoutId);
                    console.error("Geolocation error:", err);
                    setError("Location permission denied. Showing all markets.");
                    loadMarketData();
                }
            );
        } else if (isNative || locationSource === 'NATIVE_GPS') {
            // On native, we wait for the bridge which is already handled in LocationContext
            clearTimeout(timeoutId);
            if (location) loadMarketData();
        } else if (!navigator.geolocation && !isNative) {
            clearTimeout(timeoutId);
            setError("Geolocation not supported.");
            loadMarketData();
        }

        return () => clearTimeout(timeoutId);
    }, [isNative, locationSource, location, loadMarketData, setLocation, setLocationSource, setAddress, setUserState]);

    useEffect(() => {
        if (location) {
            setTimeout(() => {
                loadMarketData();
            }, 0);
        }
    }, [location, loadMarketData]);

    const handleNavigate = (market, district, state) => {
        const query = `${market}, ${district}, ${state}`;
        const queryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

        if (locationSource === 'NATIVE_GPS') {
            // Send message to React Native app to open native maps
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'OPEN_MAPS',
                    query: query
                }));
            } else {
                window.postMessage({
                    type: 'OPEN_MAPS',
                    query: query
                }, '*');
            }
        } else {
            // Web fallback
            window.open(queryUrl, '_blank');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{
                    fontSize: window.innerWidth < 768 ? '1.8rem' : '2.5rem',
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                }}>
                    <TrendingUp size={window.innerWidth < 768 ? 28 : 36} /> Live Market Prices
                </h2>
                <p style={{ color: 'var(--text-light)', fontSize: window.innerWidth < 768 ? '0.95rem' : '1.1rem' }}>
                    Real-time wholesale prices from markets within 100km radius.
                </p>

                {detectedCrop && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--primary-light)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Navigation size={18} color="var(--primary)" />
                        <span>Recommended markets for: <strong>{detectedCrop}</strong></span>
                    </div>
                )}
            </header>

            {/* Location Status Banner */}
            {error && !location && !isNative && (
                <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <MapPin size={24} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                            <strong>Location access is currently blocked.</strong>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', opacity: 0.9 }}>
                                To see markets near you, please enable <strong>Location Permissions</strong> for <strong>this app</strong> in your browser or device settings.
                            </p>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '4px' }}>
                                <em>Showing default markets for your region.</em>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!location && !error && !loading && (
                <div style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #c2410c', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    <span>Detecting your GPS location...</span>
                </div>
            )}

            {location && (
                <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {locationSource === 'NATIVE_GPS' ? <Smartphone size={20} /> : <Globe size={20} />}
                    <span>
                        <strong>{locationSource === 'NATIVE_GPS' ? '📱 Using High-Precision Device GPS' : '💻 Using Browser Location'}</strong>
                        <br />
                        <span style={{ fontSize: '0.9em', opacity: 0.9 }}>{address || "Coordinates Detected"}</span>
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '4px' }}>
                        {locationSource === 'NATIVE_GPS' ? 'Native Mobile App' : 'Web Browser'}
                    </span>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem' }}>Updating market data...</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                    gap: '1.25rem'
                }}>
                    {markets.length > 0 ? (
                        markets.map((market, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ color: 'var(--primary)', fontWeight: '700' }}>{market.market}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>{market.district}, {market.state}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                            color: 'var(--primary)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '700'
                                        }}>
                                            {market.distance} km away
                                        </span>
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-light)' }}>Commodity:</span>
                                        <span style={{ fontWeight: '600' }}>{market.commodity}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-light)' }}>Modal Price:</span>
                                        <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>₹{market.modal_price}/quintal</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-light)' }}>Est. Travel Cost:</span>
                                        <span style={{ color: 'var(--accent)', fontWeight: '700' }}>₹{market.travelExpense}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => handleNavigate(market.market, market.district, market.state)}
                                        className="btn-primary"
                                        style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem' }}
                                    >
                                        <Navigation size={16} /> Navigate
                                    </button>
                                    <button
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #cbd5e1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-light)'
                                        }}
                                    >
                                        <Info size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1/-1' }}>
                            <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>
                                {loading ? "Updating market data..." : "No markets found for this crop in your area."}
                            </p>
                            <p style={{ marginTop: '0.5rem' }}>
                                {!location && !error
                                    ? "We are still detecting your location to find the closest markets."
                                    : "Try searching for a different crop like \"Wheat\", \"Rice\", or \"Tomato\"."}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveMarket;
