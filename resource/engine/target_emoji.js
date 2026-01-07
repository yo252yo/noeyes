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

        const boxSize = this.size * 0.9; // 90% of target size

        // Create background rectangle
        const background = new window.PIXI.Graphics();
        background.beginFill(0xffffff, 0.8); // White background with some transparency
        background.drawRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);
        background.endFill();

        // Create emoji text
        const emojiText = new window.PIXI.Text('😊', {
            fontSize: boxSize * 0.8, // Scale font to fit
            fontFamily: 'Arial'
        });
        emojiText.anchor.set(0.5); // Center the text

        // Add to container (after debug border)
        this.graphics.addChild(background);
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
