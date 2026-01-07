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

        // Wall detection extra - can be overridden by subclasses
        this.wall_detection_extra = 0;

        // Generate random velocity within speed bounds
        const speed = this.constructor.MIN_SPEED + Math.random() * (this.constructor.MAX_SPEED - this.constructor.MIN_SPEED);
        const angle = Math.random() * Math.PI * 2; // Random direction
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;

        // Add to global targets list
        TARGETS_LIST.push(this);

        // Create PIXI graphics container
        this.graphics = new window.PIXI.Container();
        this.draw();
    }

    draw() {
        this.graphics.removeChildren(); // Clear container children

        if (DEBUG) {
            // Draw square with green border
            const debugBorder = new window.PIXI.Graphics();
            debugBorder.lineStyle(2, 0x00ff00, 1); // Green border
            debugBorder.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
            this.graphics.addChild(debugBorder);
        }

        this.graphics.x = this.x;
        this.graphics.y = this.y;
    }

    update(deltaTime = 1) {
        // Get speed modifier (can be overridden by subclasses)
        const speedModifier = this.getSpeedModifier();

        // Update position
        this.x += this.dx * deltaTime * speedModifier;
        this.y += this.dy * deltaTime * speedModifier;

        // Check bounds and bounce (with leeway)
        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;

        // Left and right boundaries
        if (this.x - this.size / 2 <= -this.wall_detection_extra || this.x + this.size / 2 >= clientWidth + this.wall_detection_extra) {
            this.dx = -this.dx;
            // Keep within bounds (accounting for wall detection extra)
            this.x = Math.max(this.size / 2 - this.wall_detection_extra, Math.min(clientWidth - this.size / 2 + this.wall_detection_extra, this.x));
        }

        // Top and bottom boundaries
        if (this.y - this.size / 2 <= -this.wall_detection_extra || this.y + this.size / 2 >= clientHeight + this.wall_detection_extra) {
            this.dy = -this.dy;
            // Keep within bounds (accounting for wall detection extra)
            this.y = Math.max(this.size / 2 - this.wall_detection_extra, Math.min(clientHeight - this.size / 2 + this.wall_detection_extra, this.y));
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

    // Remove target from game (destroy graphics and remove from global list)
    remove() {
        this.destroy();

        // Remove from global targets list
        const index = TARGETS_LIST.indexOf(this);
        if (index > -1) {
            TARGETS_LIST.splice(index, 1);
        }
    }

    // Called every second by the engine
    tick() {
        console.log('tick recorded');
    }

    // Called when target is clicked/touched
    click() {
        // Prevent double-clicking - subclasses can override if needed
        if (!this.preventDoubleClick()) {
            return;
        }

        console.log('click recorded');
    }

    // Common click debouncing method (500ms threshold)
    preventDoubleClick() {
        const now = Date.now();
        if (this.lastClickTime && now - this.lastClickTime < 500) {
            return false;
        }
        this.lastClickTime = now;
        return true;
    }

    // Get speed modifier based on game state (can be overridden by subclasses)
    getSpeedModifier() {
        return 1; // Default: normal speed
    }

    // Find the closest avatar target (used by Avatar class)
    findClosestAvatar() {
        let closestAvatar = null;
        let minDistance = Infinity;

        for (const target of TARGETS_LIST) {
            // Import Avatar class dynamically to avoid circular dependency
            if (target === this) continue;

            // Check if target is an Avatar instance by checking for streamer property
            if (!target.streamer) continue;

            const dx = this.x - target.x;
            const dy = this.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                closestAvatar = target;
            }
        }

        return closestAvatar;
    }
}
