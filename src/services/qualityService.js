/**
 * Real AI-based crop quality analysis via backend.
 */
import { API_BASE_URL } from './apiConfig';

export const analyzeCropQuality = async (crop, image) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/quality-check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                crop: crop,
                image: image // Base64 string from FileReader
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to analyze quality');
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error('Quality Analysis Error:', error);
        return {
            data: null,
            error: error.message || 'The server is currently unavailable. Please try again later.'
        };
    }
};
