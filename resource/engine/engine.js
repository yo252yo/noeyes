// Engine module that imports and initializes the window
import { initializeEngine } from '../../engine/window.js';

// Auto-initialize when imported
document.addEventListener('DOMContentLoaded', () => {
    initializeEngine();
});
