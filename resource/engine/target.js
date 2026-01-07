// Simple bouncing square target
import { DEBUG } from './config.js';

// Global list of all targets
export const TARGETS_LIST = [];

export class Target {
    // Speed bounds - can be overridden by subclasses
    static MIN_SPEED = 1;
    static MAX_SPEED = 3;

    // Find the best spawn position that maximizes distance from other targets
    static find_free_spawn() {
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;
        const margin = 50; // Keep away from edges

        // Generate 4 candidate positions
        const candidates = [];
        for (let i = 0; i < 4; i++) {
            candidates.push({
                x: Math.random() * (clientWidth - margin * 2) + margin,
                y: Math.random() * (clientHeight - margin * 2) + margin
            });
        }

        // If no targets exist yet, return first candidate
        if (TARGETS_LIST.length === 0) {
            return candidates[0];
        }

        // Evaluate each candidate by finding minimum distance to existing targets
        let bestCandidate = candidates[0];
        let bestDistance = 0;

        for (const candidate of candidates) {
            let minDistance = Infinity;

            // Find minimum distance to any existing target
            for (const target of TARGETS_LIST) {
                const dx = candidate.x - target.x;
                const dy = candidate.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                minDistance = Math.min(minDistance, distance);
            }

            // Keep track of the candidate with highest minimum distance
            if (minDistance > bestDistance) {
                bestDistance = minDistance;
                bestCandidate = candidate;
            }
        }

        return bestCandidate;
    }

    constructor(size = 50) {
        // Find the best spawn position
        const spawnPos = this.constructor.find_free_spawn();
        this.x = spawnPos.x;
        this.y = spawnPos.y;
        this.size = size;

        // Generate random velocity within speed bounds
        const speed = this.constructor.MIN_SPEED + Math.random() * (this.constructor.MAX_SPEED - this.constructor.MIN_SPEED);
        const angle = Math.random() * Math.PI * 2; // Random direction
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;

        // Add to global targets list
        TARGETS_LIST.push(this);

        // Create PIXI graphics
        this.graphics = new window.PIXI.Graphics();
        this.draw();
    }

    draw() {
        this.graphics.clear();
        if (DEBUG) {
            // Draw square with green border
            this.graphics.lineStyle(2, 0x00ff00, 1); // Green border
            this.graphics.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        this.graphics.x = this.x;
        this.graphics.y = this.y;
    }

    update(deltaTime = 1) {
        // Update position
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;

        // Check bounds and bounce
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;

        // Left and right boundaries
        if (this.x - this.size / 2 <= 0 || this.x + this.size / 2 >= clientWidth) {
            this.dx = -this.dx;
            // Keep within bounds
            this.x = Math.max(this.size / 2, Math.min(clientWidth - this.size / 2, this.x));
        }

        // Top and bottom boundaries
        if (this.y - this.size / 2 <= 0 || this.y + this.size / 2 >= clientHeight) {
            this.dy = -this.dy;
            // Keep within bounds
            this.y = Math.max(this.size / 2, Math.min(clientHeight - this.size / 2, this.y));
        }

        // Update graphics position
        this.graphics.x = this.x;
        this.graphics.y = this.y;
    }

    destroy() {
        if (this.graphics && this.graphics.parent) {
            this.graphics.parent.removeChild(this.graphics);
            this.graphics.destroy();
        }
    }
}
