import { useState, useMemo } from 'react';
import { CULTIVATION_GUIDES, FARMING_PRINCIPLES } from '../data/cultivationData';

export const useCultivation = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGuides = useMemo(() => {
        if (!searchTerm) return CULTIVATION_GUIDES;
        const lowerTerm = searchTerm.toLowerCase();
        return CULTIVATION_GUIDES.filter(g =>
            g.title.toLowerCase().includes(lowerTerm) ||
            g.desc.toLowerCase().includes(lowerTerm) ||
            g.tags.some(t => t.toLowerCase().includes(lowerTerm))
        );
    }, [searchTerm]);

    return {
        guides: filteredGuides,
        principles: FARMING_PRINCIPLES,
        searchTerm,
        setSearchTerm
    };
};
