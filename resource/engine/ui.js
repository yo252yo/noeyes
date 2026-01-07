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

// Draw a line connecting two points (for avatar collaboration)
export function drawCollaborationLine(x1, y1, x2, y2, color = 0xff00ff) {
    // Get PIXI app dynamically to avoid import issues
    import('./engine.js').then(({ getPixiApp }) => {
        const pixiApp = getPixiApp();
        if (!pixiApp) return;

        const lineGraphics = new window.PIXI.Graphics();
        lineGraphics.lineStyle(4, color);
        lineGraphics.moveTo(x1, y1);
        lineGraphics.lineTo(x2, y2);
        pixiApp.stage.addChild(lineGraphics);

        // Delete the line after 300ms
        setTimeout(() => {
            if (lineGraphics.parent) {
                lineGraphics.parent.removeChild(lineGraphics);
            }
            lineGraphics.destroy();
        }, 300);
    });
}

// Create COLLAB message popup for high-value collaborations
export function createCollabPopup(x, y) {
    const collabMsg = document.createElement('div');
    collabMsg.textContent = '✨COLLAB✨';
    collabMsg.style.position = 'absolute';
    collabMsg.style.left = (x - 40) + 'px';
    collabMsg.style.top = (y + 10) + 'px';
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

// Create interaction message popup for username collisions
export function createInteractionFeedback(x, y) {
    const interactionMsg = document.createElement('div');
    interactionMsg.textContent = '💣interaction💣';
    interactionMsg.style.position = 'absolute';
    interactionMsg.style.left = (x - 50) + 'px';
    interactionMsg.style.top = (y - 10) + 'px';
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
    interactionMsg.style.animation = 'collabGrow 2s ease-out forwards';
    document.body.appendChild(interactionMsg);

    setTimeout(() => {
        if (interactionMsg.parentNode) {
            interactionMsg.parentNode.removeChild(interactionMsg);
        }
    }, 2000);
}
