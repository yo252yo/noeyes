// Game logic functions for the engine
import { incrementAtt, incrementValue } from '../js/common.js';
import { createAttFeedback, createValueFeedback } from './ui.js';

// Handle value increment and feedback
export function value(amount = 1, x, y) {
    // Increment value from common.js
    incrementValue(amount);

    // Create visual feedback popup
    createValueFeedback(`+${amount} Value`, x, y, 4000);
}

// Handle attention change and feedback
export function attention(amount = 1, x, y) {
    // Change attention from common.js
    incrementAtt(amount);

    // Create visual feedback popup
    const sign = amount >= 0 ? '+' : '';
    createAttFeedback(`${sign}${amount} Att`, x, y);
}
