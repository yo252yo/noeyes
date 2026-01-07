// Engine module that imports and initializes the window
import { NUM_TARGETS } from './config.js';
import { Target, TARGETS_LIST } from './target.js';
import { initializeEngine } from './window.js';

// Function to spawn targets
function spawnTargets(app) {
    for (let i = 0; i < NUM_TARGETS; i++) {
        const target = new Target();
        app.stage.addChild(target.graphics);
    }
}

// Update loop
function update() {
    TARGETS_LIST.forEach(target => {
        target.update();
    });
    requestAnimationFrame(update);
}

// Auto-initialize when imported
document.addEventListener('DOMContentLoaded', () => {
    const app = initializeEngine();
    spawnTargets(app);
    update();
});
