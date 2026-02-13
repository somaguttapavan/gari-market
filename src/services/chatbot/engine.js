import { AGRI_KNOWLEDGE, FALLBACK_RESPONSE } from './rules';

/**
 * Basic rule-based engine to find the best response for user input.
 */
export const matchResponse = (input) => {
    const lowerInput = input.toLowerCase();

    // Find first matching knowledge entry
    for (const entry of AGRI_KNOWLEDGE) {
        if (entry.keywords.some(keyword => lowerInput.includes(keyword))) {
            return entry.response;
        }
    }

    return FALLBACK_RESPONSE;
};

/**
 * Checks if a response should offer a link to cultivation guides.
 */
export const getResponseMetadata = (response) => {
    const lowerResponse = response.toLowerCase();
    let link = null;

    if (lowerResponse.match(/organic|guide|how to|cultivation/)) {
        link = { label: "Explore Detailed Guides", url: "/cultivation" };
    }

    return { link };
};
