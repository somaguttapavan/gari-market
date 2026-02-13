import React, { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => {
        const saved = localStorage.getItem('agri_location');
        return saved ? JSON.parse(saved) : null;
    });
    const [locationSource, setLocationSource] = useState(() => localStorage.getItem('agri_location_source'));
    const [address, setAddress] = useState(() => localStorage.getItem('agri_address'));
    const [userState, setUserState] = useState(() => localStorage.getItem('agri_user_state'));
    const [loading, setLoading] = useState(!location);
    const [error, setError] = useState(null);
    const [isNative] = useState(() => {
        return !!window.ReactNativeWebView || /wv|WebView/i.test(navigator.userAgent);
    });

    useEffect(() => {
        if (location) {
            localStorage.setItem('agri_location', JSON.stringify(location));
        }
        if (locationSource) {
            localStorage.setItem('agri_location_source', locationSource);
        }
        if (address) {
            localStorage.setItem('agri_address', address);
        }
        if (userState) {
            localStorage.setItem('agri_user_state', userState);
        }
    }, [location, locationSource, address, userState]);

    useEffect(() => {

        const handleNativeLocation = (lat, lon) => {
            setLocation(prev => {
                if (prev && Math.abs(prev.lat - lat) < 0.001 && Math.abs(prev.lon - lon) < 0.001) {
                    return prev; // Prevent unnecessary updates
                }

                console.log("Global Context: Location changed, updating state:", lat, lon);

                setLoading(true);
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(res => res.json())
                    .then(geoData => {
                        if (geoData && geoData.address) {
                            const city = geoData.address.city || geoData.address.town || geoData.address.village;
                            const state = geoData.address.state;
                            setAddress(`${city}, ${state}`);
                            if (state) setUserState(state);
                        }
                    })
                    .catch(() => console.error("Global Context: Geocoding error"))
                    .finally(() => setLoading(false));

                return { lat, lon };
            });
            setLocationSource('NATIVE_GPS');
        };

        window.setLocationFromNative = handleNativeLocation;
        window.handleNativeLocation = handleNativeLocation;

        const handleMessage = (event) => {
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data.type === 'NATIVE_LOCATION' && data.coords) {
                    handleNativeLocation(data.coords.latitude, data.coords.longitude);
                }
            } catch {
                // Ignore parsing errors for non-JSON messages
            }
        };

        window.addEventListener('message', handleMessage);
        document.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <LocationContext.Provider value={{
            location, setLocation,
            locationSource, setLocationSource,
            address, setAddress,
            userState, setUserState,
            loading, setLoading,
            error, setError,
            isNative
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
