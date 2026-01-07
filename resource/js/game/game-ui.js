import { getAtt } from '../common.js';

// UI/Feedback Functions
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

export function createAttFeedback(text, x, y) {
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
    feedback.style.color = '#2196F3'; // Bright blue color for both + and -

    // Prevent scrolling by constraining to viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If popup would go outside viewport, hide it instead
    if (x < 0 || x > viewportWidth - 100 || y < 0 || y > viewportHeight - 50) {
        feedback.style.display = 'none';
        return; // Don't add to DOM if outside viewport
    }

    document.body.appendChild(feedback);

    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 3000); // 3 seconds total visibility
}

export function updateScoreDisplay() {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
        scoreElement.textContent = `${score}/${gameConfig.winScore}`;
    }
}

export function updateAttDisplay() {
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

export function showNextButton() {
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.style.display = 'block';
    }
}

import { gameConfig } from './game-config.js';
import { score } from './target-base.js';

