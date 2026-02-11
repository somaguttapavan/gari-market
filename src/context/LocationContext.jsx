import React, { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [locationSource, setLocationSource] = useState(null);
    const [address, setAddress] = useState(null);
    const [userState, setUserState] = useState(null);
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        const isNativeWebView = !!window.ReactNativeWebView || /wv|WebView/i.test(navigator.userAgent);
        setIsNative(isNativeWebView);

        const handleNativeLocation = (lat, lon) => {
            setLocation(prev => {
                if (prev && prev.lat === lat && prev.lon === lon) {
                    return prev; // SAME: Prevent re-render loop
                }

                console.log("Global Context: Location changed, updating state:", lat, lon);

                // Only geocode if we don't have an address or location actually changed significantly
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
                    .catch(() => console.error("Global Context: Geocoding error"));

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
            } catch (e) { }
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
            isNative
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
