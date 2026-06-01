import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

// ─── Configuration ────────────────────────────────────────────────────────────
const PRODUCTION_URL = 'https://gari-market-q1pj.vercel.app';
const GOOGLE_CLIENT_ID = '908874412227-0td5t7ftigm6itgcjh0m0sd77jn64fim.apps.googleusercontent.com';

let LAPTOP_IP = '10.221.48.129';
const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri;
if (hostUri) {
  LAPTOP_IP = hostUri.split(':')[0];
}
const DEV_URL = `http://${LAPTOP_IP}:5173`;

// The web app URL that is currently loading in the WebView
// Google OAuth will redirect back to this origin after login
const OAUTH_REDIRECT_BASE = 'https://gari-market-q1pj.vercel.app';

export default function App() {
  const [error, setError] = useState(false);
  const [userName, setUserName] = useState('Farmer');
  const [location, setLocation] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [loadUrl, setLoadUrl] = useState(PRODUCTION_URL);
  const webViewRef = useRef(null);
  const activeUrlRef = useRef(PRODUCTION_URL);

  // ─── Dev server detection ────────────────────────────────────────────────
  useEffect(() => {
    const checkDevServer = async () => {
      try {
        const resp = await fetch(DEV_URL, { method: 'HEAD' });
        if (resp.ok) {
          console.log('Vite Dev Server detected! Loading live version...');
          setLoadUrl(DEV_URL);
          activeUrlRef.current = DEV_URL;
          return;
        }
      } catch (e) {
        // Dev server not reachable
      }
      console.log('Using production URL:', PRODUCTION_URL);
      setLoadUrl(PRODUCTION_URL);
      activeUrlRef.current = PRODUCTION_URL;
    };
    checkDevServer();
  }, []);

  // ─── Native Google OAuth (system browser approach) ───────────────────────
  const handleGoogleAuth = useCallback(async () => {
    try {
      // Get the correct deep link scheme for returning to the app
      let appScheme = 'com.agrigrowth.app://';
      const isExpoGo = Constants?.executionEnvironment === 'storeClient';
      if (isExpoGo) {
        const hostPort = hostUri ? hostUri.split(':')[1] || '8081' : '8081';
        appScheme = `exp://${LAPTOP_IP}:${hostPort}`;
      }

      // The redirect URI must be registered in Google Cloud Console.
      // We redirect back to the production URL /auth/callback so Google accepts it.
      const redirectUri = encodeURIComponent(`${OAUTH_REDIRECT_BASE}/auth/callback`);
      const stateParam = encodeURIComponent(appScheme);
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=token` +
        `&scope=openid%20profile%20email` +
        `&prompt=select_account` +
        `&state=${stateParam}`;

      // Open in system browser — Google allows this (unlike WebView)
      const result = await WebBrowser.openAuthSessionAsync(authUrl, `${OAUTH_REDIRECT_BASE}/auth/callback`);

      if (result.type === 'success' && result.url) {
        // Extract access_token from the redirect URL fragment
        const urlFragment = result.url.split('#')[1] || result.url.split('?')[1] || '';
        const params = Object.fromEntries(urlFragment.split('&').map(p => p.split('=')));
        const accessToken = params['access_token'];

        if (accessToken) {
          // Fetch user profile from Google
          const userResp = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
          );
          const userInfo = await userResp.json();

          if (webViewRef.current && userInfo.sub) {
            // Safely escape all string values for injection
            const safe = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
            const script = `
              (function() {
                window.dispatchEvent(new CustomEvent('GOOGLE_AUTH_RESULT', {
                  detail: {
                    success: true,
                    user: {
                      sub: '${safe(userInfo.sub)}',
                      name: '${safe(userInfo.name)}',
                      email: '${safe(userInfo.email)}',
                      picture: '${safe(userInfo.picture)}',
                      given_name: '${safe(userInfo.given_name)}',
                      email_verified: ${userInfo.email_verified ? 'true' : 'false'}
                    }
                  }
                }));
              })();
              true;
            `;
            webViewRef.current.injectJavaScript(script);
          } else {
            // No sub or no userInfo — auth failed
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`
                window.dispatchEvent(new CustomEvent('GOOGLE_AUTH_RESULT', {
                  detail: { success: false, error: 'Could not retrieve user info' }
                }));
                true;
              `);
            }
          }
        } else {
          // No access token in redirect
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              window.dispatchEvent(new CustomEvent('GOOGLE_AUTH_RESULT', {
                detail: { success: false, error: 'No access token received' }
              }));
              true;
            `);
          }
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User closed the browser — silently ignore
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.dispatchEvent(new CustomEvent('GOOGLE_AUTH_RESULT', {
              detail: { success: false, error: 'cancelled' }
            }));
            true;
          `);
        }
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.dispatchEvent(new CustomEvent('GOOGLE_AUTH_RESULT', {
            detail: { success: false, error: 'Authentication error' }
          }));
          true;
        `);
      }
    }
  }, []);

  // ─── Location tracking ───────────────────────────────────────────────────
  useEffect(() => {
    let locationSubscription = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (loc) => {
          setLocation(loc);
          if (webViewRef.current) {
            const script = `
              if (window.handleNativeLocation) {
                window.handleNativeLocation(${loc.coords.latitude}, ${loc.coords.longitude});
              } else {
                window.postMessage({
                  type: 'NATIVE_LOCATION',
                  coords: { latitude: ${loc.coords.latitude}, longitude: ${loc.coords.longitude} }
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
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  // ─── Safety timeout for sync state ──────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSyncing) setIsSyncing(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isSyncing]);

  // ─── WebView message handler ─────────────────────────────────────────────
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'USER_DATA' && data.name) {
        setUserName(data.name);
      }

      if (data.type === 'SYNC_READY') {
        setIsSyncing(false);
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
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.query)}`);
        });
      }

      // ── Google Auth triggered from WebView ───────────────────────────────
      if (data.type === 'GOOGLE_AUTH_REQUEST') {
        handleGoogleAuth();
      }

      if (data.type === 'OPEN_SYSTEM_BROWSER' && data.url) {
        Linking.openURL(data.url).catch((e) => console.log('Failed to open browser:', e));
      }
    } catch {
      // Ignore non-JSON messages
    }
  };

  const handleRetry = () => {
    setError(false);
    setIsSyncing(true);
    if (webViewRef.current) webViewRef.current.reload();
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
            <Text style={styles.errorTitle}>Application Error</Text>
            <Text style={styles.errorSub}>The bundled UI failed to initialize. Please check logs.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryText}>Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.webContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: loadUrl }}
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
              allowUniversalAccessFromFileURLs={true}
              mixedContentMode="always"
              originWhitelist={['*']}
              userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
              injectedJavaScript={`
                (function() {
                  // Mark as WebView for the frontend
                  window.__AGRI_WEBVIEW__ = true;

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
                    if (typeof window.setLocationFromNative === 'function') {
                      window.setLocationFromNative(lat, lon);
                    } else {
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
  container: { flex: 1, backgroundColor: '#2e7d32' },
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  avatarText: { color: 'white', fontSize: 18, fontWeight: '900' },
  welcomeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nameText: { color: 'white', fontSize: 19, fontWeight: '800' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
  webContainer: { flex: 1, backgroundColor: '#ffffff', overflow: 'hidden' },
  webview: { flex: 1 },
  nativeLoading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  syncText: { marginTop: 20, color: '#2e7d32', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  errorArea: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 40 },
  errorTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
  errorSub: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
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
  retryText: { color: 'white', fontWeight: '800', fontSize: 18 },
});
