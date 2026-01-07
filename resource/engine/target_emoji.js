import { emoji } from '../js/game/game-config.js';
import { Target } from './target.js';

export class Emoji extends Target {
    constructor(size = 50) {
        super(size);
        // Override graphics to use a container with background and text
        this.graphics = new window.PIXI.Container();
        this.draw();
    }

    draw() {
        // Call parent draw to add debug border
        super.draw();

        // Create random emoji text from game config
        const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
        const emojiText = new window.PIXI.Text(randomEmoji, {
            fontSize: this.size * 0.8, // Scale font to fit target size
            fontFamily: 'Arial'
        });
        emojiText.anchor.set(0.5); // Center the text

        // Add to container (after debug border)
        this.graphics.addChild(emojiText);

        // Position the container
        this.graphics.x = this.x;
        this.graphics.y = this.y;
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
