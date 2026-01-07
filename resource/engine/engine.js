// Engine module that imports and initializes the window
import { Target, TARGETS_LIST } from './target.js';
import { initializeEngine } from './window.js';

// Global time accumulator for second-based events
let secondAccumulator = 0;

// Function to spawn targets
function spawnTargets(app, numTargets) {
    for (let i = 0; i < numTargets; i++) {
        const target = new Target();
        app.stage.addChild(target.graphics);
    }
}

// Dedicated ticker function for the main game loop
function app_ticker(deltaTime) {
    // Update all targets (60fps)
    TARGETS_LIST.forEach(target => {
        target.update(deltaTime);
    });

    // Accumulate time for second-based events
    secondAccumulator += deltaTime / 100; // Convert to seconds

    // When 1 second has passed, call tick on all targets
    if (secondAccumulator >= 1.0) {
        TARGETS_LIST.forEach(target => {
            target.tick();
        });
        secondAccumulator -= 1.0; // Reset accumulator, keeping remainder
    }
}

// Start the game with specified number of tutorial targets
export function start(tutorial_targets = 0) {
    const app = initializeEngine();
    spawnTargets(app, tutorial_targets);

    // Main game loop using PIXI's ticker (better than setInterval)
    app.ticker.add(app_ticker);
}
