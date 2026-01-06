// Game state
export let score = 0;

// Function to set score (needed for ES6 module compatibility)
export function setScore(newScore) {
    score = newScore;
}

// Function to set game active state
export function setGameActive(active) {
    gameActive = active;
}

// Function to set PIXI app
export function setPixiApp(app) {
    pixiApp = app;
}

// Function to set game container
export function setGameContainer(container) {
    gameContainer = container;
}
export let activeTargets = []; // Unified tracking for all active targets
export let spawnedUsernames = new Set(); // Track spawned usernames for uniqueness
export let gameIntervals = {}; // Centralized interval management
export let gameActive = false;

// PIXI application and containers
export let pixiApp = null;
export let gameContainer = null;

// Scroll handling
export let lastScrollY = 0;

import { gameConfig } from './game-config.js';


// Helper function to get a lighter shade of a color for gradients
export function getLighterColor(color) {
    const colorMap = {
        'red': '#ff6666',
        'blue': '#6666ff',
        'green': '#66ff66',
        'yellow': '#ffff66',
        'purple': '#ff66ff',
        'orange': '#ffaa66',
        'pink': '#ff66aa',
        'cyan': '#66ffff',
        'magenta': '#ff66ff',
        'lime': '#aaff66',
        'maroon': '#aa6666',
        'navy': '#6666aa',
        'olive': '#aaaa66',
        'teal': '#66aaaa',
        'aqua': '#66ffff',
        'fuchsia': '#ff66ff'
    };
    return colorMap[color] || '#ffffff';
}

// Helper function to check if we're in tutorial mode
export function isTutorial() {
    return gameConfig.fixedTargetNb > 0;
}

// Helper function to calculate distance between two points
export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Base Target class
export class Target {
    constructor() {
        this.dx = 0;
        this.dy = 0;
        this.destroyed = false;
    }

    update() {
        if (this.destroyed) return;

        let x = this.container.x;
        let y = this.container.y;

        x += this.dx;
        y += this.dy;

        // Get accurate bounds for collision
        const bounds = this.container.getBounds();

        // Handle wall collisions using accurate bounds
        const collisionResult = this.handleWallCollision(x, y, bounds.width, bounds.height);
        x = collisionResult.x;
        y = collisionResult.y;
        this.dx = collisionResult.dx;
        this.dy = collisionResult.dy;

        this.container.x = x;
        this.container.y = y;
    }

    handleWallCollision(x, y, width, height) {
        let newX = x;
        let newY = y;
        let newDx = this.dx;
        let newDy = this.dy;

        // Check collisions with viewport edges
        if (x <= 0 || x >= window.innerWidth - width) {
            newDx = -newDx;
            newX = Math.max(0, Math.min(window.innerWidth - width, newX));
        }
        if (y <= 0 || y >= window.innerHeight - height) {
            newDy = -newDy;
            newY = Math.max(0, Math.min(window.innerHeight - height, newY));
        }

        return { x: newX, y: newY, dx: newDx, dy: newDy };
    }

    destroy() {
        this.destroyed = true;
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
            this.container.destroy();
        }
    }
}
