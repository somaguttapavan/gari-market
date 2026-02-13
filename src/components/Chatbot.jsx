// REBUILT CHATBOT V4 - MODULAR & RULE BASED
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Info, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatbot } from '../hooks/useChatbot';

const Chatbot = () => {
    const {
        messages,
        isTyping,
        isOpen,
        setIsOpen,
        sendMessage,
        toggleOpen
    } = useChatbot();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [input, setInput] = useState('');

    const suggestions = [
        "Which crop to grow now?",
        "Is my soil good or bad?",
        "How to reduce farming costs?",
        "Why are leaves yellowing?",
        "Organic conversion guide"
    ];

    const scrollRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen, isMobile]);

    const handleSend = (customInput = null) => {
        const textToSend = typeof customInput === 'string' ? customInput : input;
        if (!textToSend.trim()) return;

        sendMessage(textToSend);
        if (typeof customInput !== 'string') setInput('');
    };

    // Determine visibility: Always open on Desktop (!isMobile), Toggleable on Mobile
    const shouldShowChat = !isMobile || isOpen;

    return (
        <div className="chatbot-wrapper">
            <AnimatePresence>
                {shouldShowChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="chatbot-container"
                    >
                        {/* Header */}
                        <div className="chatbot-header">
                            <div className="chatbot-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="chatbot-icon-wrapper">
                                    <Sparkles size={20} />
                                </div>
                                <div className="chatbot-title">
                                    <h4>AgriGrowth Assistant</h4>
                                    <span className="chatbot-status">
                                        <div className="chatbot-status-dot"></div>
                                        Fast & Reliable
                                    </span>
                                </div>
                            </div>
                            {/* Only show Close button on Mobile */}
                            {isMobile && (
                                <button onClick={() => setIsOpen(false)} className="chatbot-close-btn">
                                    <X size={20} color="white" />
                                </button>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="messages-area">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`message-bubble ${msg.role}`}
                                >
                                    <div className="message-content">
                                        {msg.text}
                                    </div>

                                    {msg.link && (
                                        <button
                                            onClick={() => navigate(msg.link.url)}
                                            className="info-link-btn"
                                        >
                                            <Info size={14} /> {msg.link.label}
                                        </button>
                                    )}
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="typing-indicator"
                                >
                                    <div className="typing-dots">
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="dot" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="dot" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="dot" />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Suggestions Overlay */}
                        <div className="suggestions-overlay">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(s)}
                                    className="suggestion-btn"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="input-area">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask your farming expert..."
                                className="chat-input"
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSend()}
                                disabled={isTyping}
                                className="send-btn"
                            >
                                <Send size={20} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleOpen}
                className="chatbot-toggle-btn"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>
        </div>
    );
};

export default Chatbot;
