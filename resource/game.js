// Configurable game settings
let gameConfig = window.gameConfig || {
    targets: 'emoji', // 'emoji' or 'avatar'
    winScore: 5,
    maxConcurrent: 10 // null for unlimited (emoji mode), number for avatar mode
};

const emoji = ['👶', '👦', '👧', '👨', '👩', '🧑', '👴', '👵'];
const borderColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'aqua', 'fuchsia'];
let score = 0;
let spawnedCount = 0;
let currentSpawned = 0;
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
    div.style.width = '56px';
    div.style.height = '56px';
    div.style.cursor = 'pointer';
    div.style.userSelect = 'none';
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

    return div;
}

function handleTargetClick(event) {
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
    feedback.style.animation = 'valueFeedback 1s ease-out forwards';
    document.body.appendChild(feedback);

    // Remove feedback after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 1000);

    this.remove();
    currentSpawned--;
    incrementValue();
    score = getValue();
    updateScoreDisplay();

    // Spawn a new target to replace the clicked one
    if (gameConfig.targets === 'avatar') {
        // Avatar mode: maintain exactly maxConcurrent
        spawnTarget();
        currentSpawned++;
    } else {
        // Emoji mode: spawn replacement
        spawnTarget();
        spawnedCount++;
    }

    if (score >= gameConfig.winScore) {
        showNextButton();
    }
}

function moveEmoji(div) {
    let dx = parseFloat(div.dataset.dx);
    let dy = parseFloat(div.dataset.dy);

    function animate() {
        if (!document.body.contains(div)) return; // Stop if removed

        let x = parseFloat(div.style.left);
        let y = parseFloat(div.style.top);

        x += dx;
        y += dy;

        // Get element dimensions for proper collision detection
        let width = div.offsetWidth || 50;
        let height = div.offsetHeight || 50;

        // Add extra hitbox for emojis because they wiggle
        if (div.className === 'game-emoji') {
            width += 10;
            height += 10;
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

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if score is already winScore or more
    score = getValue();
    if (score >= gameConfig.winScore) {
        showNextButton();
    }
    startGame();
});
