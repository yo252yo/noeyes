// Debug rendering system for visualizing hitboxes and collision boundaries
import { gameConfig } from './game-config.js';
import { activeTargets, gameContainer, pixiApp } from './target-base.js';

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

    // Draw webpage visible area boundaries as red rectangle outline (shared for all targets)
    // Use client dimensions to account for scrollbars
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    debugGraphics.lineStyle(3, 0xff0000, 1); // Red 3px line for visibility
    debugGraphics.drawRect(1, 1, clientWidth - 2, clientHeight - 2);

    // Draw target hitboxes in green
    activeTargets.forEach(target => {
        if (target.container && !target.destroyed) {
            // Get the same position and size values used in collision detection
            const x = target.container.x;
            const y = target.container.y;
            const bounds = target.container.getBounds();
            const width = bounds.width;
            const height = bounds.height;

            // Draw target hitbox in green (1px lines) - represents the actual hitbox used in collision (centered on target)
            debugGraphics.lineStyle(1, 0x00ff00, 1); // Green 1px line
            debugGraphics.drawRect(x - width / 2, y - height / 2, width, height);
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

    if (gameConfig.debugMode) {
        initializeDebugRendering();
    } else {
        cleanupDebugRendering();
    }
}

// Make toggleDebugMode available globally for easy access
window.toggleDebugMode = toggleDebugMode;
