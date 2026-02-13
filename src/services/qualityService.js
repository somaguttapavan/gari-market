/**
 * Simulates AI-based crop quality analysis.
 * Returns { data, error }
 */
export const analyzeCropQuality = async (crop, _image) => {
    return new Promise((resolve) => {
        // Simulate AI processing delay
        setTimeout(() => {
            // Logic: 10% chance it's the "wrong picture"
            const randomCheck = Math.random();
            if (randomCheck < 0.1) {
                resolve({
                    data: null,
                    error: `Invalid Image: We couldn't detect ${crop} in this picture. It looks like you provided a different image.`
                });
                return;
            }

            const isGoodQuality = Math.random() > 0.3; // 70% chance of good quality

            resolve({
                data: {
                    crop: crop,
                    quality: isGoodQuality ? 'Good' : 'Bad',
                    confidence: (Math.random() * 15 + 85).toFixed(2), // 85-100%
                    advice: isGoodQuality
                        ? `Your ${crop} looks healthy and ready for market! We recommend selling it soon for the best price.`
                        : `We detected some signs of stress in your ${crop}. You might want to consult our Chatbot for treatment advice before selling.`
                },
                error: null
            });
        }, 2000);
    });
};
