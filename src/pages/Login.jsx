import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// Detect WebView environment — window.__AGRI_WEBVIEW__ is set by injectedJavaScript in App.js
const isInWebView = () =>
    typeof window !== 'undefined' &&
    (window.__AGRI_WEBVIEW__ === true || !!window.ReactNativeWebView);

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isWebView, setIsWebView] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        setIsWebView(isInWebView());

        const interval = setInterval(() => {
            if (isInWebView()) {
                setIsWebView(true);
                clearInterval(interval);
            }
        }, 100);

        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 2000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    // ── Listen for native Google auth result ────────────────────────────────
    useEffect(() => {
        if (!isWebView) return;

        const handleAuthResult = (event) => {
            const detail = event.detail;
            setGoogleLoading(false);
            if (detail && detail.success && detail.user) {
                googleLogin(detail.user);
                navigate('/');
            } else if (detail && detail.error && detail.error !== 'cancelled') {
                setError('Google Sign-In failed. Please try again.');
            }
        };

        window.addEventListener('GOOGLE_AUTH_RESULT', handleAuthResult);
        return () => window.removeEventListener('GOOGLE_AUTH_RESULT', handleAuthResult);
    }, [isWebView, googleLogin, navigate]);

    // ── Trigger native Google auth ───────────────────────────────────────────
    const handleNativeGoogleLogin = useCallback(() => {
        if (!window.ReactNativeWebView) return;
        setGoogleLoading(true);
        setError('');
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GOOGLE_AUTH_REQUEST' }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(formData);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Invalid email or password');
        }
        setIsLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Sprout size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Login</h2>
                    <p style={{ color: 'var(--text-light)' }}>Access your farming dashboard</p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* ── Google Sign-In button ── */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {isWebView ? (
                        // Native Google OAuth via system browser (Google-approved method)
                        <button
                            id="native-google-login-btn"
                            onClick={handleNativeGoogleLogin}
                            disabled={googleLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                width: '100%',
                                padding: '0.7rem 1.25rem',
                                borderRadius: '50px',
                                border: '1.5px solid #dadce0',
                                backgroundColor: googleLoading ? '#f8fafc' : '#fff',
                                cursor: googleLoading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#3c4043',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                transition: 'box-shadow 0.2s, background 0.2s',
                                outline: 'none',
                                opacity: googleLoading ? 0.7 : 1,
                            }}
                        >
                            {/* Google "G" SVG logo */}
                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                                <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
                            </svg>
                            {googleLoading ? 'Opening Google...' : 'Continue with Google'}
                        </button>
                    ) : (
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                try {
                                    const decoded = jwtDecode(credentialResponse.credential);
                                    googleLogin(decoded);
                                    navigate('/');
                                } catch (err) {
                                    setError('Failed to decode Google token.');
                                }
                            }}
                            onError={() => {
                                setError('Google Login Failed.');
                            }}
                            theme="filled_blue"
                            shape="pill"
                            text="continue_with"
                        />
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-light)' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <span style={{ padding: '0 1rem', fontSize: '0.875rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{ marginTop: '1rem', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Signing In...' : (
                            <>
                                <LogIn size={18} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-light)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
