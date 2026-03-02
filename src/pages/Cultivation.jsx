import React from 'react';
import { Sprout, Youtube, BookOpen, MessageCircle } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import SoilTester from '../components/SoilTester';
import { motion } from 'framer-motion';
import { useCultivation } from '../hooks/useCultivation';

const Cultivation = () => {
    const { guides, principles } = useCultivation();

    return (
        <div className="container">
            <header className="cultivation-header">
                <h2><Sprout size={36} /> <span>Organic Cultivation</span></h2>
                <p>Master the art of natural farming with our guides and AI assistant.</p>
            </header>

            <div className="cultivation-grid">
                <main>
                    <section>
                        <h3 className="section-title">
                            <Youtube color="#ff0000" /> <span>Featured Training Videos</span>
                        </h3>
                        <div className="video-list-container">
                            {guides.map((guide, index) => {
                                // Extract video ID and build thumbnail + watch URLs
                                const videoId = guide.videoUrl.split('/embed/')[1]?.split('?')[0];
                                const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                                const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

                                return (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -2 }}
                                        className="glass-card video-card"
                                    >
                                        {/* Clickable thumbnail — opens YouTube in a new tab */}
                                        <a
                                            href={watchUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="video-thumb"
                                            style={{ display: 'block', position: 'relative', cursor: 'pointer', textDecoration: 'none', overflow: 'hidden', borderRadius: '0.5rem 0.5rem 0 0' }}
                                            aria-label={`Watch ${guide.title} on YouTube`}
                                        >
                                            <img
                                                src={thumbUrl}
                                                alt={guide.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                loading="lazy"
                                            />
                                            {/* Play button overlay */}
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(0,0,0,0.25)',
                                                transition: 'background 0.2s'
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
                                            >
                                                <div style={{
                                                    width: 52, height: 52, borderRadius: '50%',
                                                    background: '#ff0000', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </a>
                                        <div className="video-content">
                                            <div className="tag-container">
                                                {guide.tags.map(tag => (
                                                    <span key={tag} className="agri-tag">
                                                        {tag.toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                            <h4>{guide.title}</h4>
                                            <p>{guide.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    <section>
                        <SoilTester />
                    </section>

                    <section className="principles-section">
                        <h3 className="section-title">
                            <BookOpen color="var(--primary)" /> Organic Farming Principles
                        </h3>
                        <div className="glass-card principles-card">
                            <div className="principles-grid">
                                {principles.map(p => (
                                    <div key={p.id} className={`principle-item ${p.id}`}>
                                        <h5>{p.id === 'bio' ? '1. ' : p.id === 'fertility' ? '2. ' : p.id === 'water' ? '3. ' : '4. '}{p.title}</h5>
                                        <p>{p.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <aside className="cultivation-aside">
                    <div className="chat-header">
                        <MessageCircle color="var(--primary)" /> <strong>AgriExperts Chat</strong>
                    </div>
                    <Chatbot />
                </aside>
            </div>
        </div>
    );
};

export default Cultivation;
