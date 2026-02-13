import React from 'react';
import { Sprout, Youtube, BookOpen, MessageCircle } from 'lucide-react';
import Chatbot from '../components/Chatbot';
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
                            {guides.map((guide, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ y: -2 }}
                                    className="glass-card video-card"
                                >
                                    <div className="video-thumb">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={guide.videoUrl}
                                            title={guide.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
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
                            ))}
                        </div>
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
