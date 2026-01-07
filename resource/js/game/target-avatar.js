import { getAtt, getStreamers, incrementValue } from '../common.js';
import { getAvatarUrl } from '../twitch.js';
import { borderColors, max_speed_avatar, min_speed_avatar } from './game-config.js';
import { updateScoreAfterClick } from './game-logic.js';
import { createValueFeedback } from './game-ui.js';
import { Target, activeTargets, calculateDistance, isTutorial, pixiApp } from './target-base.js';

// Avatar Target class
export class AvatarTarget extends Target {
    constructor(specificUsername = null) {
        super();
        this.streamer = this.selectStreamer(specificUsername);
        this.init();
    }

    selectStreamer(specificUsername) {
        if (specificUsername) return specificUsername;

        const storedStreamers = getStreamers();
        if (storedStreamers.length > 0) {
            const activeStreamerNames = activeTargets.map(target => target.streamer).filter(Boolean);
            const availableStreamers = storedStreamers.filter(s => !activeStreamerNames.includes(s));

            if (availableStreamers.length > 0) {
                return availableStreamers[Math.floor(Math.random() * availableStreamers.length)];
            } else {
                return storedStreamers[Math.floor(Math.random() * storedStreamers.length)];
            }
        }
        return 'vedal987'; // Fallback
    }

    async init() {
        await this.createSprite();
        this.setupInteraction();
    }

    async createSprite() {
        const avatarUrl = await getAvatarUrl(this.streamer);
        const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];

        this.container = new window.PIXI.Container();
        this.container.pivot.set(0, 0); // Center the container on the visual center (circle at 0,0)

        // Create circular border
        const borderGraphics = new window.PIXI.Graphics();
        borderGraphics.beginFill(window.PIXI.utils.string2hex(randomColor));
        borderGraphics.drawCircle(0, 0, 20); // Center at container origin
        borderGraphics.endFill();
        this.container.addChild(borderGraphics);

        // Create mask
        const mask = new window.PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawCircle(0, 0, 18); // Center at container origin
        mask.endFill();

        // Load avatar
        let texture;
        try {
            texture = await window.PIXI.Texture.fromURL(avatarUrl);
        } catch (e) {
            console.warn('Failed to load avatar for', this.streamer, e);
            texture = window.PIXI.Texture.WHITE;
        }
        const avatarSprite = new window.PIXI.Sprite(texture);
        avatarSprite.width = 36;
        avatarSprite.height = 36;
        avatarSprite.x = -18; // Center the 36x36 sprite on origin
        avatarSprite.y = -18;
        avatarSprite.mask = mask;
        this.container.addChild(avatarSprite);
        this.container.addChild(mask);

        // Position and velocity
        const spawnPos = this.findBestSpawnPosition(40, 40);
        this.container.x = spawnPos.x;
        this.container.y = spawnPos.y;

        // Set pivot to center the container on the visual center
        this.container.pivot.set(0, 0);

        const speed = min_speed_avatar + Math.random() * (max_speed_avatar - min_speed_avatar);
        const angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
    }

    setupInteraction() {
        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.hitArea = new window.PIXI.Circle(0, 0, 30); // Even larger hit area, centered

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

        // Remove clicked avatar
        const clickedIndex = activeTargets.indexOf(this);
        if (clickedIndex > -1) {
            activeTargets.splice(clickedIndex, 1);
        }

        // Find closest remaining avatar
        let closestAvatar = null;
        let minDistance = Infinity;
        const clickedBounds = this.container.getBounds();
        const clickedCenterX = clickedBounds.x + clickedBounds.width / 2;
        const clickedCenterY = clickedBounds.y + clickedBounds.height / 2;

        for (const avatar of activeTargets) {
            if (!(avatar instanceof AvatarTarget)) continue;
            const avatarBounds = avatar.container.getBounds();
            const avatarCenterX = avatarBounds.x + avatarBounds.width / 2;
            const avatarCenterY = avatarBounds.y + avatarBounds.height / 2;
            const distance = calculateDistance(clickedCenterX, clickedCenterY, avatarCenterX, avatarCenterY);

            if (distance < minDistance) {
                minDistance = distance;
                closestAvatar = avatar;
            }
        }

        // Remove closest avatar if found
        if (closestAvatar) {
            // Get bounds before destroying
            const avatarBounds = closestAvatar.container.getBounds();
            const avatarCenterX = avatarBounds.x + avatarBounds.width / 2;
            const avatarCenterY = avatarBounds.y + avatarBounds.height / 2;

            const closestIndex = activeTargets.indexOf(closestAvatar);
            if (closestIndex > -1) {
                activeTargets.splice(closestIndex, 1);
            }
            closestAvatar.destroy();

            // Calculate score
            const valueGained = Math.min(100, Math.pow(Math.floor(200 / minDistance), 2));
            incrementValue(valueGained);

            // Draw line connecting centers - fuchsia if high score, green if low
            const lineColor = valueGained > 5 ? 0xff00ff : 0x4CAF50;
            const lineGraphics = new window.PIXI.Graphics();
            lineGraphics.lineStyle(4, lineColor);
            lineGraphics.moveTo(clickedCenterX, clickedCenterY);
            lineGraphics.lineTo(avatarCenterX, avatarCenterY);
            pixiApp.stage.addChild(lineGraphics);

            // Delete the line after 1s
            setTimeout(() => {
                pixiApp.stage.removeChild(lineGraphics);
            }, 300);

            createValueFeedback(`+${valueGained} Value`, event.global.x, event.global.y, 2000);

            // Create COLLAB message for high scores
            if (valueGained > 5) {
                const collabMsg = document.createElement('div');
                collabMsg.textContent = '✨COLLAB✨';
                collabMsg.style.position = 'absolute';
                collabMsg.style.left = (event.global.x - 40) + 'px';
                collabMsg.style.top = (event.global.y + 10) + 'px';
                collabMsg.style.color = 'fuchsia';
                collabMsg.style.fontSize = '14px';
                collabMsg.style.fontWeight = 'bold';
                collabMsg.style.pointerEvents = 'none';
                collabMsg.style.zIndex = '102';
                collabMsg.style.textAlign = 'center';
                collabMsg.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                collabMsg.style.padding = '2px 6px';
                collabMsg.style.borderRadius = '4px';
                collabMsg.style.textShadow = '0 0 5px fuchsia, 0 0 10px fuchsia, 0 0 15px fuchsia, 0 0 20px fuchsia';
                collabMsg.style.animation = 'collabGrow 2s ease-out forwards';
                document.body.appendChild(collabMsg);

                setTimeout(() => {
                    if (collabMsg.parentNode) {
                        collabMsg.parentNode.removeChild(collabMsg);
                    }
                }, 2000);
            }
        }

        this.destroy();
        updateScoreAfterClick();
    }

    update() {
        if (this.destroyed) return;

        // Scale speed based on Att (disabled in tutorial mode)
        let speedScale = 1;
        if (!isTutorial()) {
            const currentAtt = getAtt();
            speedScale = Math.min(Math.max(currentAtt / 100, 0.3), 1); // Minimum 30% speed
        }

        let x = this.container.x;
        let y = this.container.y;

        x += this.dx * speedScale;
        y += this.dy * speedScale;

        // Use fixed hitbox size (diameter of hit area circle = 60)
        const collisionResult = this.handleWallCollision(x, y, 45, 45);
        x = collisionResult.x;
        y = collisionResult.y;
        this.dx = collisionResult.dx;
        this.dy = collisionResult.dy;

        this.container.x = x;
        this.container.y = y;
    }
}
