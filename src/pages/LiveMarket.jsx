import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Info, TrendingUp, Smartphone, Globe, AlertTriangle } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useNearbyMarkets } from '../hooks/useNearbyMarkets';
import { motion } from 'framer-motion';

const LiveMarket = () => {
    const [searchParams] = useSearchParams();
    const detectedCrop = searchParams.get('crop');

    const {
        location, setLocation,
        locationSource, setLocationSource,
        address, setAddress,
        userState, setUserState,
        loading: geoLoading,
        error: geoError,
        setError: setGeoError,
        isNative
    } = useLocation();

    const [manualState, setManualState] = useState('');
    const [locationChecked, setLocationChecked] = useState(false);

    const { markets, loading: marketsLoading, error: marketsError, refresh } = useNearbyMarkets(
        location,
        userState,
        detectedCrop,
        manualState
    );

    const requestGeolocation = React.useCallback(async (retryMode = 'HIGH_ACCURACY') => {
        if (!navigator.geolocation) {
            setGeoError("Your browser doesn't support location services.");
            setLocationChecked(true);
            return;
        }

        if (isNative) return;

        // Reset error state on new request
        if (retryMode === 'HIGH_ACCURACY') {
            setGeoError(null);
            setLocationChecked(false);
        }

        // Helper to handle success
        const handleSuccess = (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLocation({ lat, lon });
            setLocationSource('BROWSER_GPS');
            setLocationChecked(true);
            setGeoError(null);
        };

        // Helper to handle IP fallback
        const tryIpFallback = async () => {
            console.log("GPS failed, trying IP fallback...");
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.latitude && data.longitude) {
                    setLocation({ lat: data.latitude, lon: data.longitude });
                    setLocationSource('IP_GEOLOCATION');
                    setAddress(`${data.city}, ${data.region}`);
                    setUserState(data.region);
                    setLocationChecked(true);
                    setGeoError(null); // Clear any previous GPS errors
                    return true;
                }
            } catch (ipError) {
                console.error("IP Geolocator failed:", ipError);
                return false;
            }
            return false;
        };

        const handleFailure = async (err) => {
            console.warn(`Geolocation attempt (${retryMode}) failed:`, err.message);

            // If timed out or unavailable on high accuracy, try low accuracy
            if (retryMode === 'HIGH_ACCURACY' && (err.code === 3 || err.code === 2)) {
                console.log("Retrying with low accuracy...");
                requestGeolocation('LOW_ACCURACY');
                return;
            }

            // If low accuracy also failed, or permission denied, try IP fallback
            // Don't try IP fallback if permission was explicitly denied (code 1) - debatable, but usually respectful.
            // However, user wants it to work. Let's try IP fallback for everything except explicit denial if we want to be aggressive,
            // but for "Permission denied" (1), the browser blocked it. IP lookup doesn't need browser permission (it's server side logic essentially).
            // So we CAN try IP fallback even if geolocation is denied.

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
        };

        const options = {
            enableHighAccuracy: retryMode === 'HIGH_ACCURACY',
            timeout: retryMode === 'HIGH_ACCURACY' ? 5000 : 10000, // 5s for high, 10s for low
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleFailure, options);

    }, [isNative, setLocation, setLocationSource, setGeoError, setAddress, setUserState]);

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
                    Real-time wholesale prices from markets near you.
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
                <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {locationSource === 'NATIVE_GPS' ? <Smartphone size={20} /> : <Globe size={20} />}
                    <span>
                        <strong>{address || "Location Detected"}</strong>
                        <span style={{ fontSize: '0.85em', marginLeft: '0.5rem', opacity: 0.8 }}>
                            ({locationSource === 'NATIVE_GPS' ? 'Mobile GPS' : locationSource === 'IP_GEOLOCATION' ? 'IP Location' : 'Browser Location'})
                        </span>
                    </span>
                    <button onClick={() => requestGeolocation()} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <Navigation size={14} /> Update
                    </button>
                </div>
            )}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>{geoLoading ? "Identifying your location..." : "Fetching latest prices..."}</p>
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
                                key={`${market.market}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card"
                                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>{market.market}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{market.district}, {market.state}</p>
                                    </div>
                                    <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                                        {market.distance} km
                                    </span>
                                </div>

                                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ color: '#64748b' }}>Price:</span>
                                        <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>₹{market.modal_price}/quintal</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Est. Travel:</span>
                                        <span style={{ fontWeight: '600' }}>₹{market.travelExpense}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleNavigate(market.market, market.district, market.state)}
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: 'auto' }}
                                >
                                    <Navigation size={16} /> Get Directions
                                </button>
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
