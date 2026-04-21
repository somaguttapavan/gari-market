import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

// Dynamically resolve the host so this works even when the laptop IP changes
const getAppUrl = () => {
  // If we have a production EXPO_PUBLIC environment variable, use it.
  if (process.env.EXPO_PUBLIC_APP_URL) {
    return process.env.EXPO_PUBLIC_APP_URL;
  }
  // Try to get the host from Expo's manifest (works in Expo Go)
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0]; // strip the metro port, keep only the IP
    return `http://${host}:5173`;
  }
  // Fallback: use the current known IP
  return 'http://10.142.54.77:5173';
};

const APP_URL = getAppUrl();

export default function App() {
  const [error, setError] = useState(false);
  const [userName, setUserName] = useState('Farmer');
  const [location, setLocation] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const webViewRef = useRef(null);

  useEffect(() => {
    let locationSubscription = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (loc) => {
          setLocation(loc);
          if (webViewRef.current) {
            const script = `
              if (window.handleNativeLocation) {
                window.handleNativeLocation(${loc.coords.latitude}, ${loc.coords.longitude});
              } else {
                window.postMessage({
                  type: 'NATIVE_LOCATION',
                  coords: {
                    latitude: ${loc.coords.latitude},
                    longitude: ${loc.coords.longitude}
                  }
                }, '*');
              }
              true;
            `;
            webViewRef.current.injectJavaScript(script);
          }
        }
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Safety timeout for syncing state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSyncing) {
        setIsSyncing(false);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isSyncing]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'USER_DATA' && data.name) {
        setUserName(data.name);
      }
      if (data.type === 'SYNC_READY') {
        setIsSyncing(false);
        // Force send the current location if we have it to jumpstart the WebView
        if (location && webViewRef.current) {
          const script = `
            if (window.handleNativeLocation) {
              window.handleNativeLocation(${location.coords.latitude}, ${location.coords.longitude});
            }
          `;
          webViewRef.current.injectJavaScript(script);
        }
      }
      if (data.type === 'OPEN_MAPS' && data.query) {
        const url = `geo:0,0?q=${encodeURIComponent(data.query)}`;
        Linking.openURL(url).catch(() => {
          // Fallback to browser if geo scheme fails
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.query)}`);
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleRetry = () => {
    setError(false);
    setIsSyncing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor="#2e7d32" />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Agri-Growth</Text>
              <Text style={styles.nameText}>{userName}</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: location ? '#4ade80' : '#fbbf24' }]} />
            <Text style={styles.statusText}>{location ? 'GPS Live' : 'Locating...'}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorArea}>
            <Text style={styles.errorTitle}>Offline or Error</Text>
            <Text style={styles.errorSub}>Could not reach the server at {APP_URL}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryText}>Reconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.webContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: APP_URL }}
              style={styles.webview}
              onError={(e) => {
                console.log('WebView Error:', e.nativeEvent);
                setError(true);
              }}
              onHttpError={(e) => console.log('WebView HTTP Error:', e.nativeEvent)}
              onLoadEnd={() => console.log('WebView Loaded')}
              onMessage={onMessage}
              startInLoadingState={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsBackForwardNavigationGestures={true}
              injectedJavaScript={`
                (function() {
                  setInterval(() => {
                    try {
                      const user = localStorage.getItem('agri_user');
                      if (user) {
                        const parsed = JSON.parse(user);
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'USER_DATA',
                          name: parsed.name
                        }));
                      }
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYNC_READY' }));
                    } catch (e) {}
                  }, 2000);

                  window.handleNativeLocation = function(lat, lon) {
                      // Call the global handler injected by LocationContext if available
                      if (typeof window.setLocationFromNative === 'function') {
                          window.setLocationFromNative(lat, lon);
                      } else {
                          // Fallback to postMessage bridge
                          window.postMessage({
                              type: 'NATIVE_LOCATION',
                              coords: { latitude: lat, longitude: lon }
                          }, '*');
                      }
                  };
                })();
                true;
              `}
            />

            {isSyncing && (
              <View style={styles.nativeLoading}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={styles.syncText}>Syncing Farmer Profile...</Text>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e7d32',
  },
  header: {
    height: 75,
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nameText: {
    color: 'white',
    fontSize: 19,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  nativeLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  syncText: {
    marginTop: 20,
    color: '#2e7d32',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 32,
    elevation: 6,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  retryText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  }
});
