// Simple bouncing square target
import { DEBUG } from './config.js';

export class Target {
    constructor(x, y, dx, dy, size = 50) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;

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
