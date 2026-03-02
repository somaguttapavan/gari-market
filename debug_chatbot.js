import { matchResponse } from './src/services/chatbot/engine.js';
const response = matchResponse('How to build a spaceship?');
console.log("Response for 'How to build a spaceship?':");
console.log(response);
