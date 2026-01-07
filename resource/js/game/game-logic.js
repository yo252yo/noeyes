import { getAtt, getNbChatters, getValue, incrementAtt } from '../common.js';
import { manageTextTargetCollisions } from './game-collision.js';
import { gameConfig } from './game-config.js';
import { initializeDebugRendering, renderDebugInfo } from './game-debug.js';
import { initializePixiApp } from './game-pixi.js';
import { createAttFeedback, showNextButton, updateAttDisplay, updateScoreDisplay } from './game-ui.js';
import { AvatarTarget } from './target-avatar.js';
import { activeTargets, gameActive, gameContainer, gameIntervals, isTutorial, lastScrollY, pixiApp, score, setGameActive, setScore } from './target-base.js';
import { EmojiTarget } from './target-emoji.js';
import { UsernameTarget } from './target-username.js';

// Core game logic functions
export function startGame() {
    if (gameActive) return;
    setGameActive(true);

    if (!pixiApp) {
        initializePixiApp();
    }

    // Initialize debug rendering if debug mode is enabled
    if (gameConfig.debugMode && typeof initializeDebugRendering === 'function') {
        initializeDebugRendering();
    }

    setScore(gameConfig.targets === 'username' ? getAtt() : getValue());
    setupGameIntervals();
    updateScoreDisplay();

    // Start game loop
    pixiApp.ticker.add(gameLoop);
}

export function gameLoop() {
    activeTargets.forEach(target => target.update());

    // Render debug information if debug mode is enabled
    if (typeof renderDebugInfo === 'function') {
        renderDebugInfo();
    }
}

export function setupGameIntervals() {
    // Unified attention computation interval - handles all target types
    gameIntervals.attentionComputation = setInterval(() => {
        let totalAttChange = 0;

        // Process attention for all active targets
        activeTargets.forEach(target => {
            if (target.destroyed) return;

            if (target instanceof AvatarTarget) {
                // Avatars consume -1 Att
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

                // Only consume attention in non-tutorial modes
                if (!isTutorial()) {
                    createAttFeedback('-1 Att', popupX, popupY);
                    totalAttChange -= 1;
                }
            } else if (target instanceof UsernameTarget) {
                // Usernames generate +1 Att
                const bounds = target.container.getBounds();
                let popupX = bounds.x + bounds.width / 2;
                let popupY = bounds.y - 10;

                // Adjust Y position if too high (popup would be cut off)
                if (popupY < 20) {
                    popupY = bounds.y + bounds.height + 15;
                }

                // Ensure popup is within viewport bounds
                popupX = Math.max(20, Math.min(popupX, window.innerWidth - 100));
                popupY = Math.max(20, Math.min(popupY, window.innerHeight - 50));

                createAttFeedback('+1 Att', popupX, popupY);
                totalAttChange += 1;
            }
        });

        // Apply total attention change
        if (totalAttChange !== 0) {
            incrementAtt(totalAttChange);
            if (gameConfig.targets === 'username') {
                setScore(getAtt());
                updateScoreDisplay();
                if (score >= gameConfig.winScore) {
                    showNextButton();
                }
            }
            updateAttDisplay();
        }

        // Handle spawning based on target type
        if (gameConfig.targets === 'avatar') {
            const maxSpawn = gameConfig.fixedTargetNb || Math.max(1, getStreamers().length);
            if (activeTargets.length < maxSpawn) {
                spawnTarget();
            }
        } else if (gameConfig.targets === 'username') {
            const maxSpawn = gameConfig.fixedTargetNb || Math.max(1, getNbChatters());
            if (activeTargets.length < maxSpawn) {
                spawnTarget();
            }
        } else if (gameConfig.targets === 'emoji') {
            if (activeTargets.length < gameConfig.fixedTargetNb) {
                spawnTarget();
            }
        }
    }, 1000);

    // Separate collision detection for username mode
    if (gameConfig.targets === 'username') {
        gameIntervals.textTargetCollision = setInterval(manageTextTargetCollisions, 500);
    }
}

export async function spawnTarget() {
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
}

export async function spawnSpecificStreamerAvatar(username) {
    const target = new AvatarTarget(username);
    await target.init(); // Wait for avatar to load
    activeTargets.push(target);
    gameContainer.addChild(target.container);
}

export function updateScoreAfterClick() {
    setScore(getValue());
    updateScoreDisplay();

    if (score >= gameConfig.winScore) {
        showNextButton();
    }
}

// Scroll handling
window.addEventListener('scroll', () => {
    const deltaY = window.scrollY - lastScrollY;
    activeTargets.forEach(target => {
        if (target.container) {
            target.container.y -= deltaY;
        }
    });
    lastScrollY = window.scrollY;
});

import { getStreamers } from '../common.js';
