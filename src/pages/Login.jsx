import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
