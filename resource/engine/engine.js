// Engine module that imports and initializes the window
import { getNbChatters, getStreamers } from '../js/common.js';
import { NUM_TARGETS, setNumTargets, setTutorialMode, TARGET_TYPES } from './config.js';
import { interaction } from './logic.js';
import { Target, TARGETS_LIST } from './target.js';
import { Avatar } from './target_avatar.js';
import { Emoji } from './target_emoji.js';
import { Username } from './target_username.js';
import { initializeEngine } from './window.js';

// Global time accumulator for second-based events
let secondAccumulator = 0;

let CURRENT_TARGET_TYPE = TARGET_TYPES.EMPTY;

// Global app reference for spawning
let globalApp = null;

// Export the PIXI app for use by UI functions
export function getPixiApp() {
    return globalApp;
}

// Function to spawn a single target
export function spawnTarget() {
    if (!globalApp) return;

    let target;
    if (CURRENT_TARGET_TYPE === TARGET_TYPES.EMOJI) {
        target = new Emoji();
    } else if (CURRENT_TARGET_TYPE === TARGET_TYPES.AVATAR) {
        target = new Avatar();
    } else if (CURRENT_TARGET_TYPE === TARGET_TYPES.USERNAME) {
        target = new Username();
    } else {
        target = new Target();
    }

    globalApp.stage.addChild(target.graphics);
}

// Request a new target by incrementing the target count
export function requestNewTarget() {
    setNumTargets(NUM_TARGETS + 1);
}

// Check for overlapping username targets and trigger interactions
function check_username_collisions() {
    if (CURRENT_TARGET_TYPE !== TARGET_TYPES.USERNAME) return;

    const usernameTargets = TARGETS_LIST.filter(target => target instanceof Username);
    if (usernameTargets.length < 2) return;

    // Simple collision check - check each pair
    for (let i = 0; i < usernameTargets.length; i++) {
        for (let j = i + 1; j < usernameTargets.length; j++) {
            const targetA = usernameTargets[i];
            const targetB = usernameTargets[j];

            // Check if they overlap (simple bounding box check)
            const overlap = targetA.x - targetA.width / 2 < targetB.x + targetB.width / 2 &&
                targetA.x + targetA.width / 2 > targetB.x - targetB.width / 2 &&
                targetA.y - targetA.height / 2 < targetB.y + targetB.height / 2 &&
                targetA.y + targetA.height / 2 > targetB.y - targetB.height / 2;

            if (overlap) {
                interaction(targetA, targetB);
                return; // Only handle one collision per check
            }
        }
    }
}

// Dedicated ticker function for the main game loop
function app_ticker(deltaTime) {
    // Update all targets (60fps)
    TARGETS_LIST.forEach(target => {
        target.update(deltaTime);
    });

    // Check for username target collisions
    check_username_collisions();

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

    // Set tutorial mode based on tutorial_targets parameter
    setTutorialMode(tutorial_targets > 0);

    // If target type is username and tutorial_targets is 0, set to number of chatters
    if (targetType === TARGET_TYPES.USERNAME && tutorial_targets === 0) {
        setNumTargets(getNbChatters());
    } else if (targetType === TARGET_TYPES.AVATAR && tutorial_targets === 0) {
        setNumTargets(getStreamers().length);
    } else {
        setNumTargets(tutorial_targets);
    }

    // Main game loop using PIXI's ticker (better than setInterval)
    globalApp.ticker.add(app_ticker);
}
