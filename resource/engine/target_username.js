import { getChatters, play_click_sfx, setRemovedChatter } from '../js/common.js';
import { generateMultiple, generateTwitchUsername } from '../js/fake_users.js';
import { chatters } from '../js/twitch_irc.js';
import { attention } from './logic.js';
import { Target } from './target.js';

// Track spawned usernames for uniqueness (local to engine)
const spawnedUsernames = new Set();

// History of removed usernames (latest 300, preferring real chatters)
let removedUsernameHistory = [];

// Color options for username backgrounds (dark colors as hex codes for consistent styling)
const backgroundColors = ['#FF0000', '#0000FF', '#00FF00', '#800080', '#FFA500', '#FF00FF', '#800000', '#000080', '#808000', '#008080', '#FF00FF', '#FFFF00', '#00FFFF', '#FFC0CB', '#FFA07A'];

export class Username extends Target {
    // Speed bounds - can be overridden by subclasses
    static MIN_SPEED = .3;
    static MAX_SPEED = 1.5;

    constructor() {
        // Create temporary text to measure size
        const { username, isFake } = Username.selectUsername();
        const usernameText = new window.PIXI.Text(username, {
            fontSize: 12,
            fontFamily: 'Arial',
            fill: 0x000000
        });

        // Calculate width and height based on text bubble
        const width = usernameText.width + 10; // 5px padding on each side
        const height = usernameText.height + 10;

        super(width, height);

        // Override graphics to use a container with background and text
        this.graphics = new window.PIXI.Container();
        this.username = username;
        this.isFake = isFake;
        this.draw();
    }

    static selectUsername() {
        const chattersObj = getChatters();
        const availableChatters = Object.keys(chattersObj).filter(chatter => !spawnedUsernames.has(chatter));

        if (availableChatters.length > 0) {
            const username = availableChatters[Math.floor(Math.random() * availableChatters.length)];
            spawnedUsernames.add(username);
            return { username, isFake: false };
        }

        // Fallback to fake users
        const fakeUsers = generateMultiple(100);
        const availableFakeUsers = fakeUsers.filter(fake => !spawnedUsernames.has(fake));

        if (availableFakeUsers.length > 0) {
            const username = availableFakeUsers[Math.floor(Math.random() * availableFakeUsers.length)];
            spawnedUsernames.add(username);
            return { username, isFake: true };
        }

        // Last resort
        const username = generateTwitchUsername();
        spawnedUsernames.add(username);
        return { username, isFake: true };
    }

    draw() {
        // Call parent draw to add debug border
        super.draw();

        // Create username text with italic styling for fake users
        this.usernameText = new window.PIXI.Text(this.username, {
            fontSize: 10,
            fontFamily: 'Arial',
            fill: 0xffffff,
            fontWeight: 'bold',
            fontStyle: this.isFake ? 'italic' : 'normal'
        });
        this.usernameText.anchor.set(0.5); // Center the text

        // Pick random background color from dark colors
        const bgColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];

        // Create blended color for text and border (mix background color with black)
        const blendedColor = this.blendWithBlack(bgColor, 0.5); // 50% blend with black

        // Always use white highlight and blended text color for consistent styling
        const highlightRgba = 'rgba(255,255,255,0.7)';
        this.usernameText.style.fill = blendedColor;

        // Create oval background with radial gradient (add padding to prevent edge cropping)
        const bg = this.createGradientOval(Math.ceil(1.1 * this.usernameText.width) + 8, this.usernameText.height + 10, bgColor, highlightRgba, blendedColor);

        // Position background at center
        bg.x = 0;
        bg.y = 0;

        // Add to container
        this.graphics.addChild(bg);
        this.graphics.addChild(this.usernameText);

        // Position the container
        this.graphics.x = this.x;
        this.graphics.y = this.y;
    }

    createGradientOval(width, height, bgColor, highlightRgba, borderColor) {
        // Create canvas for gradient
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Create radial gradient
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        gradient.addColorStop(0, highlightRgba); // Highlight center with transparency
        gradient.addColorStop(1, bgColor);       // Background edge

        // Draw oval gradient background
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, width / 2 - 1, height / 2 - 1, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Add a blended border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Create PIXI texture and sprite
        const texture = window.PIXI.Texture.from(canvas);
        const sprite = new window.PIXI.Sprite(texture);
        sprite.anchor.set(0.5);

        return sprite;
    }

    blendWithBlack(hexColor, ratio) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);

        // Blend with black
        const blendedR = Math.round(r * (1 - ratio));
        const blendedG = Math.round(g * (1 - ratio));
        const blendedB = Math.round(b * (1 - ratio));

        // Convert back to hex
        const blendedHex = '#' + [blendedR, blendedG, blendedB].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');

        return blendedHex;
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
        // Track removed real chatters in history and localStorage
        if (this.username && !this.isFake && !removedUsernameHistory.includes(this.username)) {
            removedUsernameHistory.push(this.username);
            if (removedUsernameHistory.length > 100) {
                removedUsernameHistory.shift(); // Remove oldest
            }

            // Store in localStorage - pick one random message
            const messages = chatters.get(this.username) || [];
            const randomMessage = messages.length > 0 ? messages[Math.floor(Math.random() * messages.length)] : '';
            setRemovedChatter(this.username, randomMessage);
        }

        // Remove username from spawned set so it can be reused
        if (this.username) {
            spawnedUsernames.delete(this.username);
        }

        // Call parent remove method
        super.remove();
    }
}

export { removedUsernameHistory };
