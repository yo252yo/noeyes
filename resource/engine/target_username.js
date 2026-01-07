import { play_click_sfx } from '../js/common.js';
import { attention } from './logic.js';
import { Target } from './target.js';


export class Username extends Target {
    // Speed bounds - can be overridden by subclasses
    static MIN_SPEED = .3;
    static MAX_SPEED = 1.5;

    constructor(size = 50) {
        super(size);

        // Override graphics to use a container with background and text
        this.graphics = new window.PIXI.Container();
        this.usernameText = null; // Will be set in draw()
        this.draw();
    }

    draw() {
        // Call parent draw to add debug border
        super.draw();

        // Create placeholder username text
        const username = 'User' + Math.floor(Math.random() * 1000);
        this.usernameText = new window.PIXI.Text(username, {
            fontSize: 12,
            fontFamily: 'Arial',
            fill: 0x000000
        });
        this.usernameText.anchor.set(0.5); // Center the text

        // Create background
        const bg = new window.PIXI.Graphics();
        bg.beginFill(0xffffff);
        bg.drawRoundedRect(-this.usernameText.width / 2 - 5, -this.usernameText.height / 2 - 5, this.usernameText.width + 10, this.usernameText.height + 10, 5);
        bg.endFill();

        // Add to container
        this.graphics.addChild(bg);
        this.graphics.addChild(this.usernameText);

        // Position the container
        this.graphics.x = this.x;
        this.graphics.y = this.y;
    }

    update(deltaTime = 1) {
        // Call parent update for movement and bouncing
        super.update(deltaTime);
    }

    // Empty tick behavior
    tick() {
        attention(1, this.x, this.y);
    }

    // Click behavior - award attention and remove target
    click() {
        if (!this.preventDoubleClick()) {
            return;
        }

        // Play value sound
        play_click_sfx();

        this.dx *= -1;
        this.dy *= -1;
    }
}
