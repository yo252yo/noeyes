// Configurable game settings - will be overridden by window.gameConfig
let gameConfig = window.gameConfig || {
    targets: 'emoji', // 'emoji', 'avatar', or 'username'
    winScore: 5,
    fixedTargetNb: 10 // null for unlimited (emoji mode), number for avatar mode
};

// Import PIXI
import './pixi.min.js';

import {
    getAtt,
    getChatters,
    getNbChatters,
    getStreamers,
    getValue,
    incrementAtt,
    incrementNbChatters,
    incrementValue,
    play_click_sfx,
    play_problem_sfx,
    play_value_sfx
} from './common.js';
import { generateMultiple, generateTwitchUsername } from './fake_users.js';
import { getAvatarUrl } from './twitch.js';

const emoji = ['👶', '👦', '👧', '👨', '👩', '🧑', '👴', '👵'];
const borderColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'aqua', 'fuchsia'];

// Speed configuration variables for easy tweaking
const min_speed_emoji = 1;
const max_speed_emoji = 3;
const min_speed_avatar = 1;
const max_speed_avatar = 3;
const min_speed_username = 0.2;
const max_speed_username = 1;

// Game state
let score = 0;
let activeTargets = []; // Unified tracking for all active targets
let spawnedUsernames = new Set(); // Track spawned usernames for uniqueness
let gameIntervals = {}; // Centralized interval management
let gameActive = false;

// PIXI application and containers
let pixiApp = null;
let gameContainer = null;

// Scroll handling
let lastScrollY = 0;

// Threshold for text target collision detection (in pixels)
const TEXT_TARGET_COLLISION_THRESHOLD = 40;

// Helper function to get a lighter shade of a color for gradients
function getLighterColor(color) {
    const colorMap = {
        'red': '#ff6666',
        'blue': '#6666ff',
        'green': '#66ff66',
        'yellow': '#ffff66',
        'purple': '#ff66ff',
        'orange': '#ffaa66',
        'pink': '#ff66aa',
        'cyan': '#66ffff',
        'magenta': '#ff66ff',
        'lime': '#aaff66',
        'maroon': '#aa6666',
        'navy': '#6666aa',
        'olive': '#aaaa66',
        'teal': '#66aaaa',
        'aqua': '#66ffff',
        'fuchsia': '#ff66ff'
    };
    return colorMap[color] || '#ffffff';
}

// Helper function to check if we're in tutorial mode
function isTutorial() {
    return gameConfig.fixedTargetNb > 0;
}

// Helper function to calculate distance between two points
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Base Target class
class Target {
    constructor() {
        this.dx = 0;
        this.dy = 0;
        this.destroyed = false;
    }

    update() {
        if (this.destroyed) return;

        let x = this.container.x;
        let y = this.container.y;

        x += this.dx;
        y += this.dy;

        // Get accurate bounds for collision
        const bounds = this.container.getBounds();

        // Handle wall collisions using accurate bounds
        const collisionResult = this.handleWallCollision(x, y, bounds.width, bounds.height);
        x = collisionResult.x;
        y = collisionResult.y;
        this.dx = collisionResult.dx;
        this.dy = collisionResult.dy;

        this.container.x = x;
        this.container.y = y;
    }

    handleWallCollision(x, y, width, height) {
        let newX = x;
        let newY = y;
        let newDx = this.dx;
        let newDy = this.dy;

        // Check collisions with viewport edges
        if (x <= 0 || x >= window.innerWidth - width) {
            newDx = -newDx;
            newX = Math.max(0, Math.min(window.innerWidth - width, newX));
        }
        if (y <= 0 || y >= window.innerHeight - height) {
            newDy = -newDy;
            newY = Math.max(0, Math.min(window.innerHeight - height, newY));
        }

        return { x: newX, y: newY, dx: newDx, dy: newDy };
    }

    destroy() {
        this.destroyed = true;
        if (this.container && this.container.parent) {
            this.container.parent.removeChild(this.container);
            this.container.destroy();
        }
    }
}

// Emoji Target class
class EmojiTarget extends Target {
    constructor() {
        super();
        console.log('EmojiTarget created');
        this.createSprite();
        this.setupInteraction();
    }

    createSprite() {
        const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
        this.container = new PIXI.Text(randomEmoji, {
            fontSize: 30,
            fontFamily: 'Arial',
            fill: 0xffffff
        });
        this.container.anchor.set(0.5);

        // Random position and velocity
        const spawnPos = this.findBestSpawnPosition(this.container.width, this.container.height);
        this.container.x = spawnPos.x + this.container.width / 2;
        this.container.y = spawnPos.y + this.container.height / 2;

        const speed = min_speed_emoji + Math.random() * (max_speed_emoji - min_speed_emoji);
        const angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
    }

    setupInteraction() {
        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.hitArea = new PIXI.Circle(20, 20, 25); // Larger hit area
        this.container.on('pointertap', (event) => this.handleClick(event));
        this.container.on('click', (event) => this.handleClick(event)); // Additional event listener
    }

    handleClick(event) {
        // Play value sound
        play_value_sfx();

        // Remove from active targets
        const index = activeTargets.indexOf(this);
        if (index > -1) {
            activeTargets.splice(index, 1);
        }

        // Create feedback
        createValueFeedback('+1 Value', event.global.x, event.global.y, 4000);

        this.destroy();
        incrementValue();
        updateScoreAfterClick();

        // Spawn replacement
        spawnTarget();
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

// Avatar Target class
class AvatarTarget extends Target {
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

        this.container = new PIXI.Container();

        // Create circular border
        const borderGraphics = new PIXI.Graphics();
        borderGraphics.beginFill(PIXI.utils.string2hex(randomColor));
        borderGraphics.drawCircle(20, 20, 20);
        borderGraphics.endFill();
        this.container.addChild(borderGraphics);

        // Create mask
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawCircle(20, 20, 18);
        mask.endFill();

        // Load avatar
        let texture;
        try {
            texture = await PIXI.Texture.fromURL(avatarUrl);
        } catch (e) {
            console.warn('Failed to load avatar for', this.streamer, e);
            texture = PIXI.Texture.WHITE;
        }
        const avatarSprite = new PIXI.Sprite(texture);
        avatarSprite.width = 36;
        avatarSprite.height = 36;
        avatarSprite.x = 2;
        avatarSprite.y = 2;
        avatarSprite.mask = mask;
        this.container.addChild(avatarSprite);
        this.container.addChild(mask);

        // Position and velocity
        const spawnPos = this.findBestSpawnPosition(40, 40);
        this.container.x = spawnPos.x;
        this.container.y = spawnPos.y;

        const speed = min_speed_avatar + Math.random() * (max_speed_avatar - min_speed_avatar);
        const angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
    }

    setupInteraction() {
        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.hitArea = new PIXI.Circle(20, 20, 25); // Larger hit area
        this.container.on('pointertap', (event) => this.handleClick(event));
        this.container.on('click', (event) => this.handleClick(event)); // Additional event listener
    }

    handleClick(event) {
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
            const closestIndex = activeTargets.indexOf(closestAvatar);
            if (closestIndex > -1) {
                activeTargets.splice(closestIndex, 1);
            }
            closestAvatar.destroy();

            // Calculate score
            const valueGained = Math.min(100, Math.pow(Math.floor(200 / minDistance), 2));
            incrementValue(valueGained);

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

        const bounds = this.container.getBounds();
        const collisionResult = this.handleWallCollision(x, y, bounds.width, bounds.height);
        x = collisionResult.x;
        y = collisionResult.y;
        this.dx = collisionResult.dx;
        this.dy = collisionResult.dy;

        this.container.x = x;
        this.container.y = y;
    }
}

// Username Target class
class UsernameTarget extends Target {
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
        const text = new PIXI.Text(this.username, {
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
        const bgGraphics = new PIXI.Graphics();

        // Main oval
        bgGraphics.beginFill(PIXI.utils.string2hex(randomBgColor), 0.9);
        bgGraphics.drawEllipse(0, 0, width / 2, height / 2);
        bgGraphics.endFill();

        // Add subtle border
        bgGraphics.lineStyle(2, PIXI.utils.string2hex('#ffffff'), 0.8);
        bgGraphics.drawEllipse(0, 0, width / 2, height / 2);

        // Create container
        this.container = new PIXI.Container();
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
        this.container.hitArea = new PIXI.Circle(this.container.width / 2, this.container.height / 2, Math.max(this.container.width, this.container.height) / 2 + 10); // Larger hit area
        this.container.on('pointertap', (event) => this.handleClick(event));
        this.container.on('click', (event) => this.handleClick(event)); // Additional event listener
    }

    handleClick(event) {
        // Play ding sound
        play_click_sfx();

        // Reverse direction
        this.dx = -this.dx;
        this.dy = -this.dy;
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

function initializePixiApp() {
    console.log('Initializing PixiApp');
    pixiApp = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window
    });
    console.log('PixiApp created successfully');

    document.body.appendChild(pixiApp.view);

    pixiApp.view.style.position = 'fixed';
    pixiApp.view.style.top = '0';
    pixiApp.view.style.left = '0';
    pixiApp.view.style.pointerEvents = 'auto';
    pixiApp.view.style.zIndex = '50';

    gameContainer = new PIXI.Container();
    pixiApp.stage.addChild(gameContainer);

    // Handle resize
    window.addEventListener('resize', () => {
        pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
    });

    // Handle scroll to adjust target positions
    window.addEventListener('scroll', () => {
        const deltaY = window.scrollY - lastScrollY;
        activeTargets.forEach(target => {
            if (target.container) {
                target.container.y -= deltaY;
            }
        });
        lastScrollY = window.scrollY;
    });
}

function startGame() {
    console.log('startGame called with config:', gameConfig);
    if (gameActive) return;
    gameActive = true;

    if (!pixiApp) {
        initializePixiApp();
    }

    score = gameConfig.targets === 'username' ? getAtt() : getValue();
    setupGameIntervals();
    updateScoreDisplay();

    // Start game loop
    pixiApp.ticker.add(gameLoop);
    console.log('Game started successfully');
}

function gameLoop() {
    activeTargets.forEach(target => target.update());
}

function setupGameIntervals() {
    if (gameConfig.targets === 'avatar') {
        gameIntervals.avatarAttConsumption = setInterval(() => {
            // Always show -1 Att popup for avatars and consume Att
            if (activeTargets.length > 0) {
                activeTargets.forEach(target => {
                    if (target instanceof AvatarTarget) {
                        const bounds = target.container.getBounds();
                        let popupX = bounds.x + bounds.width / 2;
                        let popupY = bounds.y - 15;

                        // Adjust Y position if too high
                        if (popupY < 20) {
                            popupY = bounds.y + bounds.height + 15;
                        }

                        // Adjust X position if too far right
                        if (popupX > window.innerWidth - 100) {
                            popupX = bounds.x - 50;
                        }

                        // Ensure minimum bounds
                        popupX = Math.max(20, popupX);
                        popupY = Math.max(20, popupY);

                        createAttFeedback('-1 Att', popupX, popupY);
                    }
                });
                incrementAtt(-activeTargets.length);
                updateAttDisplay();
            }
        }, 1000);

        gameIntervals.avatarSpawning = setInterval(() => {
            const maxSpawn = gameConfig.fixedTargetNb || Math.max(1, getStreamers().length);
            if (activeTargets.length >= maxSpawn) return;
            spawnTarget();
        }, 1000);
    } else if (gameConfig.targets === 'username') {
        gameIntervals.usernameValueGeneration = setInterval(() => {
            if (activeTargets.length > 0) {
                activeTargets.forEach(target => {
                    if (target instanceof UsernameTarget) {
                        const bounds = target.container.getBounds();
                        createAttFeedback('+1 Att', bounds.x + bounds.width / 2, bounds.y - 10);
                    }
                });
                incrementAtt(activeTargets.length);
                score = getAtt();
                updateScoreDisplay();
                updateAttDisplay(); // Update the attention span

                if (score >= gameConfig.winScore) {
                    showNextButton();
                }
            }
        }, 1000);

        gameIntervals.textTargetCollision = setInterval(manageTextTargetCollisions, 500);

        gameIntervals.usernameSpawning = setInterval(() => {
            const maxSpawn = gameConfig.fixedTargetNb || Math.max(1, getNbChatters());
            if (activeTargets.length >= maxSpawn) return;
            spawnTarget();
        }, 1000);
    } else if (gameConfig.targets === 'emoji') {
        gameIntervals.emojiSpawning = setInterval(() => {
            if (activeTargets.length >= gameConfig.fixedTargetNb) return;
            spawnTarget();
        }, 1000);
    }
}

export async function spawnTarget() {
    console.log('spawnTarget called');
    let target;
    if (gameConfig.targets === 'avatar') {
        target = new AvatarTarget();
        await target.init(); // Wait for avatar to load
    } else if (gameConfig.targets === 'username') {
        target = new UsernameTarget();
    } else {
        target = new EmojiTarget();
    }

    activeTargets.push(target);
    gameContainer.addChild(target.container);
    console.log('Target spawned:', target.constructor.name);
}

export async function spawnSpecificStreamerAvatar(username) {
    const target = new AvatarTarget(username);
    await target.init(); // Wait for avatar to load
    activeTargets.push(target);
    gameContainer.addChild(target.container);
}

function createValueFeedback(text, x, y, duration = 1000) {
    const feedback = document.createElement('div');
    feedback.textContent = text;
    feedback.style.position = 'absolute';
    feedback.style.left = x + 'px';
    feedback.style.top = y + 'px';
    feedback.style.color = '#4CAF50';
    feedback.style.fontSize = '16px';
    feedback.style.fontWeight = 'bold';
    feedback.style.pointerEvents = 'none';
    feedback.style.animation = 'valueFeedback 1s ease-out forwards';
    feedback.style.zIndex = '101';
    feedback.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    feedback.style.padding = '2px 6px';
    feedback.style.borderRadius = '4px';
    feedback.style.textShadow = '0 0 5px white, 0 0 10px white, 0 0 15px white, 0 0 20px white';
    document.body.appendChild(feedback);

    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, duration);
}

function createAttFeedback(text, x, y) {
    const feedback = document.createElement('div');
    feedback.textContent = text;
    feedback.style.position = 'absolute';
    feedback.style.left = x + 'px';
    feedback.style.top = y + 'px';
    feedback.style.fontSize = '20px';
    feedback.style.fontWeight = 'bold';
    feedback.style.pointerEvents = 'none';
    feedback.style.animation = 'valueFeedback 1s ease-out forwards';
    feedback.style.zIndex = '101';
    feedback.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    feedback.style.padding = '4px 8px';
    feedback.style.borderRadius = '6px';
    feedback.style.textShadow = 'none';

    // Color based on text content
    if (text.includes('-1')) {
        feedback.style.color = '#2196F3'; // Blue for -1 Att
    } else {
        feedback.style.color = '#000000'; // Black for +1 Att
    }

    document.body.appendChild(feedback);

    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 5000);
}

function updateScoreAfterClick() {
    score = getValue();
    updateScoreDisplay();

    if (score >= gameConfig.winScore) {
        showNextButton();
    }
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
        scoreElement.textContent = `${score}/${gameConfig.winScore}`;
    }
}

function updateAttDisplay() {
    const attElement = document.getElementById('att-text');
    if (attElement) {
        const currentAtt = getAtt();
        if (currentAtt > 0) {
            attElement.textContent = `Att: ${currentAtt}`;
            attElement.style.display = 'block';
        } else {
            attElement.style.display = 'none';
        }
    }

    // Also update the attention span in hive.html
    const attentionElement = document.getElementById('attention');
    if (attentionElement) {
        attentionElement.textContent = getAtt();
    }
}

function showNextButton() {
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.style.display = 'block';
    }
}

function manageTextTargetCollisions() {
    if (gameConfig.targets !== 'username') return;

    const usernameTargets = activeTargets.filter(target => target instanceof UsernameTarget);
    if (usernameTargets.length < 2) return;

    usernameTargets.sort((a, b) => a.container.y - b.container.y);

    const targetsToRemove = new Set();

    for (let i = 0; i < usernameTargets.length; i++) {
        const targetA = usernameTargets[i];
        if (targetsToRemove.has(targetA)) continue;

        const boundsA = targetA.container.getBounds();
        const centerYA = boundsA.y + boundsA.height / 2;

        for (let j = i + 1; j < usernameTargets.length; j++) {
            const targetB = usernameTargets[j];
            if (targetsToRemove.has(targetB)) continue;

            const boundsB = targetB.container.getBounds();
            const centerYB = boundsB.y + boundsB.height / 2;

            if (Math.abs(centerYB - centerYA) > TEXT_TARGET_COLLISION_THRESHOLD) {
                if (centerYB - centerYA > TEXT_TARGET_COLLISION_THRESHOLD) break;
                continue;
            }

            // Check overlap
            const overlap = boundsA.x < boundsB.x + boundsB.width && boundsA.x + boundsA.width > boundsB.x &&
                boundsA.y < boundsB.y + boundsB.height && boundsA.y + boundsA.height > boundsB.y;

            if (overlap) {
                // Play interaction sound
                play_problem_sfx();

                // Create interaction message (black with 💣 emoji)
                const interactionMsg = document.createElement('div');
                interactionMsg.textContent = '💣interaction💣';
                interactionMsg.style.position = 'absolute';
                // Position at midpoint between the two colliding targets
                const midX = (boundsA.x + boundsA.width / 2 + boundsB.x + boundsB.width / 2) / 2;
                const midY = (boundsA.y + boundsA.height / 2 + boundsB.y + boundsB.height / 2) / 2;
                interactionMsg.style.left = (midX - 50) + 'px'; // Center the text
                interactionMsg.style.top = (midY - 10) + 'px';
                interactionMsg.style.color = 'black';
                interactionMsg.style.fontSize = '14px';
                interactionMsg.style.fontWeight = 'bold';
                interactionMsg.style.pointerEvents = 'none';
                interactionMsg.style.zIndex = '102';
                interactionMsg.style.textAlign = 'center';
                interactionMsg.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                interactionMsg.style.padding = '2px 6px';
                interactionMsg.style.borderRadius = '4px';
                interactionMsg.style.textShadow = '0 0 5px black, 0 0 10px black, 0 0 15px black, 0 0 20px black';
                // Animation: grow bigger while fading
                interactionMsg.style.animation = 'collabGrow 2s ease-out forwards';
                document.body.appendChild(interactionMsg);

                // Remove after animation
                setTimeout(() => {
                    if (interactionMsg.parentNode) {
                        interactionMsg.parentNode.removeChild(interactionMsg);
                    }
                }, 2000);

                // Mark both targets for removal
                targetsToRemove.add(targetA);
                targetsToRemove.add(targetB);
                break;
            }
        }
    }

    let nbToRemove = -1 * Math.ceil(targetsToRemove.size / 2);
    if (isTutorial()) {
        gameConfig.fixedTargetNb += nbToRemove;
    } else {
        incrementNbChatters(nbToRemove);
    }

    targetsToRemove.forEach(target => {
        const index = activeTargets.indexOf(target);
        if (index > -1) {
            activeTargets.splice(index, 1);
        }
        if (target.username) {
            spawnedUsernames.delete(target.username);
        }
        target.destroy();
    });
}

function cleanupGame() {
    Object.values(gameIntervals).forEach(interval => {
        if (interval) clearInterval(interval);
    });
    gameIntervals = {};

    activeTargets.forEach(target => target.destroy());
    activeTargets.length = 0;
    spawnedUsernames.clear();

    if (pixiApp) {
        pixiApp.ticker.remove(gameLoop);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    if (window.gameConfig) {
        gameConfig = { ...gameConfig, ...window.gameConfig };
    }
    console.log('Final gameConfig:', gameConfig);
    score = gameConfig.targets === 'username' ? getAtt() : getValue();
    if (score >= gameConfig.winScore) {
        showNextButton();
    }
    startGame();
});

export { cleanupGame, startGame };
