// Main game entry point - imports from all modules (v3)
// Import modules for side effects (initialization)
import './game/game-config.js';
import './game/game-pixi.js';
import './game/target-base.js';

// Import specific functions needed
import { getAtt, getValue } from './common.js';
import { cleanupGame } from './game/game-collision.js';
import { gameConfig } from './game/game-config.js';
import { spawnSpecificStreamerAvatar, spawnTarget, startGame } from './game/game-logic.js';
import { showNextButton } from './game/game-ui.js';
import { score, setScore } from './game/target-base.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    if (window.gameConfig) {
        Object.assign(gameConfig, window.gameConfig);
    }
    console.log('Final gameConfig:', gameConfig);
    setScore(gameConfig.targets === 'username' ? getAtt() : getValue());
    if (score >= gameConfig.winScore) {
        showNextButton();
    }
    startGame();
});

export { cleanupGame, spawnSpecificStreamerAvatar, spawnTarget };

