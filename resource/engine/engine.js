// Engine module that imports and initializes the window
import { TARGET_TYPES } from './config.js';
import { Target, TARGETS_LIST } from './target.js';
import { Emoji } from './target_emoji.js';
import { initializeEngine } from './window.js';

// Global time accumulator for second-based events
let secondAccumulator = 0;

let NUM_TARGETS = 0;
let CURRENT_TARGET_TYPE = TARGET_TYPES.EMPTY;

// Global app reference for spawning
let globalApp = null;

// Function to spawn a single target
function spawnTarget() {
    if (!globalApp) return;

    let target;
    if (CURRENT_TARGET_TYPE === TARGET_TYPES.EMOJI) {
        target = new Emoji();
    } else {
        target = new Target();
    }

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

// Start the game with specified target type and number
export function start(targetType = TARGET_TYPES.EMPTY, tutorial_targets = 0) {
    globalApp = initializeEngine();

    CURRENT_TARGET_TYPE = targetType;
    NUM_TARGETS = tutorial_targets;

    // Main game loop using PIXI's ticker (better than setInterval)
    globalApp.ticker.add(app_ticker);
}
