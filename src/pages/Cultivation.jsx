import React from 'react';
import { Sprout, Youtube, BookOpen, MessageCircle } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import { motion } from 'framer-motion';

const Cultivation = () => {
    const guides = [
        { title: 'Tomato', desc: 'Grow high-yield organic tomatoes.', videoUrl: 'https://www.youtube.com/embed/yl9IZrwMgW4', tags: ['Vegetables', 'Beginner'] },
        { title: 'Green Chillies', desc: 'Successful green chilli cultivation.', videoUrl: 'https://www.youtube.com/embed/NTv32Z2362s', tags: ['Spices', 'Beginner'] },
        { title: 'Bitter Guard', desc: 'Organic bitter gourd farming tips.', videoUrl: 'https://www.youtube.com/embed/p_oSCkhoESs', tags: ['Vegetables', 'Organic'] },
        { title: 'Cabbage', desc: 'Growing fresh organic cabbage.', videoUrl: 'https://www.youtube.com/embed/UPk72G1CIt8', tags: ['Vegetables', 'Essential'] },
        { title: 'Methi Leaves', desc: 'Quick guide for methi leaves.', videoUrl: 'https://www.youtube.com/embed/djRdwP2FbWA', tags: ['Leafy', 'Fast-Grow'] },
        { title: 'Thota-Kura', desc: 'Traditional amaranth cultivation.', videoUrl: 'https://www.youtube.com/embed/68pjfuPVhhw', tags: ['Leafy', 'Health'] },
        { title: 'Beet-root', desc: 'Organic beetroot farming guide.', videoUrl: 'https://www.youtube.com/embed/UG0c-hrZx90', tags: ['Root', 'Beginner'] },
        { title: 'Carrot', desc: 'Sweet organic carrots cultivation.', videoUrl: 'https://www.youtube.com/embed/hu2qdD1Z3wg', tags: ['Root', 'Advanced'] },
        { title: 'Ladies Finger', desc: 'Okra (Bhendi) organic farming.', videoUrl: 'https://www.youtube.com/embed/gB_VIGNXLy8', tags: ['Vegetables', 'Easy'] },
        { title: 'Ginger', desc: 'Profitable organic ginger farming.', videoUrl: 'https://www.youtube.com/embed/UC-MGWnRO80', tags: ['Spices', 'Advanced'] },
        { title: 'Brinjal', desc: 'Eggplant organic cultivation.', videoUrl: 'https://www.youtube.com/embed/X2cmOn4xtr0', tags: ['Vegetables', 'Common'] },
        { title: 'Onion', desc: 'Step-by-step onion farming.', videoUrl: 'https://www.youtube.com/embed/w_CC3HWd6Fw', tags: ['Essentials', 'Advanced'] },
        { title: 'Sweet Potato', desc: 'Growing organic sweet potatoes.', videoUrl: 'https://www.youtube.com/embed/vXVSw7wTsso', tags: ['Root', 'Organic'] },
        { title: 'Potato', desc: 'Best practices for organic potato.', videoUrl: 'https://www.youtube.com/embed/AETcaEQuRdw', tags: ['Basic', 'High-Yield'] },
        { title: 'Ivy Gourd', desc: 'Continuous harvest ivy gourd.', videoUrl: 'https://www.youtube.com/embed/I4gm_R3u_Lw', tags: ['Vines', 'Essential'] },
        { title: 'Bottle Gourd', desc: 'Easy bottle gourd cultivation.', videoUrl: 'https://www.youtube.com/embed/7e61XClZ6O4', tags: ['Vines', 'Summer'] },
        { title: 'Grafting Beera', desc: 'Advanced grafting ridge gourd.', videoUrl: 'https://www.youtube.com/embed/BErSt_V3xpY', tags: ['Special', 'Technique'] },
        { title: 'Cucumber', desc: 'Refreshing organic cucumbers.', videoUrl: 'https://www.youtube.com/embed/rmHEy4DR4b8', tags: ['Salad', 'Hydration'] },
        { title: 'Broccoli', desc: 'Growing exotic organic broccoli.', videoUrl: 'https://www.youtube.com/embed/m-hK8c89gJA', tags: ['Exotic', 'Health'] },
        { title: 'Red Cabbage', desc: 'Vibrant organic red cabbage.', videoUrl: 'https://www.youtube.com/embed/4wqTvOmY5Z8', tags: ['Leafy', 'Advanced'] }
    ];

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
                                <div className="principle-item bio">
                                    <h5>1. Biodiversity</h5>
                                    <p>Rotate crops and maintain a diverse ecosystem to naturally deter pests.</p>
                                </div>
                                <div className="principle-item fertility">
                                    <h5>2. Natural Fertility</h5>
                                    <p>Use green manure and animal waste instead of synthetic NPK.</p>
                                </div>
                                <div className="principle-item water">
                                    <h5>3. Water Conservation</h5>
                                    <p>Implement drip irrigation and mulching to keep soil moisture high.</p>
                                </div>
                                <div className="principle-item health">
                                    <h5>4. Ecosystem Health</h5>
                                    <p>Avoid all GMOs and chemical hormones in your livestock and crops.</p>
                                </div>
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
