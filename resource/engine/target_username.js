import { getChatters, play_click_sfx } from '../js/common.js';
import { generateMultiple, generateTwitchUsername } from '../js/fake_users.js';
import { attention } from './logic.js';
import { Target } from './target.js';

// Track spawned usernames for uniqueness (local to engine)
const spawnedUsernames = new Set();

// Color options for username backgrounds
const borderColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'aqua', 'fuchsia'];

export class Username extends Target {
    // Speed bounds - can be overridden by subclasses
    static MIN_SPEED = .3;
    static MAX_SPEED = 1.5;

    constructor(width = 50, height = 50) {
        super(width, height);

        // Override graphics to use a container with background and text
        this.graphics = new window.PIXI.Container();
        this.username = this.selectUsername();
        this.draw();
    }

    selectUsername() {
        const chatters = getChatters();
        const availableChatters = chatters.filter(chatter => !spawnedUsernames.has(chatter));

        if (availableChatters.length > 0) {
            const username = availableChatters[Math.floor(Math.random() * availableChatters.length)];
            spawnedUsernames.add(username);
            return username;
        }

        // Fallback to fake users
        const fakeUsers = generateMultiple(100);
        const availableFakeUsers = fakeUsers.filter(fake => !spawnedUsernames.has(fake));

        if (availableFakeUsers.length > 0) {
            const username = availableFakeUsers[Math.floor(Math.random() * availableFakeUsers.length)];
            spawnedUsernames.add(username);
            return username;
        }

        // Last resort
        const username = generateTwitchUsername();
        spawnedUsernames.add(username);
        return username;
    }

    draw() {
        // Call parent draw to add debug border
        super.draw();

        // Create placeholder username text
        const username = this.username;
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

    // Override remove to clean up username from spawned set
    remove() {
        // Remove username from spawned set so it can be reused
        if (this.username) {
            spawnedUsernames.delete(this.username);
        }

        // Call parent remove method
        super.remove();
    }
}
