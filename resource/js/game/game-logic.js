import { getAtt, getNbChatters, getValue, incrementAtt } from '../common.js';
import { manageTextTargetCollisions } from './game-collision.js';
import { gameConfig } from './game-config.js';
import { initializePixiApp } from './game-pixi.js';
import { createAttFeedback, showNextButton, updateAttDisplay, updateScoreDisplay } from './game-ui.js';
import { AvatarTarget } from './target-avatar.js';
import { activeTargets, gameActive, gameContainer, gameIntervals, lastScrollY, pixiApp, score, setGameActive, setScore } from './target-base.js';
import { EmojiTarget } from './target-emoji.js';
import { UsernameTarget } from './target-username.js';

// Core game logic functions
export function startGame() {
    console.log('startGame called with config:', gameConfig);
    if (gameActive) return;
    setGameActive(true);

    if (!pixiApp) {
        initializePixiApp();
    }

    setScore(gameConfig.targets === 'username' ? getAtt() : getValue());
    setupGameIntervals();
    updateScoreDisplay();

    // Start game loop
    pixiApp.ticker.add(gameLoop);
    console.log('Game started successfully');
}

export function gameLoop() {
    activeTargets.forEach(target => target.update());
}

export function setupGameIntervals() {
    if (gameConfig.targets === 'avatar') {
        gameIntervals.avatarAttConsumption = setInterval(() => {
            // Always show -1 Att popup for avatars and consume Att
            if (activeTargets.length > 0) {
                activeTargets.forEach(target => {
                    if (target instanceof AvatarTarget) {
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

                        createAttFeedback('-1 Att', popupX, popupY);
                    }
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
        gameIntervals.usernameValueGeneration = setInterval(() => {
            if (activeTargets.length > 0) {
                activeTargets.forEach(target => {
                    if (target instanceof UsernameTarget) {
                        const bounds = target.container.getBounds();
                        createAttFeedback('+1 Att', bounds.x + bounds.width / 2, bounds.y - 10);
                    }
                });
                incrementAtt(activeTargets.length);
                setScore(getAtt());
                updateScoreDisplay();
                updateAttDisplay(); // Update the attention span

                if (score >= gameConfig.winScore) {
                    showNextButton();
                }
            }
        }, 1000);

        gameIntervals.textTargetCollision = setInterval(manageTextTargetCollisions, 500);

        gameIntervals.usernameSpawning = setInterval(() => {
            const maxSpawn = gameConfig.fixedTargetNb || Math.max(1, getNbChatters());
            if (activeTargets.length >= maxSpawn) return;
            spawnTarget();
        }, 1000);
    } else if (gameConfig.targets === 'emoji') {
        gameIntervals.emojiSpawning = setInterval(() => {
            if (activeTargets.length >= gameConfig.fixedTargetNb) return;
            spawnTarget();
        }, 1000);
    }
}

export async function spawnTarget() {
    console.log('spawnTarget called');
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
    console.log('Target spawned:', target.constructor.name);
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
