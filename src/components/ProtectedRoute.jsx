import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    console.log('[ProtectedRoute] Check:', { user, loading, path: location.pathname });

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="animate-spin" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid var(--primary)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%'
                }}></div>
                <p>Authenticating...</p>
            </div>
        );
    }

    if (!user) {
        console.log('[ProtectedRoute] No user found, redirecting to /login from:', location.pathname);
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('[ProtectedRoute] User validated, rendering component:', location.pathname);
    return children;
};

export default ProtectedRoute;
