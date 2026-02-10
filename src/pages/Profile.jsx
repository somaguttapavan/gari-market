import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Mail, Phone, Calendar, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: '3rem', position: 'relative' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <User size={64} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-dark)' }}>{user.name}</h2>
                        <p style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <ShieldCheck size={16} color="var(--success)" /> Verified Farmer Portfolio
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', color: 'var(--primary)' }}>
                                <Mail size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</p>
                                <p style={{ fontWeight: '600' }}>{user.email || 'farmer@example.com'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', color: 'var(--primary)' }}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</p>
                                <p style={{ fontWeight: '600' }}>{user.location || 'Punjab, India'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', color: 'var(--primary)' }}>
                                <Phone size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</p>
                                <p style={{ fontWeight: '600' }}>+91 98765-43210</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', color: 'var(--primary)' }}>
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</p>
                                <p style={{ fontWeight: '600' }}>Feb 2026</p>
                            </div>
                        </div>
                    </div>

                    <hr style={{ margin: '2.5rem 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            backgroundColor: '#fff',
                            border: '1px solid #fee2e2',
                            color: 'var(--error)',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                        <LogOut size={20} /> Sign Out from AgriGrowth
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
