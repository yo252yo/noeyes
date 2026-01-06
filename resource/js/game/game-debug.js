// Debug rendering system for visualizing hitboxes and collision boundaries
import { gameConfig } from './game-config.js';
import { activeTargets, gameContainer, getCollisionRect, pixiApp } from './target-base.js';

// Debug graphics container
let debugGraphics = null;

export function initializeDebugRendering() {
    if (!pixiApp || !gameContainer) return;

    // Create debug graphics container
    debugGraphics = new window.PIXI.Graphics();
    pixiApp.stage.addChild(debugGraphics); // Add directly to stage for highest z-index
}

export function renderDebugInfo() {
    if (!gameConfig.debugMode || !debugGraphics) return;

    // Clear previous debug graphics
    debugGraphics.clear();

    // Draw target hitboxes in green and their collision boundaries in red
    activeTargets.forEach(target => {
        if (target.container && !target.destroyed) {
            // Get the same position and size values used in collision detection
            const x = target.container.x;
            const y = target.container.y;
            const bounds = target.container.getBounds();
            const width = bounds.width;
            const height = bounds.height;

            // Draw target hitbox in green (1px lines) - same rectangle used for collision
            debugGraphics.lineStyle(1, 0x00ff00, 1); // Green 1px line
            debugGraphics.drawRect(x - width, y - height, width, height);

            // Draw collision rectangle for this target in red (1px lines) using shared function
            const collisionRect = getCollisionRect(width, height);
            debugGraphics.lineStyle(1, 0xff0000, 1); // Red 1px line
            debugGraphics.drawRect(collisionRect.x, collisionRect.y, collisionRect.width, collisionRect.height);
        }
    });
}

export function cleanupDebugRendering() {
    if (debugGraphics && debugGraphics.parent) {
        debugGraphics.parent.removeChild(debugGraphics);
        debugGraphics.destroy();
        debugGraphics = null;
    }
}

export function toggleDebugMode() {
    gameConfig.debugMode = !gameConfig.debugMode;
    console.log(`Debug mode ${gameConfig.debugMode ? 'enabled' : 'disabled'}`);

    if (gameConfig.debugMode) {
        initializeDebugRendering();
    } else {
        cleanupDebugRendering();
    }
}

// Make toggleDebugMode available globally for easy access
window.toggleDebugMode = toggleDebugMode;
