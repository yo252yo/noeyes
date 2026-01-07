import { incrementValue, play_value_sfx } from '../common.js';
import { emoji, max_speed_emoji, min_speed_emoji } from './game-config.js';
import { spawnTarget, updateScoreAfterClick } from './game-logic.js';
import { createValueFeedback } from './game-ui.js';
import { Target, activeTargets } from './target-base.js';

// Emoji Target class
export class EmojiTarget extends Target {
    constructor() {
        super();
        this.createSprite();
        this.setupInteraction();
    }

    createSprite() {
        const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
        this.container = new window.PIXI.Text(randomEmoji, {
            fontSize: 30,
            fontFamily: 'Arial',
            fill: 0xffffff
        });
        this.container.anchor.set(0.5);

        // Random position and velocity
        const spawnPos = this.findBestSpawnPosition(this.container.width, this.container.height);
        this.container.x = spawnPos.x + this.container.width / 2;
        this.container.y = spawnPos.y + this.container.height / 2;

        const speed = min_speed_emoji + Math.random() * (max_speed_emoji - min_speed_emoji);
        const angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
    }

    setupInteraction() {
        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.hitArea = new window.PIXI.Circle(20, 20, 30); // Even larger hit area

        // Pointer events for clicking the target
        this.container.on('pointertap', (event) => this.handleClick(event));
        this.container.on('pointerdown', (event) => this.handlePointerDown(event));
        this.container.on('pointerup', (event) => this.handlePointerUp(event));
        this.container.on('pointerupoutside', () => this.cancelClick());
    }

    handlePointerDown(event) {
        this.clickStartTime = Date.now();
        this.clickStartX = event.global.x;
        this.clickStartY = event.global.y;
        this.isPotentialClick = true;
    }

    handlePointerUp(event) {
        if (this.isPotentialClick) {
            const duration = Date.now() - this.clickStartTime;
            const distance = Math.sqrt(
                Math.pow(event.global.x - this.clickStartX, 2) +
                Math.pow(event.global.y - this.clickStartY, 2)
            );

            // Allow up to 10px movement and 500ms duration for a valid click
            if (duration < 500 && distance < 10) {
                this.handleClick(event);
            }
        }
        this.isPotentialClick = false;
    }

    handleMouseDown(event) {
        // Alias for handlePointerDown for mouse events
        this.handlePointerDown(event);
    }

    handleMouseUp(event) {
        // Alias for handlePointerUp for mouse events
        this.handlePointerUp(event);
    }

    handleTouchStart(event) {
        // Alias for handlePointerDown for touch events
        this.handlePointerDown(event);
    }

    handleTouchEnd(event) {
        // Alias for handlePointerUp for touch events
        this.handlePointerUp(event);
    }

    cancelClick() {
        this.isPotentialClick = false;
    }

    handleClick(event) {
        // Prevent double-clicking
        if (!this.shouldAllowClick()) {
            return;
        }

        // Play value sound
        play_value_sfx();

        // Remove from active targets
        const index = activeTargets.indexOf(this);
        if (index > -1) {
            activeTargets.splice(index, 1);
        }

        // Create feedback
        createValueFeedback('+1 Value', event.global.x, event.global.y, 4000);

        this.destroy();
        incrementValue();
        updateScoreAfterClick();

        // Spawn replacement
        spawnTarget();
    }
}
