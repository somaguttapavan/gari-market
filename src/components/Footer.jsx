import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-light)',
            fontSize: '0.875rem',
            marginTop: 'auto'
        }}>
            <div className="container">
                <p>&copy; 2026 AgriGrowth Solutions. All rights reserved.</p>
                <p style={{ marginTop: '0.5rem' }}>Empowering farmers with technology.</p>
            </div>
        </footer>
    );
};

export default Footer;
