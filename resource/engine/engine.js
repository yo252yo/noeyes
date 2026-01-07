// Engine module that imports and initializes the window
import { Target, TARGETS_LIST } from './target.js';
import { initializeEngine } from './window.js';

// Function to spawn targets
function spawnTargets(app, numTargets) {
    for (let i = 0; i < numTargets; i++) {
        const target = new Target();
        app.stage.addChild(target.graphics);
    }
}

// Update loop (60fps)
function update() {
    TARGETS_LIST.forEach(target => {
        target.update();
    });
    requestAnimationFrame(update);
}

// Second ticker (1fps) - calls tick on all targets
function secondTicker() {
    TARGETS_LIST.forEach(target => {
        target.tick();
    });
}

// Start the game with specified number of targets
export function start(numTargets) {
    const app = initializeEngine();
    spawnTargets(app, numTargets);
    update();
    setInterval(secondTicker, 1000); // Call tick every second
}
