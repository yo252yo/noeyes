import { incrementNbChatters, play_problem_sfx } from '../common.js';
import { gameConfig, TEXT_TARGET_COLLISION_THRESHOLD } from './game-config.js';
import { activeTargets, gameIntervals, isTutorial, spawnedUsernames } from './target-base.js';
import { UsernameTarget } from './target-username.js';

// Collision Management
export function manageTextTargetCollisions() {
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
        // Mark as destroyed to prevent popup creation for this target
        target.destroyed = true;
        target.destroy();
    });
}

export function cleanupGame() {
    Object.values(gameIntervals).forEach(interval => {
        if (interval) clearInterval(interval);
    });
    gameIntervals = {};

    activeTargets.forEach(target => target.destroy());
    activeTargets.length = 0;
    spawnedUsernames.clear();

    // Import pixiApp and gameLoop statically
    import('./target-base.js').then(({ pixiApp }) => {
        if (pixiApp) {
            pixiApp.ticker.remove(gameLoop);
        }
    });
}

import { gameLoop } from './game-logic.js';
