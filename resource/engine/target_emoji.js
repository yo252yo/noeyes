import { emoji } from '../js/game/game-config.js';
import { Target } from './target.js';

export class Emoji extends Target {
    constructor(size = 50) {
        super(size);
        // Override graphics to use a container with background and text
        this.graphics = new window.PIXI.Container();
        this.wiggleTime = Math.random() * Math.PI * 2; // Random start phase for wiggle
        this.emojiText = null; // Will be set in draw()
        this.draw();
    }

    draw() {
        // Call parent draw to add debug border
        super.draw();

        // Create random emoji text from game config
        const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
        this.emojiText = new window.PIXI.Text(randomEmoji, {
            fontSize: this.size * 0.8, // Scale font to fit target size
            fontFamily: 'Arial'
        });
        this.emojiText.anchor.set(0.5); // Center the text

        // Add to container (after debug border)
        this.graphics.addChild(this.emojiText);

        // Position the container
        this.graphics.x = this.x;
        this.graphics.y = this.y;
    }

    update(deltaTime = 1) {
        // Call parent update for movement and bouncing
        super.update(deltaTime);

        // Add wiggle animation
        this.wiggleTime += deltaTime * 0.05; // Adjust speed of wiggle
        const wiggleAngle = Math.sin(this.wiggleTime) * (20 * Math.PI / 180); // ±20 degrees in radians
        this.emojiText.rotation = wiggleAngle;
    }

    // Empty tick behavior
    tick() {
        // Do nothing
    }

    // Empty click behavior
    click() {
        // Do nothing
    }
}
