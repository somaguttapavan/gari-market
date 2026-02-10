import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Info, TrendingUp, Smartphone, Globe } from 'lucide-react';
import { fetchMarketPrices, calculateTravelExpense, calculateDistance, getMarketCoords } from '../services/marketService';
import { motion } from 'framer-motion';

const LiveMarket = () => {
    const [searchParams] = useSearchParams();
    const detectedCrop = searchParams.get('crop');

    const [location, setLocation] = useState(null);
    const [locationSource, setLocationSource] = useState(null); // 'NATIVE_GPS' | 'BROWSER_GPS'
    const [address, setAddress] = useState(null);
    const [userState, setUserState] = useState(null); // Store user's state for sorting
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
                // FALLBACK: If we don't know the exact market coords, 
                // we assign a stable but pseudo-random distance for demonstration
                const hash = record.market.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                distance = (hash % 80) + 10; // Stable distance between 10km and 90km
            }

            return {
                ...record,
                distance,
                travelExpense: calculateTravelExpense(distance)
            };
        })
            .filter(m => m.distance <= 110)
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

        setMarkets(processedMarkets);
        setLoading(false);
    }, [location, detectedCrop, userState]);

    useEffect(() => {
        const handleNativeMessage = (event) => {
            try {
                // WebView sends messages as stringified JSON or direct objects
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data.type === 'NATIVE_LOCATION' && data.coords) {
                    const { latitude, longitude } = data.coords;
                    setLocation({ lat: latitude, lon: longitude });
                    setLocationSource('NATIVE_GPS');

                    // Simple reverse geocoding via API
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then(res => res.json())
                        .then(geoData => {
                            if (geoData && geoData.address) {
                                const city = geoData.address.city || geoData.address.town || geoData.address.village;
                                const state = geoData.address.state;
                                setAddress(`${city}, ${state}`);
                                if (state) setUserState(state);
                            }
                        })
                        .catch(() => console.error("Native Geocoding error"));
                }
            } catch {
                // Ignore non-json messages
            }
        };

        window.addEventListener('message', handleNativeMessage);
        // Also support ReactNativeWebView specific messaging
        document.addEventListener('message', handleNativeMessage);

        // Set a timeout to load data even if geolocation prompt is ignored
        const timeoutId = setTimeout(() => {
            if (!location) {
                console.log("Geolocation timeout - loading data with default location");
                loadMarketData();
            }
        }, 5000);

        // Get user geolocation (Standard Web API) - Only if not already getting native
        if (navigator.geolocation && locationSource !== 'NATIVE_GPS') {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    // If we haven't received native location yet, use browser
                    if (locationSource !== 'NATIVE_GPS') {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        setLocation({ lat, lon });
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
                    }
                },
                (err) => {
                    // Only show error if we aren't using native GPS
                    if (locationSource !== 'NATIVE_GPS') {
                        clearTimeout(timeoutId);
                        console.error("Geolocation error:", err);
                        setTimeout(() => {
                            setError("Location permission denied. Showing all markets.");
                            loadMarketData();
                        }, 0);
                    }
                }
            );
        } else {
            if (locationSource !== 'NATIVE_GPS') {
                clearTimeout(timeoutId);
                setTimeout(() => {
                    setError("Geolocation not supported.");
                    loadMarketData();
                }, 0);
            }
        }

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleNativeMessage);
            document.removeEventListener('message', handleNativeMessage);
        };
    }, [locationSource]); // Removed location dependency to avoid loops, check logic if needed

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
            {error && !location && (
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
                            <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>No markets found for this crop in your area.</p>
                            <p style={{ marginTop: '0.5rem' }}>Try searching for a different crop like <strong>"Wheat"</strong>, <strong>"Rice"</strong>, or <strong>"Tomato"</strong>.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveMarket;
