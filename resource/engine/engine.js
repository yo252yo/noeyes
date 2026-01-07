// Engine module that imports and initializes the window
import { NUM_TARGETS } from './config.js';
import { Target } from './target.js';
import { initializeEngine } from './window.js';

// Array to hold targets
const targets = [];

// Function to spawn targets
function spawnTargets(app) {
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;

    for (let i = 0; i < NUM_TARGETS; i++) {
        // Random position within bounds
        const x = Math.random() * (clientWidth - 100) + 50;
        const y = Math.random() * (clientHeight - 100) + 50;

        const target = new Target(x, y);
        targets.push(target);
        app.stage.addChild(target.graphics);
    }
}

// Update loop
function update() {
    targets.forEach(target => {
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
