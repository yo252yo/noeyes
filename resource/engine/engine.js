// Engine module that imports and initializes the window
import { Target, TARGETS_LIST } from './target.js';
import { initializeEngine } from './window.js';

// Global time accumulator for second-based events
let secondAccumulator = 0;

let NUM_TARGETS = 0;

// Global app reference for spawning
let globalApp = null;

// Function to spawn a single target
function spawnTarget() {
    if (!globalApp) return;
    const target = new Target();
    globalApp.stage.addChild(target.graphics);
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
        // Check if we need to spawn more targets
        if (TARGETS_LIST.length < NUM_TARGETS) {
            spawnTarget();
        }

        TARGETS_LIST.forEach(target => {
            target.tick();
        });
        secondAccumulator -= 1.0; // Reset accumulator, keeping remainder
    }
}

// Start the game with specified number of tutorial targets
export function start(tutorial_targets = 0) {
    globalApp = initializeEngine();

    NUM_TARGETS = tutorial_targets;

    // Main game loop using PIXI's ticker (better than setInterval)
    globalApp.ticker.add(app_ticker);
}
