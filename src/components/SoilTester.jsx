import React, { useState } from 'react';
import { Microscope, Activity, Thermometer, Droplets, CheckCircle, AlertTriangle, Sprout, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SoilTester = () => {
    const [formData, setFormData] = useState({
        ph: '',
        nitrogen: 'Medium',
        phosphorus: '',
        potassium: '',
        crop: 'tomato',
        climate: 'Tropical'
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const analyzeSoil = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);
        setError(null);

        try {
            let nitrogenValue = 400;
            if (formData.nitrogen === 'Low') nitrogenValue = 200;
            if (formData.nitrogen === 'High') nitrogenValue = 600;

            const payload = {
                ph: parseFloat(formData.ph),
                nitrogen: nitrogenValue,
                phosphorus: parseFloat(formData.phosphorus) || 20,
                potassium: parseFloat(formData.potassium) || 200,
                moisture: 50,
                organic_carbon: 0.5,
                crop: formData.crop,
                location: formData.climate
            };

            const response = await fetch('/api/analyze-soil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = 'Analysis failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } catch {
                    errorMessage = `Server Error (${response.status}): ${response.statusText || 'Could not reach analysis service'}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setResults(data);

        } catch (err) {
            console.error(err);
            const isConnectionRefused = err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED') || err.message.includes('NetworkError');
            if (isConnectionRefused) {
                setError('backend_offline');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card soil-tester-card" style={{ padding: '2rem', marginTop: '2rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Microscope size={28} color="var(--primary)" /> Smart Soil Analyzer
            </h3>

            <div className="soil-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="soil-form">
                    <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                        Enter your soil params to get AI-driven crop recommendations.
                    </p>

                    <form onSubmit={analyzeSoil}>
                        {/* Row 1: Crop and Climate */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    <Sprout size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    Target Crop
                                </label>
                                <select
                                    name="crop"
                                    value={formData.crop}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                >
                                    <option value="tomato">Tomato</option>
                                    <option value="potato">Potato</option>
                                    <option value="rice">Rice</option>
                                    <option value="wheat">Wheat</option>
                                    <option value="corn">Corn</option>
                                    <option value="cotton">Cotton</option>
                                    <option value="chili">Chili</option>
                                    <option value="spinach">Spinach</option>
                                    <option value="carrot">Carrot</option>
                                    <option value="eggplant">Eggplant</option>
                                    <option value="cabbage">Cabbage</option>
                                    <option value="onion">Onion</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    <Thermometer size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    Climate
                                </label>
                                <select
                                    name="climate"
                                    value={formData.climate}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                >
                                    <option value="Tropical">Tropical</option>
                                    <option value="Temperate">Temperate</option>
                                    <option value="Dry">Dry</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: pH and Nitrogen */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    <Activity size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    pH Level
                                </label>
                                <input
                                    type="number"
                                    name="ph"
                                    step="0.1"
                                    min="0"
                                    max="14"
                                    required
                                    value={formData.ph}
                                    onChange={handleChange}
                                    placeholder="6.5"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    <Droplets size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    Nitrogen
                                </label>
                                <select
                                    name="nitrogen"
                                    value={formData.nitrogen}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Phosphorus and Potassium */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    <FlaskConical size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    Phosphorus (P)
                                </label>
                                <input
                                    type="number"
                                    name="phosphorus"
                                    required
                                    value={formData.phosphorus}
                                    onChange={handleChange}
                                    placeholder="kg/ha (e.g. 20)"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    <FlaskConical size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    Potassium (K)
                                </label>
                                <input
                                    type="number"
                                    name="potassium"
                                    required
                                    value={formData.potassium}
                                    onChange={handleChange}
                                    placeholder="kg/ha (e.g. 200)"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? (
                                <>Analyzing...</>
                            ) : (
                                <>Run Analysis <Microscope size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="soil-results" style={{ backgroundColor: '#f8fafc', borderRadius: '1rem', padding: '1.5rem', minHeight: '300px' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                        Analysis Results
                    </h4>

                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Processing soil data...</p>
                        </div>
                    )}

                    {/* Error banner */}
                    {!loading && error && (
                        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.75rem', padding: '1.25rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <AlertTriangle size={22} color="#c2410c" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    {error === 'backend_offline' ? (
                                        <>
                                            <p style={{ fontWeight: '700', color: '#c2410c', marginBottom: '0.5rem' }}>Backend Server Not Running</p>
                                            <p style={{ fontSize: '0.875rem', color: '#9a3412' }}>
                                                The AI analysis server is offline. Start it with:
                                            </p>
                                            <pre style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#1e293b', color: '#94a3b8', borderRadius: '0.5rem', fontSize: '0.8rem', overflowX: 'auto' }}>
                                                {`cd backend\npython main.py`}
                                            </pre>
                                        </>
                                    ) : (
                                        <>
                                            <p style={{ fontWeight: '700', color: '#c2410c', marginBottom: '0.25rem' }}>Analysis Error</p>
                                            <p style={{ fontSize: '0.875rem', color: '#9a3412' }}>{error}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && !error && !results && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>
                            <Microscope size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p>Run the analysis to see crop recommendations here.</p>
                        </div>
                    )}

                    {!loading && results && (
                        <div className="results-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h5 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                        Soil Health Score: {results.soil_health_score}/100
                                    </h5>
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '0.25rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        backgroundColor: results.soil_status === 'Good' ? '#dcfce7' : results.soil_status === 'Moderate' ? '#fef9c3' : '#fee2e2',
                                        color: results.soil_status === 'Good' ? '#166534' : results.soil_status === 'Moderate' ? '#854d0e' : '#991b1b'
                                    }}>
                                        Status: {results.soil_status}
                                    </span>
                                </div>
                            </div>

                            {/* AI Recommendations Section */}
                            {results.ai_crop_recommendations && results.ai_crop_recommendations.length > 0 && (
                                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                                    <h6 style={{ fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d' }}>
                                        <Sprout size={18} /> AI Recommended Crops:
                                    </h6>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {results.ai_crop_recommendations.map((crop, i) => (
                                            <span key={i} style={{
                                                backgroundColor: 'white',
                                                border: '1px solid #86efac',
                                                color: '#166534',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                textTransform: 'capitalize',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}>
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                        Based on NPK, pH, and local climate data.
                                    </p>
                                </div>
                            )}

                            {/* Vegetable Suggestions Section (Rule Based) */}
                            {results.vegetable_recommendations && results.vegetable_recommendations.length > 0 && (
                                <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #fed7aa' }}>
                                    <h6 style={{ fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#c2410c' }}>
                                        <Sprout size={18} /> Recommended Vegetables:
                                    </h6>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {results.vegetable_recommendations.map((veg, i) => (
                                            <span key={i} style={{
                                                backgroundColor: 'white',
                                                border: '1px solid #fdba74',
                                                color: '#c2410c',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.9rem',
                                                fontWeight: '500',
                                                textTransform: 'capitalize',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}>
                                                {veg}
                                            </span>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#9a3412', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                        Suitable for your soil type and nutrient levels.
                                    </p>
                                </div>
                            )}

                            {results.deficiencies.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h6 style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertTriangle size={16} color="#eab308" /> Deficiencies Detected:
                                    </h6>
                                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                                        {results.deficiencies.map((def, i) => <li key={i}>{def}</li>)}
                                    </ul>
                                </div>
                            )}

                            {results.recommendations.length > 0 && (
                                <div>
                                    <h6 style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle size={16} color="var(--primary)" /> Recommendations:
                                    </h6>
                                    {results.recommendations.map((rec, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            style={{
                                                backgroundColor: 'white',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid #e2e8f0',
                                                marginBottom: '0.5rem'
                                            }}
                                        >
                                            <p style={{ margin: 0, fontWeight: '600', color: '#334155' }}>{rec.fertilizer}</p>
                                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                                Apply {rec.quantity} • {rec.application_time}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {results.advisory_notes.length > 0 && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', fontStyle: 'italic' }}>
                                        "{results.advisory_notes[0]}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SoilTester;
