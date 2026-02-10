import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Sprout, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="glass-card" style={{
            margin: '0',
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '0',
            zIndex: 100,
            border: 'none',
            borderRadius: '0',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h1 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    AgriGrowth
                </h1>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <NavLink to="/live-market" style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: isActive ? 'var(--primary)' : 'var(--text-light)',
                        fontWeight: isActive ? '700' : '500',
                        transition: 'color 0.2s'
                    })}>
                        <ShoppingCart size={20} />
                        Live Market
                    </NavLink>

                    <NavLink to="/quality-check" style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: isActive ? 'var(--primary)' : 'var(--text-light)',
                        fontWeight: isActive ? '700' : '500',
                        transition: 'color 0.2s'
                    })}>
                        <Search size={20} />
                        Quality Check
                    </NavLink>

                    <NavLink to="/cultivation" style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: isActive ? 'var(--primary)' : 'var(--text-light)',
                        fontWeight: isActive ? '700' : '500',
                        transition: 'color 0.2s'
                    })}>
                        <Sprout size={20} />
                        Cultivation
                    </NavLink>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <NavLink to="/profile" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow)'
                }}>
                    <User size={24} />
                </NavLink>
                <button onClick={logout} style={{ color: 'var(--error)', background: 'none' }}>
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
