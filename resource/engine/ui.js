// UI feedback functions for the engine

// Create value feedback popup (adapted from game-ui.js)
export function createValueFeedback(text, x, y, duration = 1000) {
    const feedback = document.createElement('div');
    feedback.textContent = text;
    feedback.style.position = 'absolute';
    feedback.style.left = x + 'px';
    feedback.style.top = y + 'px';
    feedback.style.color = '#4CAF50';
    feedback.style.fontSize = '20px';
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
