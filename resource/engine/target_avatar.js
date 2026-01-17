import { getAtt, getDay, getStreamers } from '../js/common.js';
import { getAvatarUrl } from '../js/twitch.js';
import { IS_TUTORIAL } from './config.js';
import { attention, collab } from './logic.js';
import { Target, TARGETS_LIST } from './target.js';

const borderColors = [
    "#BF0D0D", // Bright Red
    "#E6B700", // Golden Yellow
    "#00AEE5", // Bright Blue
    "#00C957", // Emerald Green
    "#8A2BE2", // Blue Violet
    "#FF6EC7", // Hot Pink
    "#1AA34A", // Medium Green
    "#914E00", // Brown
    "#0072B5", // Dark Blue
    "#C90076", // Deep Pink
    "#915F1F", // Light Brown
    "#009D9B", // Teal
    "#F26522", // Orange
    "#7F38EC", // Purple
    "#5C3317", // Dark Brown
    "#3D8C84", // Blue-Green
    "#DB70DB", // Orchid
    "#C11B17", // Crimson
    "#EDDA74", // Light Yellow
    "#70DB93"  // Light Green
];

// Function to darken a hex color
function darkenHex(hex, factor = 0.8) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.floor((num >> 16) * factor);
    const g = Math.floor(((num >> 8) & 0xff) * factor);
    const b = Math.floor((num & 0xff) * factor);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// AI streamer identifier
const AI_STREAMER_NAME = '_$_robot';

export class Avatar extends Target {
    static MIN_SPEED = 1;
    static MAX_SPEED = 4;

    constructor(width = 50, height = 50) {
        super(width, height);
        // No extra wall detection for avatar targets
        this.wall_detection_extra = 0;
        // Select a streamer for this avatar
        this.streamer = this.selectStreamer();
        // Override graphics to use a container
        this.graphics = new window.PIXI.Container();
        this.init();
    }

    selectStreamer() {
        // Transpose AI spawning logic from Username class
        const regularAvatarCount = TARGETS_LIST.filter(target => target.streamer !== AI_STREAMER_NAME).length;

        if (IS_TUTORIAL || regularAvatarCount <= getStreamers().length) {
            // Spawn regular streamer avatar
            const storedStreamers = getStreamers();
            if (storedStreamers.length > 0) {
                const activeStreamerNames = TARGETS_LIST.map(target => target.streamer).filter(Boolean);
                const availableStreamers = storedStreamers.filter(s => !activeStreamerNames.includes(s));

                if (availableStreamers.length > 0) {
                    return availableStreamers[Math.floor(Math.random() * availableStreamers.length)];
                } else {
                    return storedStreamers[Math.floor(Math.random() * storedStreamers.length)];
                }
            }
            return 'vedal987'; // Fallback
        } else {
            return AI_STREAMER_NAME;
        }
    }

    async createSprite() {
        const avatarUrl = await getAvatarUrl(this.streamer);
        const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];
        const darkerColor = darkenHex(randomColor, 0.8);

        this.avatarContainer = new window.PIXI.Container();

        // Create circular border with 4px darker border
        const radius = this.width / 2;
        const borderGraphics = new window.PIXI.Graphics();
        borderGraphics.beginFill(darkerColor);
        borderGraphics.drawCircle(0, 0, radius);
        borderGraphics.endFill();
        borderGraphics.beginFill(randomColor);
        borderGraphics.drawCircle(0, 0, radius - 4);
        borderGraphics.endFill();
        this.avatarContainer.addChild(borderGraphics);

        // Create mask - smaller to make border thicker
        const maskRadius = radius - 4;
        const mask = new window.PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawCircle(0, 0, maskRadius);
        mask.endFill();

        // Load avatar
        let texture;
        try {
            texture = await window.PIXI.Texture.fromURL(avatarUrl);
        } catch (e) {
            console.warn('Failed to load avatar for', this.streamer, e);
            texture = window.PIXI.Texture.WHITE;
        }
        const spriteSize = (radius - 4) * 2; // Fit within mask
        const avatarSprite = new window.PIXI.Sprite(texture);
        avatarSprite.width = spriteSize;
        avatarSprite.height = spriteSize;
        avatarSprite.x = -spriteSize / 2; // Center the sprite
        avatarSprite.y = -spriteSize / 2;
        avatarSprite.mask = mask;
        this.avatarContainer.addChild(avatarSprite);
        this.avatarContainer.addChild(mask);
    }

    async init() {
        await this.createSprite();
        this.draw();
    }

    draw() {
        // Call parent draw to add debug border and position graphics
        super.draw();

        // Add avatar container to graphics (positioned relative to graphics at 0,0)
        if (this.avatarContainer) {
            this.graphics.addChild(this.avatarContainer);
        }
    }

    update(deltaTime = 1) {
        // Call parent update for movement and bouncing
        super.update(deltaTime);

        // TODO: Add avatar-specific animations later
    }

    // Tick behavior - consume attention
    tick() {
        if (getDay() < 3 || this.streamer === AI_STREAMER_NAME) {
            return;
        }

        // Call attention function with -1 to consume attention
        attention(-2, this.x, this.y);
    }

    // Click behavior - find closest avatar and collaborate
    click() {
        // Prevent double-clicking
        if (!this.preventDoubleClick()) {
            return;
        }

        collab(this, this.findClosestAvatar());

        // Remove this avatar
        this.remove();
    }

    // Get speed modifier based on attention level
    getSpeedModifier() {
        if (getDay() < 3) {
            return 1;
        }

        const currentAtt = getAtt();
        // Speed scales with attention: 0.3 at 0 Att, 1.0 at 100+ Att, linear in between
        return Math.min(currentAtt / 100, 1);
    }
}
