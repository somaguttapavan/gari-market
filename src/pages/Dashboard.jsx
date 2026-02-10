import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Search, Sprout, TrendingUp, ShieldCheck, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const features = [
        {
            title: 'Live Market',
            desc: 'Track nearest market prices within 100km radius using live GPS.',
            icon: <ShoppingCart size={32} />,
            path: '/live-market',
            color: 'var(--primary)'
        },
        {
            title: 'Quality Check',
            desc: 'AI-powered crop quality assessment via photo upload.',
            icon: <Search size={32} />,
            path: '/quality-check',
            color: 'var(--accent)'
        },
        {
            title: 'Cultivation',
            desc: 'Learn organic farming techniques and watch expert videos.',
            icon: <Sprout size={32} />,
            path: '/cultivation',
            color: '#4caf50'
        }
    ];

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <header style={{ marginBottom: '3rem' }}>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ fontSize: '2.5rem', color: 'var(--primary-dark)' }}
                >
                    Welcome, {user?.name || 'Farmer'}!
                </motion.h2>
                <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>
                    Here's what's happening in your agricultural ecosystem today.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{
                            padding: '2.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            transition: 'transform 0.2s',
                        }}
                        whileHover={{ y: -10, boxShadow: 'var(--shadow-lg)' }}
                        onClick={() => navigate(feature.path)}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '1rem',
                            backgroundColor: `${feature.color}15`,
                            color: feature.color,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {feature.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.75rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>{feature.desc}</p>
                        </div>
                        <div style={{ marginTop: 'auto', color: feature.color, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Get Started <TrendingUp size={16} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldCheck color="var(--primary)" /> Market Insights
                    </h3>
                    <div style={{ height: '200px', backgroundColor: '#f1f5f9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                        <p>Market trend chart will appear here.</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'var(--primary-dark)', color: 'white' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare /> AI Assistant
                    </h3>
                    <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Need help with soil or fertilizers? Ask our AI expert for instant advice.
                    </p>
                    <button
                        onClick={() => navigate('/cultivation')}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: 'white',
                            color: 'var(--primary-dark)',
                            fontWeight: '700'
                        }}
                    >
                        Start Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
