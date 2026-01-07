import { getStreamers } from '../js/common.js';
import { borderColors } from '../js/game/game-config.js';
import { getAvatarUrl } from '../js/twitch.js';
import { Target, TARGETS_LIST } from './target.js';

export class Avatar extends Target {
    constructor(size = 50) {
        super(size);
        // No extra wall detection for avatar targets
        this.wall_detection_extra = 0;
        // Select a streamer for this avatar
        this.streamer = this.selectStreamer();
        // Override graphics to use a container
        this.graphics = new window.PIXI.Container();
        this.init();
    }

    selectStreamer() {
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
    }

    async createSprite() {
        const avatarUrl = await getAvatarUrl(this.streamer);
        const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];

        this.avatarContainer = new window.PIXI.Container();

        // Create circular border - fill the target size
        const radius = this.size / 2;
        const borderGraphics = new window.PIXI.Graphics();
        borderGraphics.beginFill(window.PIXI.utils.string2hex(randomColor));
        borderGraphics.drawCircle(0, 0, radius); // Fill the target size
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

    // Empty tick behavior - do nothing for now
    tick() {
        // Do nothing
    }

    // Empty click behavior - do nothing for now
    click() {
        // Do nothing
    }
}
