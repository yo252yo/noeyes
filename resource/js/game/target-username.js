import { getChatters, play_click_sfx } from '../common.js';
import { generateMultiple, generateTwitchUsername } from '../fake_users.js';
import { borderColors, max_speed_username, min_speed_username } from './game-config.js';
import { Target, activeTargets, calculateDistance, spawnedUsernames } from './target-base.js';

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
        console.log(`${this.constructor.name}: Setting up interaction at (${this.container.x}, ${this.container.y})`);
        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.hitArea = new window.PIXI.Circle(this.container.width / 2, this.container.height / 2, Math.max(this.container.width, this.container.height) / 2 + 15); // Even larger hit area
        console.log(`${this.constructor.name}: Hit area set to circle(${this.container.width / 2}, ${this.container.height / 2}, ${Math.max(this.container.width, this.container.height) / 2 + 15}), bounds:`, this.container.getBounds());

        // Create extra click detection zone (50% larger than hit area for maximum leniency)
        const hitRadius = Math.max(this.container.width, this.container.height) + 20; // Same as hit area
        const clickZoneSize = hitRadius * 1.5;

        this.clickZone = new window.PIXI.Graphics();
        this.clickZone.beginFill(0xff0000, 0.0); // Invisible
        this.clickZone.drawRect(-clickZoneSize, -clickZoneSize, clickZoneSize * 2, clickZoneSize * 2);
        this.clickZone.endFill();
        this.clickZone.interactive = true;
        this.clickZone.buttonMode = true;
        // No positioning offset needed since it's centered at (0,0)

        // Add click zone behind the visual target
        this.container.addChildAt(this.clickZone, 0);

        // Pointer events (primary) - on both visual target and click zone
        const clickHandler = (event) => this.handleClick(event);
        const pointerDownHandler = (event) => this.handlePointerDown(event);
        const pointerUpHandler = (event) => this.handlePointerUp(event);

        this.container.on('pointertap', clickHandler);
        this.container.on('pointerdown', pointerDownHandler);
        this.container.on('pointerup', pointerUpHandler);
        this.container.on('pointerupoutside', () => this.cancelClick());

        this.clickZone.on('pointertap', clickHandler);
        this.clickZone.on('pointerdown', pointerDownHandler);
        this.clickZone.on('pointerup', pointerUpHandler);
        this.clickZone.on('pointerupoutside', () => this.cancelClick());

        // Mouse events (fallback)
        const mouseDownHandler = (event) => this.handleMouseDown(event);
        const mouseUpHandler = (event) => this.handleMouseUp(event);

        this.container.on('mousedown', mouseDownHandler);
        this.container.on('mouseup', mouseUpHandler);
        this.container.on('mouseout', () => this.cancelClick());

        this.clickZone.on('mousedown', mouseDownHandler);
        this.clickZone.on('mouseup', mouseUpHandler);
        this.clickZone.on('mouseout', () => this.cancelClick());

        // Touch events (fallback)
        const touchStartHandler = (event) => this.handleTouchStart(event);
        const touchEndHandler = (event) => this.handleTouchEnd(event);

        this.container.on('touchstart', touchStartHandler);
        this.container.on('touchend', touchEndHandler);

        this.clickZone.on('touchstart', touchStartHandler);
        this.clickZone.on('touchend', touchEndHandler);

        console.log(`${this.constructor.name}: Extra click zone added (${(clickZoneSize * 2).toFixed(1)}px diameter)`);
        console.log(`${this.constructor.name}: Interaction setup complete`);
    }

    handlePointerDown(event) {
        console.log(`${this.constructor.name}: pointerdown at (${event.global.x}, ${event.global.y})`);
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

            console.log(`${this.constructor.name}: pointerup - duration: ${duration}ms, distance: ${distance.toFixed(1)}px`);

            // Allow up to 10px movement and 500ms duration for a valid click
            if (duration < 500 && distance < 10) {
                console.log(`${this.constructor.name}: VALID CLICK - processing`);
                this.handleClick(event);
            } else {
                console.log(`${this.constructor.name}: INVALID CLICK - ${duration >= 500 ? 'too slow' : 'moved too much'}`);
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
            console.log('UsernameTarget: handleClick called on destroyed container');
            return;
        }

        // Prevent double-clicking from both container and clickZone
        const now = Date.now();
        if (this.lastClickTime && now - this.lastClickTime < 100) {
            console.log('UsernameTarget: Ignoring duplicate click');
            return;
        }
        this.lastClickTime = now;

        console.log(`UsernameTarget: handleClick called - reversing direction from (${this.dx.toFixed(2)}, ${this.dy.toFixed(2)})`);

        // Play ding sound
        play_click_sfx();

        // Reverse direction
        this.dx = -this.dx;
        this.dy = -this.dy;

        console.log(`UsernameTarget: direction reversed to (${this.dx.toFixed(2)}, ${this.dy.toFixed(2)})`);
    }

    findBestSpawnPosition(width, height, candidates = 3) {
        const candidatePositions = [];
        for (let i = 0; i < candidates; i++) {
            candidatePositions.push({
                x: Math.random() * (window.innerWidth - width),
                y: Math.random() * (window.innerHeight - height)
            });
        }

        if (activeTargets.length === 0) {
            return candidatePositions[Math.floor(Math.random() * candidatePositions.length)];
        }

        let bestPosition = candidatePositions[0];
        let bestMinDistance = 0;

        for (const candidate of candidatePositions) {
            let minDistance = Infinity;

            for (const existingTarget of activeTargets) {
                const existingBounds = existingTarget.container.getBounds();
                const existingCenterX = existingBounds.x + existingBounds.width / 2;
                const existingCenterY = existingBounds.y + existingBounds.height / 2;

                const candidateCenterX = candidate.x + width / 2;
                const candidateCenterY = candidate.y + height / 2;

                const distance = calculateDistance(candidateCenterX, candidateCenterY, existingCenterX, existingCenterY);
                minDistance = Math.min(minDistance, distance);
            }

            if (minDistance > bestMinDistance) {
                bestMinDistance = minDistance;
                bestPosition = candidate;
            }
        }

        return bestPosition;
    }
}
