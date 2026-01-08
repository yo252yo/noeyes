// Game logic functions for the engine
import { getFarmOpen, getHiveOpen, incrementAtt, incrementValue, play_error_sfx, play_value_sfx } from '../js/common.js';
import { decreaseNumTargets, IS_TUTORIAL } from './config.js';
import { TARGETS_LIST } from './target.js';
import { createAttFeedback, createCollabPopup, createInteractionFeedback, createValueFeedback, drawCollaborationLine } from './ui.js';

import { incrementNbChatters } from '../js/common.js';

// Handle value increment and feedback
export function value(amount = 1, x, y) {
    // Increment value from common.js
    incrementValue(amount);

    // Create visual feedback popup
    createValueFeedback(`+${amount} Value`, x, y, 4000);
}

// Handle attention change and feedback
export function attention(amount = 1, x, y) {
    // Avatars only consume attention outside tutorial and when farm is open
    if (amount < 0) {
        if (IS_TUTORIAL || !getFarmOpen()) {
            return;
        }
    }

    // Usernames only produce attention if hive is open or during tutorial
    if (amount > 0) {
        if (!IS_TUTORIAL && !getHiveOpen()) {
            return;
        }
    }

    // Change attention from common.js
    incrementAtt(amount);

    // Create visual feedback popup
    const sign = amount >= 0 ? '+' : '';
    createAttFeedback(`${sign}${amount} Att`, x, y);
}

// Handle avatar collaboration
export function collab(clickedAvatar, closestAvatar) {
    let valueGained = 0;

    if (closestAvatar) {
        // Calculate distance between avatars
        const dx = clickedAvatar.x - closestAvatar.x;
        const dy = clickedAvatar.y - closestAvatar.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate value gained based on distance (same formula as original)
        valueGained = Math.min(100, Math.pow(Math.floor(250 / distance), 2));

        // Draw collaboration line
        const lineColor = valueGained > 5 ? 0xff00ff : 0x4CAF50;
        drawCollaborationLine(clickedAvatar.x, clickedAvatar.y, closestAvatar.x, closestAvatar.y, lineColor);

        // Create COLLAB popup and play notification SFX for high scores
        if (valueGained > 5) {
            createCollabPopup(clickedAvatar.x, clickedAvatar.y);
            play_value_sfx();
        } else {
            // Play error SFX for low score collaborations
            play_error_sfx();
        }

        // Remove the closest avatar
        const closestIndex = TARGETS_LIST.indexOf(closestAvatar);
        if (closestIndex > -1) {
            TARGETS_LIST.splice(closestIndex, 1);
        }
        closestAvatar.remove();
    } else {
        play_error_sfx();
    }

    // Always gain value (0 if no collaboration)
    value(valueGained, clickedAvatar.x, clickedAvatar.y);

    // Always remove the clicked avatar
    clickedAvatar.remove();
}

// Handle username target interaction (collision)
export function interaction(targetA, targetB) {
    // Play problem sound
    play_error_sfx();

    // Create interaction feedback at midpoint
    const midX = (targetA.x + targetB.x) / 2;
    const midY = (targetA.y + targetB.y) / 2;
    createInteractionFeedback(midX, midY);

    // Remove both targets
    targetA.remove();
    targetB.remove();

    // Decrease target count
    decreaseNumTargets(1);
    incrementNbChatters(-1);
}
