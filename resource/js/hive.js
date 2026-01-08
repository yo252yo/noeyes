import { TARGET_TYPES } from '../engine/config.js';
import { requestNewTarget, start } from '../engine/engine.js';
import { getAtt, getNbChatters, incrementAtt, incrementNbChatters, play_chime_sfx } from './common.js';


window.gameConfig = {
    targets: 'username',
    winScore: 50,
    fixedTargetNb: 0
};

// Function to calculate next chat price
window.getNextChatPrice = function (currentChats) {
    const prices = {
        1: 2,
        2: 4,
        3: 6,
        4: 10,
        5: 15,
        6: 20,
        7: 25,
        8: 30, // <<< required for the ending
        9: 40,
        10: 50,
        11: 75,
        12: 100,
        13: 150,
        14: 200,
        15: 300,
        16: 500,
        17: 1000
    };
    if (currentChats in prices) {
        return prices[currentChats];
    } else {
        return 1000 * (currentChats - 16);
    }
};

// Update stats display
window.updateHiveStats = function () {
    const chatMembersEl = document.getElementById('chat-members');
    const attentionEl = document.getElementById('attention');
    const nextPriceEl = document.getElementById('next-price');
    const buyButton = document.getElementById('buy-chat-btn');

    if (chatMembersEl) chatMembersEl.textContent = getNbChatters();
    if (attentionEl) attentionEl.textContent = getAtt();

    const currentChats = getNbChatters();
    const nextPrice = getNextChatPrice(currentChats);
    if (nextPriceEl) nextPriceEl.textContent = nextPrice;

    if (buyButton) {
        const currentAtt = getAtt();
        const canAfford = currentAtt >= nextPrice;
        buyButton.disabled = !canAfford;
        buyButton.style.opacity = canAfford ? '1' : '0.5';
        buyButton.style.cursor = canAfford ? 'pointer' : 'not-allowed';
    }
};

// Buy chat function
window.buyChat = function () {
    const currentChats = getNbChatters();
    const price = getNextChatPrice(currentChats);
    const currentAtt = getAtt();

    if (currentAtt >= price) {
        incrementNbChatters(1);
        incrementAtt(-price);
        play_chime_sfx();
        requestNewTarget(); // Request the engine to spawn a new target
        updateHiveStats();
    }
};

// UI functions
window.openColorPicker = function () {
    document.getElementById('color-picker-popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
};

window.closeColorPicker = function () {
    document.getElementById('color-picker-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
};

window.changeBackgroundColor = function (color) {
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color.replace('#', '%23')}"/><rect x="0" y="0" width="20" height="40" fill="%23ffff00" opacity="0.15"/><rect x="20" y="0" width="20" height="40" fill="${color.replace('#', '%23')}"/></svg>`;
    document.body.style.background = `url('data:image/svg+xml,${svgData}') repeat`;

    // Save the selected color to localStorage
    localStorage.setItem('hiveBackgroundColor', color);

    window.closeColorPicker();
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function () {
    // Initialize the engine
    start(TARGET_TYPES.USERNAME, 0); // Start with username targets, 0 auto-spawn

    // Load saved background color on page load
    const savedColor = localStorage.getItem('hiveBackgroundColor');
    if (savedColor) {
        window.changeBackgroundColor(savedColor);
    }

    // Initial stats update
    updateHiveStats();

    // Update stats every 200ms for real-time display
    setInterval(updateHiveStats, 200);
});
