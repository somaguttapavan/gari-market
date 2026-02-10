import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        location: ''
    });
    const [isSuccess, setIsSuccess] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        register(formData);
        setIsSuccess(true);
        // After 2 seconds, redirect to login
        setTimeout(() => {
            navigate('/login');
        }, 2500);
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
            <AnimatePresence mode='wait'>
                {!isSuccess ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card"
                        style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Sprout size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Join AgriGrowth</h2>
                            <p style={{ color: 'var(--text-light)' }}>Empower your farming journey</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                    onChange={handleChange}
                                />
                            </div>
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
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="City, State"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                                Create Account
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-light)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{
                            width: '100%',
                            maxWidth: '450px',
                            padding: '3rem',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.5rem'
                        }}
                    >
                        <CheckCircle size={64} color="var(--success)" />
                        <div>
                            <h2 style={{ fontSize: '1.75rem', color: 'var(--success)', marginBottom: '0.5rem' }}>Successfully Registered!</h2>
                            <p style={{ color: 'var(--text-light)' }}>Welcome to the community. Redirecting you to login...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Register;
