import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, AlertTriangle, ArrowRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQualityCheck } from '../hooks/useQualityCheck';

export const CROPS = [
    'Tomato', 'Green Chillies', 'Bitter Guard', 'Cabbage', 'Methi Leaves',
    'Thota-Kura', 'Beet-root', 'Carrot', 'Ladies Finger', 'Ginger',
    'Brinjal', 'Onion', 'Sweet Potato', 'Potato', 'Ivy Gourd',
    'Bottle Gourd', 'Grafting Beera', 'Cucumber', 'Broccoli', 'Red Cabbage'
];

const QualityCheck = () => {
    const {
        targetCrop,
        setTargetCrop,
        selectedImage,
        isAnalyzing,
        result,
        error,
        handleImageUpload,
        runAnalysis,
        reset
    } = useQualityCheck();

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)' }}>AI Quality Check</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                    Select your crop and upload a photo to instantly assess its quality.
                </p>
                <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <select
                        value={targetCrop}
                        onChange={(e) => setTargetCrop(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--primary-light)',
                            backgroundColor: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'var(--primary-dark)'
                        }}
                    >
                        <option value="">-- Select Crop --</option>
                        {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

                    {!selectedImage ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                width: '100%',
                                height: '300px',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: 'rgba(241, 245, 249, 0.5)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                        >
                            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '50%', boxShadow: 'var(--shadow)' }}>
                                <Camera size={40} color="var(--primary)" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: '600', color: 'var(--text)' }}>Click to upload or take a photo</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>PNG, JPG or JPEG (Max 10MB)</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
                                <img src={selectedImage} alt="Crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {!result && !error && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <button onClick={runAnalysis} className="btn-primary" disabled={isAnalyzing}>
                                            {isAnalyzing ? (
                                                <>Analyzing...</>
                                            ) : (
                                                <><Search size={20} /> Check Quality</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={reset}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                >
                                    Change Photo
                                </button>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ width: '100%', textAlign: 'center' }}
                            >
                                <div style={{
                                    height: '4px',
                                    width: '100%',
                                    backgroundColor: '#e2e8f0',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    marginBottom: '1rem'
                                }}>
                                    <motion.div
                                        animate={{ x: [-400, 800] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        style={{ height: '100%', width: '30%', backgroundColor: 'var(--primary)' }}
                                    />
                                </div>
                                <p style={{ color: 'var(--primary)', fontWeight: '600' }}>Running AI Vision detection...</p>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    backgroundColor: '#fef2f2',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #fee2e2',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    color: '#991b1b'
                                }}
                            >
                                <AlertTriangle size={24} />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    width: '100%',
                                    padding: '2rem',
                                    backgroundColor: result.quality === 'Good' ? '#f0fdf4' : '#fff7ed',
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${result.quality === 'Good' ? '#dcfce7' : '#ffedd5'}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            padding: '0.75rem',
                                            borderRadius: '50%',
                                            backgroundColor: result.quality === 'Good' ? '#dcfce7' : '#ffedd5',
                                            color: result.quality === 'Good' ? 'var(--success)' : 'var(--accent)'
                                        }}>
                                            <CheckCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Detection: {result.crop}</h4>
                                            <p style={{ fontSize: '0.875rem' }}>Confidence: {result.confidence}%</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '2rem',
                                            fontWeight: '800',
                                            fontSize: '0.875rem',
                                            backgroundColor: result.quality === 'Good' ? 'var(--success)' : 'var(--accent)',
                                            color: 'white'
                                        }}>
                                            QUALITY: {result.quality.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>{result.advice}</p>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => navigate(`/live-market?crop=${result.crop}`)}
                                        className="btn-primary"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        View Best Markets for {result.crop} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default QualityCheck;
