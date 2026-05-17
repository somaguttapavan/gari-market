import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Info, TrendingUp, Smartphone, Globe, AlertTriangle } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useNearbyMarkets } from '../hooks/useNearbyMarkets';
import { motion } from 'framer-motion';

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return width;
};

const LiveMarket = () => {
    const [searchParams] = useSearchParams();
    const detectedCrop = searchParams.get('crop');
    const windowWidth = useWindowWidth();

    const {
        location, setLocation,
        locationSource, setLocationSource,
        address, setAddress,
        userState, setUserState,
        loading: geoLoading,
        setLoading: setGeoLoading,
        error: geoError,
        setError: setGeoError,
        isNative
    } = useLocation();

    const [manualCity, setManualCity] = useState('');
    const [locationChecked, setLocationChecked] = useState(false);

    // We no longer pass manualState, instead we just update the actual location context when a city is picked
    const { markets, loading: marketsLoading, error: marketsError, refresh } = useNearbyMarkets(
        location,
        userState,
        detectedCrop,
        '', // manualState removed
        address
    );

    const requestGeolocation = React.useCallback(async (initialMode = 'HIGH_ACCURACY') => {
        if (!navigator.geolocation) {
            setTimeout(() => {
                setGeoError("Your browser doesn't support location services.");
                setLocationChecked(true);
                setGeoLoading(false);
            }, 0);
            return;
        }

        if (isNative) return;

        const attempt = async (retryMode) => {
            // Reset error state on new request
            if (retryMode === 'HIGH_ACCURACY') {
                setGeoError(null);
                setLocationChecked(false);
            }

            // Helper to handle success
            const handleSuccess = async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setLocation({ lat, lon });
                setLocationSource('BROWSER_GPS');
                
                // Reverse geocode to get the user's state for accurate market filtering
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.address) {
                            const state = data.address.state;
                            const city = data.address.city || data.address.county || data.address.town || data.address.village;
                            if (state) {
                                setUserState(state);
                                if (city) {
                                    setAddress(`${city}, ${state}`);
                                } else {
                                    setAddress(state);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Reverse geocoding failed", e);
                }

                setLocationChecked(true);
                setGeoError(null);
                setGeoLoading(false);
            };

            // Helper to handle IP fallback
            const tryIpFallback = async () => {
                console.log("GPS failed, trying IP geolocation...");

                const withTimeout = (fetchPromise, ms) =>
                    Promise.race([fetchPromise, new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), ms))]);

                // Try ip-api.com (Primary — Fast & reliable in India)
                try {
                    const res = await withTimeout(fetch('http://ip-api.com/json/?fields=status,lat,lon,city,regionName'), 5000);
                    if (res.ok) {
                        const d = await res.json();
                        if (d.status === 'success' && d.lat && d.lon) {
                            setLocation({ lat: d.lat, lon: d.lon });
                            setLocationSource('IP_GEOLOCATION');
                            setAddress(`${d.city}, ${d.regionName}`);
                            setUserState(d.regionName);
                            setLocationChecked(true);
                            setGeoError(null);
                            setGeoLoading(false);
                            console.log(`IP Geolocation success: ${d.city}, ${d.regionName}`);
                            return true;
                        }
                    }
                } catch (e) { console.warn('ip-api.com failed:', e.message); }

                // Try ipapi.co (Secondary)
                try {
                    const res2 = await withTimeout(fetch('https://ipapi.co/json/'), 5000);
                    if (res2.ok) {
                        const d2 = await res2.json();
                        if (d2.latitude && d2.longitude && !d2.error) {
                            setLocation({ lat: d2.latitude, lon: d2.longitude });
                            setLocationSource('IP_GEOLOCATION');
                            setAddress(`${d2.city}, ${d2.region}`);
                            setUserState(d2.region);
                            setLocationChecked(true);
                            setGeoError(null);
                            setGeoLoading(false);
                            return true;
                        }
                    }
                } catch (e) { console.warn('ipapi.co failed:', e.message); }

                // Try geojs.io (Tertiary fallback)
                try {
                    const res3 = await withTimeout(fetch('https://get.geojs.io/v1/ip/geo.json'), 5000);
                    if (res3.ok) {
                        const d3 = await res3.json();
                        if (d3.latitude && d3.longitude) {
                            setLocation({ lat: parseFloat(d3.latitude), lon: parseFloat(d3.longitude) });
                            setLocationSource('IP_GEOLOCATION');
                            setAddress(`${d3.city}, ${d3.region}`);
                            setUserState(d3.region);
                            setLocationChecked(true);
                            setGeoError(null);
                            setGeoLoading(false);
                            return true;
                        }
                    }
                } catch (e) { console.warn('geojs.io failed:', e.message); }

                return false;
            };

            const handleFailure = async (err) => {
                console.warn(`Geolocation attempt (${retryMode}) failed:`, err.message);

                // If timed out or unavailable on high accuracy, try low accuracy
                if (retryMode === 'HIGH_ACCURACY' && (err.code === 3 || err.code === 2)) {
                    console.log("Retrying with low accuracy...");
                    attempt('LOW_ACCURACY');
                    return;
                }

                // If low accuracy also failed, or permission denied, try IP fallback
                const ipSuccess = await tryIpFallback();
                if (ipSuccess) return;

                // If everything fails
                setLocationChecked(true);
                let msg = "Could not get your location.";
                if (err.code === 1) {
                    msg = "Location access was denied. We tried to guess your location from your IP but failed. Please select your state manually.";
                } else if (err.code === 2) {
                    msg = "Location is temporarily unavailable. Please select your state manually.";
                } else if (err.code === 3) {
                    msg = "Location request timed out. Please select your state manually.";
                }
                setGeoError(msg);
                setGeoLoading(false);
            };

            const options = {
                enableHighAccuracy: retryMode === 'HIGH_ACCURACY',
                timeout: retryMode === 'HIGH_ACCURACY' ? 5000 : 10000, // 5s for high, 10s for low
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(handleSuccess, handleFailure, options);
        };

        attempt(initialMode);

    }, [isNative, setLocation, setLocationSource, setGeoError, setAddress, setUserState, setGeoLoading]);

    useEffect(() => {
        if (!location && !locationChecked && !isNative && !geoLoading) {
            requestGeolocation();
        }
    }, [location, locationChecked, isNative, geoLoading, requestGeolocation]);

    const handleNavigate = (market, district, state) => {
        const query = `${market}, ${district}, ${state}`;
        const queryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

        if (isNative && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'OPEN_MAPS',
                query: query
            }));
        } else {
            window.open(queryUrl, '_blank');
        }
    };

    const isLoading = geoLoading || marketsLoading;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{
                    fontSize: windowWidth < 768 ? '1.8rem' : '2.5rem',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    fontWeight: 'bold'
                }}>
                    <TrendingUp size={windowWidth < 768 ? 28 : 36} strokeWidth={3} /> Live Market Prices
                </h2>
                <p style={{ color: '#64748b', fontSize: windowWidth < 768 ? '0.95rem' : '1.1rem', marginTop: '0.5rem' }}>
                    Real-time wholesale prices from markets within 100km radius.
                </p>

                {detectedCrop && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem 1rem',
                        border: '1px solid #22c55e',
                        borderRadius: '0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'transparent',
                        color: '#15803d'
                    }}>
                        <Navigation size={18} />
                        <span>Recommended markets for: <strong style={{ color: '#0f172a' }}>{detectedCrop}</strong></span>
                    </div>
                )}
            </header>

            {/* Error States */}
            {(geoError || marketsError) && (
                <div style={{ backgroundColor: '#fff1f2', color: '#e11d48', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #fda4af' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <AlertTriangle size={24} />
                        <div style={{ flex: 1 }}>
                            <strong>{geoError ? "Location Issue" : "Data Error"}</strong>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{geoError || marketsError}</p>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => requestGeolocation()} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    Retry GPS
                                </button>
                                <select
                                    value={manualState}
                                    onChange={(e) => {
                                        setManualState(e.target.value);
                                        setUserState(e.target.value);
                                        setGeoError(null);
                                    }}
                                    style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc' }}
                                >
                                    <option value="">Select State Manually</option>
                                    {['Tamil Nadu', 'Andhra Pradesh', 'Kerala', 'Karnataka', 'Telangana', 'Maharashtra', 'Odisha'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Status */}
            {location && !isLoading && (
                <div style={{ 
                    backgroundColor: '#f0fdf4', 
                    padding: '1.5rem', 
                    borderRadius: '0.5rem', 
                    marginBottom: '2rem', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <Globe size={24} color="#15803d" style={{ marginTop: '0.25rem' }} />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Smartphone size={16} color="#15803d" />
                                <strong style={{ color: '#15803d', fontSize: '1.1rem' }}>Using {locationSource === 'NATIVE_GPS' ? 'Mobile' : 'Browser'} Location</strong>
                            </div>
                            <div style={{ color: '#22c55e', marginTop: '0.25rem' }}>
                                {address || "Location Detected"}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ color: '#22c55e', fontSize: '0.9rem' }}>
                            {locationSource === 'NATIVE_GPS' ? 'Mobile App' : 'Web Browser'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {windowWidth >= 768 && (
                                <select
                                    value={manualCity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setManualCity(val);
                                        if (val) {
                                            const [city, state, lat, lon] = val.split('|');
                                            setLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });
                                            setLocationSource('NATIVE_GPS');
                                            setUserState(state);
                                            setAddress(`${city}, ${state}`);
                                            setGeoError(null);
                                        }
                                    }}
                                    style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #86efac', backgroundColor: 'transparent', color: '#15803d', fontSize: '0.75rem', outline: 'none' }}
                                >
                                    <option value="">Test Location...</option>
                                    <option value="Trichy|Tamil Nadu|10.7905|78.7047">Trichy, TN</option>
                                    <option value="Chennai|Tamil Nadu|13.0827|80.2707">Chennai, TN</option>
                                    <option value="Madurai|Tamil Nadu|9.9252|78.1198">Madurai, TN</option>
                                    <option value="Coimbatore|Tamil Nadu|11.0168|76.9558">Coimbatore, TN</option>
                                    <option value="Bangalore|Karnataka|12.9716|77.5946">Bangalore, KA</option>
                                    <option value="Hyderabad|Telangana|17.3850|78.4867">Hyderabad, TS</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>{geoLoading ? "Loading Location..." : "Syncing Market Prices..."}</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {markets.length > 0 ? (
                        markets.map((market, index) => (
                            <motion.div
                                key={`${market.market}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ 
                                    backgroundColor: 'white', 
                                    borderRadius: '0.75rem', 
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.25rem'
                                }}
                            >
                                {/* Header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                                        <h3 style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.4', margin: 0 }}>{market.market}</h3>
                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{market.district}, {market.state}</p>
                                    </div>
                                    <div style={{ 
                                        backgroundColor: market.distanceExact ? '#dcfce7' : '#fef9c3', 
                                        padding: '0.4rem 0.5rem', 
                                        borderRadius: '0.25rem', 
                                        textAlign: 'center',
                                        minWidth: '70px'
                                    }}>
                                        {market.distancePending && !market.distanceExact ? (
                                            <>
                                                <div style={{ color: '#92400e', fontWeight: 'bold', fontSize: '0.75rem' }}>⏳ ~{market.distance} km</div>
                                                <div style={{ color: '#92400e', fontSize: '0.65rem' }}>calculating</div>
                                            </>
                                        ) : market.distanceExact ? (
                                            <>
                                                <div style={{ color: '#166534', fontWeight: 'bold', fontSize: '0.85rem' }}>📍 {market.distance} km</div>
                                                <div style={{ color: '#166534', fontSize: '0.7rem' }}>exact</div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ color: '#166534', fontWeight: 'bold', fontSize: '0.85rem' }}>~{market.distance} km</div>
                                                <div style={{ color: '#166534', fontSize: '0.7rem' }}>est.</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Details box */}
                                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Commodity:</span>
                                        <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>{market.commodity}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Modal Price:</span>
                                        <span style={{ fontWeight: 'bold', color: '#15803d', fontSize: '0.9rem' }}>₹{market.modal_price}/quintal</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Est. Travel Cost:</span>
                                        <span style={{ fontWeight: 'bold', color: '#ea580c', fontSize: '0.9rem' }}>₹{market.travelExpense}</span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                    <button 
                                        onClick={() => handleNavigate(market.market, market.district, market.state)}
                                        style={{ 
                                            flex: 1, 
                                            backgroundColor: '#16a34a', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '0.375rem', 
                                            padding: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                                    >
                                        <Navigation size={18} fill="white" /> Navigate
                                    </button>
                                    <button style={{
                                        width: '48px',
                                        backgroundColor: 'white',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '0.375rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        <Info size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1/-1' }}>
                            <div style={{ color: '#94a3b8', marginBottom: '1rem' }}><MapPin size={48} style={{ margin: '0 auto' }} /></div>
                            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Markets Found</h3>
                            <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto' }}>
                                We couldn't find any markets near you for {detectedCrop || "this crop"}. Try selecting a different state or crop.
                            </p>
                            <button onClick={refresh} className="btn-secondary" style={{ marginTop: '1.5rem' }}>
                                Refresh Data
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveMarket;
