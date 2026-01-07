import { gameConfig } from './game-config.js';

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


// Helper function to get a lighter shade of a color for gradients
export function getLighterColor(color) {
    const colorMap = {
        'red': '#ff6666',
        'blue': '#6666ff',
        'green': '#66ff66',
        'yellow': '#ffff66',
        'orange': '#ffaa66',
        'pink': '#ff66aa',
        'lime': '#aaff66',
        'maroon': '#aa6666',
        'navy': '#6666aa',
        'olive': '#aaaa66',
        'teal': '#66aaaa'
    };
    return colorMap[color] || '#ffffff';
}

// Helper function to check if we're in tutorial mode
export function isTutorial() {
    return gameConfig.fixedTargetNb > 0;
}

// Collision boundary helper functions
export function getCollisionLeftBoundary() {
    return 0;
}

export function getCollisionRightBoundary() {
    return document.documentElement.clientWidth;
}

export function getCollisionTopBoundary() {
    return 0;
}

export function getCollisionBottomBoundary() {
    return document.documentElement.clientHeight;
}

export function getCollisionRect() {
    return {
        x: getCollisionLeftBoundary(),
        y: getCollisionTopBoundary(),
        width: getCollisionRightBoundary() - getCollisionLeftBoundary(),
        height: getCollisionBottomBoundary() - getCollisionTopBoundary()
    };
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
        this.lastClickTime = 0;
    }

    // Common click debouncing method (500ms threshold)
    shouldAllowClick() {
        const now = Date.now();
        if (this.lastClickTime && now - this.lastClickTime < 500) {
            return false;
        }
        this.lastClickTime = now;
        return true;
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

        // Check collisions with viewport edges using hitbox boundaries (centered on target)
        const leftBoundary = getCollisionLeftBoundary();
        const rightBoundary = getCollisionRightBoundary();
        const topBoundary = getCollisionTopBoundary();
        const bottomBoundary = getCollisionBottomBoundary();

        // Hitbox edges
        const hitboxLeft = x - width / 2;
        const hitboxRight = x + width / 2;
        const hitboxTop = y - height / 2;
        const hitboxBottom = y + height / 2;

        if (hitboxLeft <= leftBoundary || hitboxRight >= rightBoundary) {
            newDx = -newDx;
            if (hitboxLeft <= leftBoundary) {
                newX = leftBoundary + width / 2;
            } else if (hitboxRight >= rightBoundary) {
                newX = rightBoundary - width / 2;
            }
        }
        if (hitboxTop <= topBoundary || hitboxBottom >= bottomBoundary) {
            newDy = -newDy;
            if (hitboxTop <= topBoundary) {
                newY = topBoundary + height / 2;
            } else if (hitboxBottom >= bottomBoundary) {
                newY = bottomBoundary - height / 2;
            }
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

    findBestSpawnPosition(width, height, candidates = 3) {
        const candidatePositions = [];
        for (let i = 0; i < candidates; i++) {
            candidatePositions.push({
                x: Math.random() * (window.innerWidth - width),
                y: Math.random() * (window.innerHeight - height)
            });
        }

        if (activeTargets.length === 0) {
            return candidatePositions[Math.floor(Math.random() * candidatePositions.length)];
        }

        let bestPosition = candidatePositions[0];
        let bestMinDistance = 0;

        for (const candidate of candidatePositions) {
            let minDistance = Infinity;

            for (const existingTarget of activeTargets) {
                const existingBounds = existingTarget.container.getBounds();
                const existingCenterX = existingBounds.x + existingBounds.width / 2;
                const existingCenterY = existingBounds.y + existingBounds.height / 2;

                const candidateCenterX = candidate.x + width / 2;
                const candidateCenterY = candidate.y + height / 2;

                const distance = calculateDistance(candidateCenterX, candidateCenterY, existingCenterX, existingCenterY);
                minDistance = Math.min(minDistance, distance);
            }

            if (minDistance > bestMinDistance) {
                bestMinDistance = minDistance;
                bestPosition = candidate;
            }
        }

        return bestPosition;
    }
}
