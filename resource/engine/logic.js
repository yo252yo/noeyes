// Game logic functions for the engine
import { incrementValue } from '../js/common.js';
import { createValueFeedback } from './ui.js';

// Handle value increment and feedback
export function value(amount = 1, x, y) {
    // Increment value from common.js
    incrementValue(amount);

    // Create visual feedback popup
    createValueFeedback(`+${amount} Value`, x, y, 4000);
}
