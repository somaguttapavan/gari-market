import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LiveMarket from './pages/LiveMarket';
import QualityCheck from './pages/QualityCheck';
import Cultivation from './pages/Cultivation';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAuthPage && (
        <>
          <div className="desktop-only">
            <Navbar />
          </div>
          <div className="mobile-only">
            <MobileNavbar />
          </div>
        </>
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/live-market" element={user ? <LiveMarket /> : <Navigate to="/login" />} />
          <Route path="/quality-check" element={user ? <QualityCheck /> : <Navigate to="/login" />} />
          <Route path="/cultivation" element={user ? <Cultivation /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      {!isAuthPage && (
        <div className="desktop-only">
          <Footer />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <AppContent />
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
