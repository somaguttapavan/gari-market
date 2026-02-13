import { useState, useCallback, useRef, useEffect } from 'react';
import { matchResponse, getResponseMetadata } from '../services/chatbot/engine';

export const useChatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Namaste! I am your AgriGrowth Assistant. How can I help you with your farming journey today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const sendMessage = useCallback(async (text) => {
        if (!text.trim() || isTyping) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsTyping(true);

        // Simulate thinking time for better UX
        setTimeout(() => {
            const aiText = matchResponse(text);
            const { link } = getResponseMetadata(aiText);

            setMessages(prev => [...prev, { role: 'bot', text: aiText, link }]);
            setIsTyping(false);
        }, 800);
    }, [isTyping]);

    const toggleOpen = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        messages,
        isTyping,
        isOpen,
        setIsOpen,
        sendMessage,
        toggleOpen
    };
};
