import { matchResponse, getResponseMetadata } from '../src/services/chatbot/engine';
import { AGRI_KNOWLEDGE } from '../src/services/chatbot/rules';

describe('Chatbot Engine', () => {
    describe('matchResponse', () => {
        it('should return a relevant response for "tomato"', () => {
            const response = matchResponse('How to grow tomato?');
            expect(response).toContain('Tomato Land Selection');
        });

        it('should return a fallback response for unknown queries', () => {
            const response = matchResponse('How to build a spaceship?');
            expect(response).toContain('not quite sure about that specific topic');
        });

        it('should be case insensitive', () => {
            const response = matchResponse('TOMATO');
            expect(response).toContain('Tomato Land Selection');
        });
    });

    describe('getResponseMetadata', () => {
        it('should return a link for cultivation-related responses', () => {
            const response = "Here is a guide on organic farming.";
            const { link } = getResponseMetadata(response);
            expect(link).not.toBeNull();
            expect(link.url).toBe('/cultivation');
        });

        it('should return null link for general responses', () => {
            const response = "Hello there!";
            const { link } = getResponseMetadata(response);
            expect(link).toBeNull();
        });
    });
});
