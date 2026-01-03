const emoji = ['👶', '👦', '👧', '👨', '👩', '🧑', '👴', '👵'];
const WIN_SCORE = 5;
let score = 0;
let spawnedCount = 0;
const maxSpawn = 10;
let gameActive = false;
let nextButton = null;

function startGame() {
    if (gameActive) return;
    gameActive = true;
    score = getValue();

    // Spawn emojis
    spawnEmojis();

    // Update score display
    updateScoreDisplay();
}

function spawnEmojis() {
    const interval = setInterval(() => {
        if (spawnedCount >= maxSpawn) {
            return;
        }

        spawnEmoji();
        spawnedCount++;
    }, 1000); // Spawn one every second
}

function spawnEmoji() {
    const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
    const div = document.createElement('div');
    div.className = 'game-emoji';
    div.textContent = randomEmoji;
    div.style.position = 'absolute';
    div.style.fontSize = '30px';
    div.style.cursor = 'pointer';
    div.style.userSelect = 'none';
    div.style.animation = 'emojiBlink 1s ease-in-out infinite alternate';

    // Random starting position
    const startX = Math.random() * (window.innerWidth - 50);
    const startY = Math.random() * (window.innerHeight - 50);
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
    div.addEventListener('click', (event) => {
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

        div.remove();
        incrementValue();
        score = getValue();
        updateScoreDisplay();

        // Spawn a new emoji to replace the clicked one
        spawnEmoji();

        if (score >= WIN_SCORE) {
            showNextButton();
        }
    });

    document.body.appendChild(div);

    // Start moving
    moveEmoji(div);
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

        // Bounce off walls
        if (x <= 0 || x >= window.innerWidth - 50) {
            dx = -dx; // Reverse horizontal direction
            x = Math.max(0, Math.min(window.innerWidth - 50, x));
        }
        if (y <= 0 || y >= window.innerHeight - 50) {
            dy = -dy; // Reverse vertical direction
            y = Math.max(0, Math.min(window.innerHeight - 50, y));
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
        scoreElement.textContent = `${score}/${WIN_SCORE}`;
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
    // Check if score is already WIN_SCORE or more
    score = getValue();
    if (score >= WIN_SCORE) {
        showNextButton();
    }
    startGame();
});
