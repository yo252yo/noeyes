import { getChatters, play_click_sfx } from '../common.js';
import { generateMultiple, generateTwitchUsername } from '../fake_users.js';
import { borderColors, max_speed_username, min_speed_username } from './game-config.js';
import { Target, spawnedUsernames } from './target-base.js';

// Username Target class
export class UsernameTarget extends Target {
    constructor() {
        super();
        this.username = this.selectUsername();
        this.createSprite();
        this.setupInteraction();
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

    createSprite() {
        // Get random colors
        const randomBgColor = borderColors[Math.floor(Math.random() * borderColors.length)];
        let randomTextColor = borderColors[Math.floor(Math.random() * borderColors.length)];
        while (randomTextColor === randomBgColor) {
            randomTextColor = borderColors[Math.floor(Math.random() * borderColors.length)];
        }

        // Create text with better styling
        const text = new window.PIXI.Text(this.username, {
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            fontSize: 14,
            fontWeight: '600',
            fill: randomTextColor,
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 1,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 2,
            dropShadowDistance: 1
        });
        text.anchor.set(0.5, 0.5); // Center the text in the oval

        // Calculate oval dimensions
        const paddingX = 16;
        const paddingY = 10;
        const minWidth = 70;
        const maxWidth = 180;
        const textWidth = text.width + paddingX * 2;
        const width = Math.max(minWidth, Math.min(maxWidth, textWidth));
        const height = text.height + paddingY * 2;

        // Create oval background
        const bgGraphics = new window.PIXI.Graphics();

        // Main oval
        bgGraphics.beginFill(window.PIXI.utils.string2hex(randomBgColor), 0.9);
        bgGraphics.drawEllipse(0, 0, width / 2, height / 2);
        bgGraphics.endFill();

        // Add subtle border
        bgGraphics.lineStyle(2, window.PIXI.utils.string2hex('#ffffff'), 0.8);
        bgGraphics.drawEllipse(0, 0, width / 2, height / 2);

        // Create container
        this.container = new window.PIXI.Container();
        this.container.addChild(bgGraphics);
        this.container.addChild(text);

        // Position and velocity
        const spawnPos = this.findBestSpawnPosition(width, height);
        this.container.x = spawnPos.x + width / 2;
        this.container.y = spawnPos.y + height / 2;

        const speed = min_speed_username + Math.random() * (max_speed_username - min_speed_username);
        const angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
    }

    setupInteraction() {
        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.hitArea = new window.PIXI.Circle(this.container.width / 2, this.container.height / 2, Math.max(this.container.width, this.container.height) / 2 + 15); // Even larger hit area

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
        // Guard against destroyed containers
        if (!this.container || this.destroyed) {
            return;
        }

        // Prevent double-clicking
        if (!this.shouldAllowClick()) {
            return;
        }

        // Play ding sound
        play_click_sfx();

        // Reverse direction
        this.dx = -this.dx;
        this.dy = -this.dy;
    }
}
