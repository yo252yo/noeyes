// Configurable game settings - will be overridden by window.gameConfig
let gameConfig = window.gameConfig || {
    targets: 'emoji', // 'emoji', 'avatar', or 'username'
    winScore: 5,
    maxConcurrent: 10 // null for unlimited (emoji mode), number for avatar mode
};

const emoji = ['👶', '👦', '👧', '👨', '👩', '🧑', '👴', '👵'];
const borderColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'aqua', 'fuchsia'];
let score = 0;
let spawnedCount = 0;
let currentSpawned = 0;
let activeTargets = new Set(); // Track active targets for avatar mode
let spawnedUsernames = new Set(); // Track spawned usernames for uniqueness
let usernameValueInterval = null; // Interval for username value generation
let gameActive = false;
let nextButton = null;

function startGame() {
    if (gameActive) return;
    gameActive = true;
    score = getValue();

    // Spawn targets based on config
    if (gameConfig.targets === 'avatar') {
        // Avatar mode: spawn exactly maxConcurrent initially and maintain that count
        for (let i = 0; i < gameConfig.maxConcurrent; i++) {
            spawnTarget();
            currentSpawned++;
        }
    } else if (gameConfig.targets === 'username') {
        // Username mode: spawn exactly maxConcurrent initially and maintain that count
        for (let i = 0; i < gameConfig.maxConcurrent; i++) {
            spawnTarget();
            currentSpawned++;
        }
        // Start value generation interval for usernames (+1 per second per username)
        usernameValueInterval = setInterval(() => {
            if (currentSpawned > 0) {
                // Find all username elements and show +1 feedback for each
                const usernameElements = document.querySelectorAll('.game-username');
                let totalValueGained = 0;

                usernameElements.forEach(usernameElement => {
                    // Create +1 Value feedback for this username
                    const rect = usernameElement.getBoundingClientRect();
                    const feedback = document.createElement('div');
                    feedback.textContent = '+1 Value';
                    feedback.style.position = 'absolute';
                    feedback.style.left = (rect.left + rect.width / 2 - 30) + 'px'; // Center horizontally
                    feedback.style.top = (rect.top - 10) + 'px'; // Above the username
                    feedback.style.color = '#4CAF50';
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

                    // Remove feedback after animation
                    setTimeout(() => {
                        if (feedback.parentNode) {
                            feedback.parentNode.removeChild(feedback);
                        }
                    }, 1000);

                    totalValueGained += 1;
                });

                if (totalValueGained > 0) {
                    incrementValue(totalValueGained);
                    score = getValue();
                    updateScoreDisplay();

                    if (score >= gameConfig.winScore) {
                        showNextButton();
                    }
                }
            }
        }, 1000);
    } else {
        // Emoji mode: start continuous spawning
        spawnTargets();
    }

    // Update score display
    updateScoreDisplay();
}

function spawnTargets() {
    const maxSpawn = gameConfig.maxConcurrent || 10; // Default to 10 if not set
    const interval = setInterval(() => {
        if (spawnedCount >= maxSpawn) {
            return;
        }

        spawnTarget();
        spawnedCount++;
    }, 1000); // Spawn one every second
}

async function spawnTarget() {
    let div;
    if (gameConfig.targets === 'avatar') {
        div = await createAvatarDiv();
        activeTargets.add(div); // Track avatar for distance calculations
    } else if (gameConfig.targets === 'username') {
        div = createUsernameDiv();
    } else {
        div = createEmojiDiv();
    }

    document.body.appendChild(div);

    // Start moving
    moveEmoji(div);
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

    // Random starting position (account for 30px size)
    const startX = Math.random() * (window.innerWidth - 30);
    const startY = Math.random() * (window.innerHeight - 30);
    div.style.left = startX + 'px';
    div.style.top = startY + 'px';

    // Random velocity components
    const speed = 1 + Math.random() * 2; // Random speed between 1-4 pixels per frame
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

async function createAvatarDiv() {
    // Get random streamer
    const streamers = ['vedal987']; // From twitch.js
    const randomStreamer = streamers[Math.floor(Math.random() * streamers.length)];
    const avatarUrl = await getAvatarUrl(randomStreamer);

    // Get random border color
    const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];

    const div = document.createElement('div');
    div.className = 'game-avatar';
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

    // Random starting position (account for 56px size)
    const startX = Math.random() * (window.innerWidth - 56);
    const startY = Math.random() * (window.innerHeight - 56);
    div.style.left = startX + 'px';
    div.style.top = startY + 'px';

    // Random velocity components
    const speed = 1 + Math.random() * 2; // Random speed between 1-4 pixels per frame
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

    // Get random border color for Windows 98 style
    const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];

    const div = document.createElement('div');
    div.className = 'game-username';
    div.style.position = 'absolute';
    div.style.cursor = 'pointer';
    div.style.userSelect = 'none';
    div.style.zIndex = '100';
    div.style.fontFamily = '"MS Sans Serif", Tahoma, sans-serif';
    div.style.fontSize = '12px';
    div.style.fontWeight = 'bold';
    div.style.color = '#000';
    div.style.backgroundColor = '#c0c0c0';
    div.style.border = `2px outset #c0c0c0`;
    div.style.padding = '4px 8px';
    div.style.whiteSpace = 'nowrap';
    div.style.textAlign = 'center';

    // Windows 98 style text shadow/glow effect
    div.style.textShadow = '1px 1px 0px #ffffff, -1px -1px 0px #808080';

    div.textContent = username;

    // Calculate size based on text length
    const textWidth = username.length * 8 + 16; // Rough estimate
    const width = Math.max(80, Math.min(150, textWidth));
    const height = 24;

    div.style.width = width + 'px';
    div.style.height = height + 'px';

    // Random starting position (account for calculated size)
    const startX = Math.random() * (window.innerWidth - width);
    const startY = Math.random() * (window.innerHeight - height);
    div.style.left = startX + 'px';
    div.style.top = startY + 'px';

    // Random velocity components (slower for usernames)
    const speed = 0.5 + Math.random() * 1.5; // Random speed between 0.5-2 pixels per frame
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

function handleUsernameClick(event) {
    // Reverse direction on click (no scoring, no consumption)
    let dx = parseFloat(this.dataset.dx);
    let dy = parseFloat(this.dataset.dy);

    // Reverse both directions
    this.dataset.dx = -dx;
    this.dataset.dy = -dy;
}

function handleTargetClick(event) {
    if (gameConfig.targets === 'avatar') {
        // Avatar mode: distance-based scoring
        handleAvatarClick(this, event);
    } else if (gameConfig.targets === 'username') {
        // Username mode: handled by handleUsernameClick
        handleUsernameClick.call(this, event);
    } else {
        // Emoji mode: simple +1 scoring
        handleEmojiClick(this, event);
    }
}

function handleAvatarClick(clickedAvatar, event) {
    // Remove clicked avatar from tracking
    activeTargets.delete(clickedAvatar);

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
        activeTargets.delete(closestAvatar);
        closestAvatar.remove();
        currentSpawned--;

        // Calculate score: floor(100/distance), capped at 100
        const valueGained = Math.min(100, Math.pow(Math.floor(200 / minDistance), 2));
        incrementValue(valueGained);

        // Create value feedback
        const feedback = document.createElement('div');
        feedback.textContent = `+${valueGained} Value`;
        feedback.style.position = 'absolute';
        feedback.style.left = event.clientX + 'px';
        feedback.style.top = event.clientY + 'px';
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
        }, 2000);

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
    currentSpawned--;

    // Respawn two new avatars
    spawnTarget();
    spawnTarget();
    currentSpawned += 2;

    // Update score
    score = getValue();
    updateScoreDisplay();

    if (score >= gameConfig.winScore) {
        showNextButton();
    }
}

function handleEmojiClick(clickedEmoji, event) {
    // Create +1 Value feedback
    const feedback = document.createElement('div');
    feedback.textContent = '+1 Value';
    feedback.style.position = 'absolute';
    feedback.style.left = event.clientX + 'px';
    feedback.style.top = event.clientY + 'px';
    feedback.style.color = '#4CAF50';
    feedback.style.fontSize = '16px';
    feedback.style.fontWeight = 'bold';
    feedback.style.pointerEvents = 'none';
    feedback.style.animation = 'valueFeedback 5s ease-out forwards';
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
    }, 4000);

    clickedEmoji.remove();
    currentSpawned--;
    incrementValue();
    score = getValue();
    updateScoreDisplay();

    // Spawn replacement
    spawnTarget();
    spawnedCount++;

    if (score >= gameConfig.winScore) {
        showNextButton();
    }
}

function moveEmoji(div) {
    function animate() {
        if (!document.body.contains(div)) return; // Stop if removed

        // Read current velocity from dataset (allows external changes to take effect)
        let dx = parseFloat(div.dataset.dx);
        let dy = parseFloat(div.dataset.dy);

        let x = parseFloat(div.style.left);
        let y = parseFloat(div.style.top);

        x += dx;
        y += dy;

        // Get element dimensions for proper collision detection
        let width, height;

        if (div.className === 'game-emoji') {
            // Add extra hitbox for emojis because they wiggle
            width = 55;
            height = 50;
        } else if (div.className === 'game-username') {
            // Usernames bounce off walls like other elements
            width = parseFloat(div.style.width) + 20;
            height = parseFloat(div.style.height) + 15;
        } else { // 'game-avatar'
            width = 65;
            height = 50;
        }

        // Bounce off walls
        if (x <= 0 || x >= window.innerWidth - width) {
            dx = -dx; // Reverse horizontal direction
            x = Math.max(0, Math.min(window.innerWidth - width, x));
        }
        if (y <= 0 || y >= window.innerHeight - height) {
            dy = -dy; // Reverse vertical direction
            y = Math.max(0, Math.min(window.innerHeight - height, y));
        }

        div.style.left = x + 'px';
        div.style.top = y + 'px';
        div.dataset.dx = dx;
        div.dataset.dy = dy;

        requestAnimationFrame(animate);
    }

    animate();
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
        scoreElement.textContent = `${score}/${gameConfig.winScore}`;
    }
}

function showNextButton() {
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.style.display = 'block';
    }
}

// Cleanup function for when game ends
function cleanupGame() {
    if (usernameValueInterval) {
        clearInterval(usernameValueInterval);
        usernameValueInterval = null;
    }
    // Clear spawned usernames tracking
    spawnedUsernames.clear();
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Override with window.gameConfig if it exists (set in HTML)
    if (window.gameConfig) {
        gameConfig = { ...gameConfig, ...window.gameConfig };
    }
    // Check if score is already winScore or more
    score = getValue();
    if (score >= gameConfig.winScore) {
        showNextButton();
    }
    startGame();
});
