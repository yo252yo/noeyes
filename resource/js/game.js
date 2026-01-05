// Configurable game settings - will be overridden by window.gameConfig
let gameConfig = window.gameConfig || {
    targets: 'emoji', // 'emoji', 'avatar', or 'username'
    winScore: 5,
    fixedTargetNb: 10 // null for unlimited (emoji mode), number for avatar mode
};

import {
    getAtt,
    getChatters,
    getFarmOpen,
    getHiveOpen,
    getNbChatters,
    getStreamers,
    getValue,
    incrementAtt,
    incrementNbChatters,
    incrementValue
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

let score = 0;
let activeTargets = []; // Unified tracking for all active targets
let spawnedUsernames = new Set(); // Track spawned usernames for uniqueness
let gameIntervals = {}; // Centralized interval management
let gameActive = false;
let nextButton = null;

// Threshold for text target collision detection (in pixels)
const TEXT_TARGET_COLLISION_THRESHOLD = 40;

// Helper function to get a lighter shade of a color for gradients
function getLighterColor(color) {
    // Simple color lightening - for named colors, return a lighter version
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

// Helper function to find best spawn position far from existing targets
function findBestSpawnPosition(targetWidth, targetHeight, candidates = 3) {
    // Generate candidate positions
    const candidatePositions = [];
    for (let i = 0; i < candidates; i++) {
        const x = Math.random() * (window.innerWidth - targetWidth);
        const y = Math.random() * (window.innerHeight - targetHeight);
        candidatePositions.push({ x, y });
    }

    // If no active targets, return random candidate
    if (activeTargets.length === 0) {
        return candidatePositions[Math.floor(Math.random() * candidatePositions.length)];
    }

    // Evaluate each candidate by finding minimum distance to existing targets
    let bestPosition = candidatePositions[0];
    let bestMinDistance = 0;

    for (const candidate of candidatePositions) {
        let minDistance = Infinity;

        // Calculate distance to center of each existing target
        for (const existingTarget of activeTargets) {
            const existingX = parseFloat(existingTarget.style.left) + parseFloat(existingTarget.style.width) / 2;
            const existingY = parseFloat(existingTarget.style.top) + parseFloat(existingTarget.style.height) / 2;

            const candidateCenterX = candidate.x + targetWidth / 2;
            const candidateCenterY = candidate.y + targetHeight / 2;

            const distance = calculateDistance(candidateCenterX, candidateCenterY, existingX, existingY);
            minDistance = Math.min(minDistance, distance);
        }

        // Keep track of the candidate with the highest minimum distance
        if (minDistance > bestMinDistance) {
            bestMinDistance = minDistance;
            bestPosition = candidate;
        }
    }

    return bestPosition;
}

function startGame() {
    if (gameActive) return;
    gameActive = true;
    // Initialize score based on game mode
    score = gameConfig.targets === 'username' ? getAtt() : getValue();

    // Set up mode-specific intervals (handles all spawning logic)
    setupGameIntervals();

    // Update score display
    updateScoreDisplay();
}

function setupGameIntervals() {
    if (gameConfig.targets === 'avatar') {
        // Att consumption for avatars
        gameIntervals.avatarAttConsumption = setInterval(() => {
            if (!isTutorial() && activeTargets.length > 0 && getFarmOpen()) {
                activeTargets.forEach(avatarElement => {
                    const rect = avatarElement.getBoundingClientRect();
                    const feedback = document.createElement('div');
                    feedback.textContent = '-1 Att';
                    feedback.style.position = 'absolute';
                    feedback.style.left = (rect.left + rect.width / 2 - 30) + 'px';
                    feedback.style.top = (rect.top - 10) + 'px';
                    feedback.style.color = '#2196F3';
                    feedback.style.fontSize = '12px';
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
                    }, 1000);
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
        // Att generation for usernames
        gameIntervals.usernameValueGeneration = setInterval(() => {
            if (activeTargets.length > 0 && (isTutorial() || getHiveOpen())) {
                activeTargets.forEach(usernameElement => {
                    const rect = usernameElement.getBoundingClientRect();
                    const feedback = document.createElement('div');
                    feedback.textContent = '+1 Att';
                    feedback.style.position = 'absolute';
                    feedback.style.left = (rect.left + rect.width / 2 - 30) + 'px';
                    feedback.style.top = (rect.top - 10) + 'px';
                    feedback.style.color = '#2196F3';
                    feedback.style.fontSize = '12px';
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
                    }, 1000);
                });

                incrementAtt(activeTargets.length);
                score = getAtt();
                updateScoreDisplay();

                if (score >= gameConfig.winScore) {
                    showNextButton();
                }
            }
        }, 1000);

        // Text target collision manager
        gameIntervals.textTargetCollision = setInterval(manageTextTargetCollisions, 500);

        // Continuous spawning for username mode
        gameIntervals.usernameSpawning = setInterval(() => {
            const maxSpawn = gameConfig.fixedTargetNb || Math.max(1, getNbChatters());
            if (activeTargets.length >= maxSpawn) return;
            spawnTarget();
        }, 1000);
    } else if (gameConfig.targets === 'emoji') {
        // Continuous spawning for emoji mode
        gameIntervals.emojiSpawning = setInterval(() => {
            if (activeTargets.length >= gameConfig.fixedTargetNb) return;
            spawnTarget();
        }, 1000);
    }
}

export async function spawnTarget() {
    let div;
    if (gameConfig.targets === 'avatar') {
        div = await createAvatarDiv();
    } else if (gameConfig.targets === 'username') {
        div = createUsernameDiv();
    } else {
        div = createEmojiDiv();
    }

    activeTargets.push(div); // Add to unified tracking
    document.body.appendChild(div);

    // Start moving
    moveTarget(div);
}

export async function spawnSpecificStreamerAvatar(username) {
    const div = await createAvatarDiv(username);
    activeTargets.push(div); // Add to unified tracking
    document.body.appendChild(div);

    // Start moving
    moveTarget(div);
}



function createEmojiDiv() {
    const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
    const div = document.createElement('div');
    div.className = 'game-emoji';
    div.textContent = randomEmoji;
    div.style.position = 'absolute';
    div.style.width = '30px';
    div.style.height = '30px';
    div.style.fontSize = '30px';
    div.style.cursor = 'pointer';
    div.style.userSelect = 'none';
    div.style.animation = 'emojiBlink 1s ease-in-out infinite alternate';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';

    // Find best starting position far from existing targets
    const spawnPosition = findBestSpawnPosition(30, 30);
    div.style.left = spawnPosition.x + 'px';
    div.style.top = spawnPosition.y + 'px';

    // Random velocity components
    const speed = min_speed_emoji + Math.random() * (max_speed_emoji - min_speed_emoji);
    const angle = Math.random() * 2 * Math.PI;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    div.dataset.dx = dx;
    div.dataset.dy = dy;

    // Click handler
    div.addEventListener('click', handleTargetClick);

    // Prevent drag and drop
    div.addEventListener('dragstart', (e) => e.preventDefault());
    div.addEventListener('mousedown', (e) => e.preventDefault());

    return div;
}

async function createAvatarDiv(specificUsername = null) {
    // Get streamer - use specific one if provided, otherwise prefer unused streamers, fallback to any available
    let streamer;

    if (specificUsername) {
        streamer = specificUsername;
    } else {
        const storedStreamers = getStreamers();

        if (storedStreamers.length > 0) {
            // Filter out streamers that are already active
            const activeStreamerNames = activeTargets.map(target => target.dataset.streamer);
            const availableStreamers = storedStreamers.filter(s => !activeStreamerNames.includes(s));

            if (availableStreamers.length > 0) {
                // Use random streamer from available ones
                streamer = availableStreamers[Math.floor(Math.random() * availableStreamers.length)];
            } else {
                // All streamers are already active, use any random one
                streamer = storedStreamers[Math.floor(Math.random() * storedStreamers.length)];
            }
        } else {
            // Fallback to hardcoded streamer
            streamer = 'vedal987';
        }
    }

    const avatarUrl = await getAvatarUrl(streamer);

    // Get random border color
    const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];

    const div = document.createElement('div');
    div.className = 'game-avatar';
    div.dataset.streamer = streamer; // Store streamer name for reference
    div.style.position = 'absolute';
    div.style.width = '36px';
    div.style.height = '36px';
    div.style.cursor = 'pointer';
    div.style.userSelect = 'none';
    div.style.zIndex = '100'; // High z-index to stay in front
    // Windows 98 style circular border with random color
    div.style.border = `3px inset ${randomColor}`;
    div.style.backgroundColor = randomColor;
    div.style.borderRadius = '50%';
    div.style.padding = '3px';
    // No animation for avatars

    const img = document.createElement('img');
    img.src = avatarUrl;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '50%';
    div.appendChild(img);

    // Find best starting position far from existing targets
    const spawnPosition = findBestSpawnPosition(56, 56);
    div.style.left = spawnPosition.x + 'px';
    div.style.top = spawnPosition.y + 'px';

    // Random velocity components
    const speed = min_speed_avatar + Math.random() * (max_speed_avatar - min_speed_avatar);
    const angle = Math.random() * 2 * Math.PI;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    div.dataset.dx = dx;
    div.dataset.dy = dy;

    // Click handler
    div.addEventListener('click', handleTargetClick);

    // Prevent drag and drop
    div.addEventListener('dragstart', (e) => e.preventDefault());
    div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        // Only handle left mouse button
        if (e.button === 0) {
            // Allow normal click handling
        }
    });

    return div;
}

function createUsernameDiv() {
    // Get username - try chatters first, then fake users
    let username;
    const chatters = getChatters();

    // Filter out already spawned usernames
    const availableChatters = chatters.filter(chatter => !spawnedUsernames.has(chatter));

    if (availableChatters.length > 0) {
        // Use random available chatter
        username = availableChatters[Math.floor(Math.random() * availableChatters.length)];
    } else {
        // Fallback to fake users, ensuring uniqueness
        const fakeUsers = generateMultiple(100); // Generate more fake users
        const availableFakeUsers = fakeUsers.filter(fake => !spawnedUsernames.has(fake));

        if (availableFakeUsers.length > 0) {
            username = availableFakeUsers[Math.floor(Math.random() * availableFakeUsers.length)];
        } else {
            // If we somehow run out (very unlikely), just use any fake user
            username = generateTwitchUsername();
        }
    }

    // Track spawned username
    spawnedUsernames.add(username);

    // Get random colors for outrageous 90s/00s web design
    const randomBgColor = borderColors[Math.floor(Math.random() * borderColors.length)];
    // Get contrasting text/border color (different from background)
    let randomTextColor = borderColors[Math.floor(Math.random() * borderColors.length)];
    while (randomTextColor === randomBgColor) {
        randomTextColor = borderColors[Math.floor(Math.random() * borderColors.length)];
    }

    const div = document.createElement('div');
    div.className = 'game-username';
    div.style.position = 'absolute';
    div.style.cursor = 'pointer';
    div.style.userSelect = 'none';
    div.style.zIndex = '100';
    div.style.fontFamily = '"MS Sans Serif", Tahoma, sans-serif';
    div.style.fontSize = '12px';
    div.style.fontWeight = 'bold';
    div.style.color = randomTextColor;

    // Outrageous 90s web design: random bright background with gradient
    div.style.background = `linear-gradient(45deg, ${randomBgColor}, ${getLighterColor(randomBgColor)})`;
    div.style.border = `4px outset ${randomTextColor}`;
    div.style.borderRadius = '50px'; // Oval/pill shape for that web 1.0 feel
    div.style.padding = '2px 8px'; // Smaller padding for compact size
    div.style.whiteSpace = 'nowrap';
    div.style.textAlign = 'center';
    div.style.lineHeight = '1.2'; // Better line height for vertical centering
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.boxShadow = `0 0 10px ${randomBgColor}, inset 0 0 10px rgba(255,255,255,0.3)`;

    // Enhanced Windows 98 style text shadow/glow effect with random color tint
    div.style.textShadow = `1px 1px 0px #ffffff, -1px -1px 0px #808080, 0 0 3px ${randomTextColor}`;

    div.innerHTML = username;

    // Calculate size based on text length
    let textWidth = username.length * 8 + 16; // Rough estimate
    if (username.startsWith('<i>')) {
        textWidth -= 6 * 8;
    }

    const width = Math.max(80, Math.min(150, textWidth));
    const height = 20; // Reduced height

    div.style.width = width + 'px';
    div.style.height = height + 'px';

    // Find best starting position far from existing targets
    const spawnPosition = findBestSpawnPosition(width, height);
    div.style.left = spawnPosition.x + 'px';
    div.style.top = spawnPosition.y + 'px';

    // Random velocity components (slower for usernames)
    const speed = min_speed_username + Math.random() * (max_speed_username - min_speed_username);
    const angle = Math.random() * 2 * Math.PI;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    div.dataset.dx = dx;
    div.dataset.dy = dy;

    // Click handler (uses handleTargetClick which routes to handleUsernameClick)
    div.addEventListener('click', handleTargetClick);

    // Prevent drag and drop
    div.addEventListener('dragstart', (e) => e.preventDefault());
    div.addEventListener('mousedown', (e) => e.preventDefault());

    return div;
}

// Click handler for emoji mode: simple +1 scoring
function handleEmojiClick(clickedEmoji, event) {
    // Remove from active targets
    const index = activeTargets.indexOf(clickedEmoji);
    if (index > -1) {
        activeTargets.splice(index, 1);
    }

    // Create +1 Value feedback
    createValueFeedback('+1 Value', event.clientX, event.clientY, 4000);

    clickedEmoji.remove();
    incrementValue();

    updateScoreAfterClick();

    // Spawn replacement
    spawnTarget();
}

// Click handler for avatar mode: distance-based scoring
function handleAvatarClick(clickedAvatar, event) {
    // Remove clicked avatar from tracking
    const clickedIndex = activeTargets.indexOf(clickedAvatar);
    if (clickedIndex > -1) {
        activeTargets.splice(clickedIndex, 1);
    }

    // Find closest remaining avatar
    let closestAvatar = null;
    let minDistance = Infinity;

    const clickedX = parseFloat(clickedAvatar.style.left) + 28; // Center of 56px avatar
    const clickedY = parseFloat(clickedAvatar.style.top) + 28;

    for (const avatar of activeTargets) {
        const avatarX = parseFloat(avatar.style.left) + 28;
        const avatarY = parseFloat(avatar.style.top) + 28;
        const distance = Math.sqrt((avatarX - clickedX) ** 2 + (avatarY - clickedY) ** 2);

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
        closestAvatar.remove();

        // Calculate score: floor(100/distance), capped at 100
        const valueGained = Math.min(100, Math.pow(Math.floor(200 / minDistance), 2));
        incrementValue(valueGained);

        // Create value feedback
        createValueFeedback(`+${valueGained} Value`, event.clientX, event.clientY, 2000);

        // Create COLLAB message for high scores (>5)
        if (valueGained > 5) {
            const collabMsg = document.createElement('div');
            collabMsg.textContent = '✨COLLAB✨';
            collabMsg.style.position = 'absolute';
            // Position below the clicked avatar (opposite of value feedback)
            const avatarRect = clickedAvatar.getBoundingClientRect();
            collabMsg.style.left = (avatarRect.left + avatarRect.width / 2 - 40) + 'px'; // Center horizontally
            collabMsg.style.top = (avatarRect.bottom + 10) + 'px'; // Below avatar
            collabMsg.style.color = 'fuchsia'; // Traditional HTML fuchsia
            collabMsg.style.fontSize = '14px';
            collabMsg.style.fontWeight = 'bold';
            collabMsg.style.pointerEvents = 'none';
            collabMsg.style.zIndex = '102';
            collabMsg.style.textAlign = 'center';
            collabMsg.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            collabMsg.style.padding = '2px 6px';
            collabMsg.style.borderRadius = '4px';
            collabMsg.style.textShadow = '0 0 5px fuchsia, 0 0 10px fuchsia, 0 0 15px fuchsia, 0 0 20px fuchsia';
            // Animation: grow bigger while fading
            collabMsg.style.animation = 'collabGrow 2s ease-out forwards';
            document.body.appendChild(collabMsg);

            // Remove after animation
            setTimeout(() => {
                if (collabMsg.parentNode) {
                    collabMsg.parentNode.removeChild(collabMsg);
                }
            }, 2000);
        }
    }

    // Remove clicked avatar
    clickedAvatar.remove();
    updateScoreAfterClick();
}

// Click handler for username mode: reverse direction (no scoring, no consumption)
function handleUsernameClick(event) {
    // Reverse direction on click (no scoring, no consumption)
    let dx = parseFloat(this.dataset.dx);
    let dy = parseFloat(this.dataset.dy);

    // Reverse both directions
    this.dataset.dx = -dx;
    this.dataset.dy = -dy;
}

// Main click handler that routes to appropriate handler based on target type
function handleTargetClick(event) {
    if (gameConfig.targets === 'avatar') {
        // Avatar mode: distance-based scoring
        handleAvatarClick(this, event);
    } else if (gameConfig.targets === 'username') {
        // Username mode: reverse direction only
        handleUsernameClick.call(this, event);
    } else {
        // Emoji mode: simple +1 scoring
        handleEmojiClick(this, event);
    }
}

// Get element dimensions for collision detection based on target type
function getElementDimensions(div) {
    if (div.className === 'game-emoji') {
        // Add extra hitbox for emojis because they wiggle
        return { width: 55, height: 50 };
    } else if (div.className === 'game-username') {
        // Usernames bounce off walls like other elements
        return {
            width: parseFloat(div.style.width) * 1.1 + 35,
            height: parseFloat(div.style.height) + 15
        };
    } else { // 'game-avatar'
        return { width: 65, height: 50 };
    }
}

// Detect wall collisions and return collision information
function detectWallCollision(x, y, width, height) {
    const collisions = {
        left: x <= 0,
        right: x >= window.innerWidth - width,
        top: y <= 0,
        bottom: y >= window.innerHeight - height
    };

    const hasCollision = collisions.left || collisions.right || collisions.top || collisions.bottom;

    return { hasCollision, collisions };
}

// Handle wall collision response by updating position and velocity
function handleWallCollision(div, x, y, dx, dy, width, height) {
    let newX = x;
    let newY = y;
    let newDx = dx;
    let newDy = dy;

    const { collisions } = detectWallCollision(x, y, width, height);

    // Bounce off walls
    if (collisions.left || collisions.right) {
        newDx = -newDx; // Reverse horizontal direction
        newX = Math.max(0, Math.min(window.innerWidth - width, newX));
    }
    if (collisions.top || collisions.bottom) {
        newDy = -newDy; // Reverse vertical direction
        newY = Math.max(0, Math.min(window.innerHeight - height, newY));
    }

    return { x: newX, y: newY, dx: newDx, dy: newDy };
}

function moveTarget(div) {
    function animate() {
        if (!document.body.contains(div)) return; // Stop if removed

        // Read current velocity from dataset (allows external changes to take effect)
        let dx = parseFloat(div.dataset.dx);
        let dy = parseFloat(div.dataset.dy);

        // For avatars, scale speed based on Att (disabled in tutorial mode)
        let speedScale = 1;
        if (div.className === 'game-avatar' && !isTutorial()) {
            const currentAtt = getAtt();
            speedScale = Math.min(currentAtt / 100, 1); // 0 if Att=0, 1 if Att>=100
        }

        let x = parseFloat(div.style.left);
        let y = parseFloat(div.style.top);

        x += dx * speedScale;
        y += dy * speedScale;

        // Get element dimensions for collision detection
        const { width, height } = getElementDimensions(div);

        // Handle wall collisions
        const collisionResult = handleWallCollision(div, x, y, dx, dy, width, height);
        x = collisionResult.x;
        y = collisionResult.y;
        dx = collisionResult.dx;
        dy = collisionResult.dy;

        div.style.left = x + 'px';
        div.style.top = y + 'px';
        div.dataset.dx = dx;
        div.dataset.dy = dy;

        requestAnimationFrame(animate);
    }

    animate();
}

// Common function to create value feedback display
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

    // Remove feedback after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, duration);
}

// Common function to handle score updates and win checking
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
}

function showNextButton() {
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.style.display = 'block';
    }
}

// Manager function for text target collision detection (runs every 500ms)
function manageTextTargetCollisions() {
    if (gameConfig.targets !== 'username') return;

    // Get all username targets
    const usernameTargets = Array.from(document.querySelectorAll('.game-username'));
    if (usernameTargets.length < 2) return;

    // Sort by y position
    usernameTargets.sort((a, b) => parseFloat(a.style.top) - parseFloat(b.style.top));

    // Track targets to remove (avoid modifying DOM while iterating)
    const targetsToRemove = new Set();

    // For each target, check collisions with targets within y threshold range
    for (let i = 0; i < usernameTargets.length; i++) {
        const targetA = usernameTargets[i];
        if (targetsToRemove.has(targetA)) continue;

        const yA = parseFloat(targetA.style.top);
        const xA = parseFloat(targetA.style.left);
        const widthA = parseFloat(targetA.style.width);
        const heightA = parseFloat(targetA.style.height);
        const centerXA = xA + widthA / 2;
        const centerYA = yA + heightA / 2;

        // Only check targets within y threshold range (optimization)
        for (let j = i + 1; j < usernameTargets.length; j++) {
            const targetB = usernameTargets[j];
            if (targetsToRemove.has(targetB)) continue;

            const yB = parseFloat(targetB.style.top);
            if (Math.abs(yB - yA) > TEXT_TARGET_COLLISION_THRESHOLD) {
                // Since sorted by y, if y difference exceeds threshold, break
                if (yB - yA > TEXT_TARGET_COLLISION_THRESHOLD) break;
                continue;
            }

            const xB = parseFloat(targetB.style.left);
            const widthB = parseFloat(targetB.style.width);
            const heightB = parseFloat(targetB.style.height);

            // Check for bounding box overlap
            const overlap = (xA < xB + widthB) && (xA + widthA > xB) &&
                (yA < yB + heightB) && (yA + heightA > yB);

            if (overlap) {
                // Mark both targets for removal
                targetsToRemove.add(targetA);
                targetsToRemove.add(targetB);
                break; // Move to next targetA
            }
        }
    }


    // Update nb_chatters if not in tutorial mode
    let nbToRemove = -1 * Math.ceil(targetsToRemove.size / 2);
    if (isTutorial()) {
        gameConfig.fixedTargetNb += nbToRemove;
    } else {
        incrementNbChatters(nbToRemove);
    }

    // Remove collided targets and spawn replacements
    targetsToRemove.forEach(target => {
        // Remove from active targets and spawned usernames tracking
        const targetIndex = activeTargets.indexOf(target);
        if (targetIndex > -1) {
            activeTargets.splice(targetIndex, 1);
        }
        const username = target.textContent;
        spawnedUsernames.delete(username);

        // Remove from DOM
        target.remove();

    });

}

// Cleanup function for when game ends
function cleanupGame() {
    // Clear all active intervals
    Object.values(gameIntervals).forEach(interval => {
        if (interval) {
            clearInterval(interval);
        }
    });
    gameIntervals = {};

    // Clear all active targets from DOM
    activeTargets.forEach(target => {
        if (target.parentNode) {
            target.parentNode.removeChild(target);
        }
    });

    // Clear tracking data
    activeTargets.length = 0;
    spawnedUsernames.clear();
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Override with window.gameConfig if it exists (set in HTML)
    if (window.gameConfig) {
        gameConfig = { ...gameConfig, ...window.gameConfig };
    }
    // Check if score is already winScore or more (based on game mode)
    score = gameConfig.targets === 'username' ? getAtt() : getValue();
    if (score >= gameConfig.winScore) {
        showNextButton();
    }
    startGame();
});
