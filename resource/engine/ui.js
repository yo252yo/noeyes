// UI feedback functions for the engine

// Create Att feedback bubble (adapted from game-ui.js)
export function createAttFeedback(text, x, y) {
    // Prevent scrolling by constraining to viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const feedback = document.createElement('div');
    feedback.textContent = text;
    feedback.style.position = 'absolute';
    feedback.style.left = x + 'px';
    feedback.style.top = y + 'px';
    feedback.style.fontSize = '20px';
    feedback.style.fontWeight = 'bold';
    feedback.style.pointerEvents = 'none';
    feedback.style.animation = 'attFeedback 2s ease-out forwards';
    feedback.style.zIndex = '101';
    feedback.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    feedback.style.padding = '4px 8px';
    feedback.style.borderRadius = '6px';
    feedback.style.textShadow = 'none';
    feedback.style.color = '#2196F3'; // Bright blue color

    document.body.appendChild(feedback);

    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 3000); // 3 seconds total visibility
}
