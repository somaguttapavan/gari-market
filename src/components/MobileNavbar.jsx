import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Search, Sprout, User } from 'lucide-react';

const MobileNavbar = () => {
    return (
        <nav className="mobile-navbar glass-card">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>

            <NavLink to="/live-market" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <ShoppingCart size={24} />
                <span>Market</span>
            </NavLink>

            <NavLink to="/quality-check" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <div className="fab">
                    <Search size={24} color="white" />
                </div>
                <span style={{ marginTop: '20px' }}>Scan</span>
            </NavLink>

            <NavLink to="/cultivation" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Sprout size={24} />
                <span>Tips</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default MobileNavbar;
