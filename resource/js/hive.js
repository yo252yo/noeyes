import { TARGET_TYPES } from '../engine/config.js';
import { requestNewTarget, start } from '../engine/engine.js';
import { getAtt, getDay, getNbAIChatters, getNbChatters, getValue, incrementAtt, incrementNbAIChatters, incrementNbChatters, incrementValue, play_chime_sfx } from './common.js';

// Make functions available on window
window.getValue = getValue;
window.getNbAIChatters = getNbAIChatters;

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
        7: 30,
        8: 50, // <<< required for the ending
        9: 75,
        10: 100,
        11: 150,
        12: 200,
        13: 300,
        14: 500,
        15: 1000
    };
    if (currentChats in prices) {
        return prices[currentChats];
    } else {
        return 1000 * (currentChats - 14);
    }
};

// Function to calculate next AI chat price (uses value currency)
window.getNextAIChatPrice = function (currentAIChats) {
    const prices = {
        1: 10,
        2: 25,
        3: 50,
        4: 100,
        5: 200,
        6: 400,
        7: 800,
        8: 1600,
        9: 3200,
        10: 6400
    };
    if (currentAIChats in prices) {
        return prices[currentAIChats];
    } else {
        return 6400 * Math.pow(2, currentAIChats - 10);
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

    // Update AI chat stats if day >= 6
    const currentDay = getDay();
    const aiChatRow = document.getElementById('ai-chat-row');
    const aiBuyRow = document.getElementById('ai-buy-row');

    if (currentDay >= 6) {
        if (aiChatRow) aiChatRow.style.display = 'table-row';
        if (aiBuyRow) aiBuyRow.style.display = 'table-row';

        const aiChatMembersEl = document.getElementById('ai-chat-members');
        const valueEl = document.getElementById('value');
        const aiNextPriceEl = document.getElementById('ai-next-price');
        const aiBuyButton = document.getElementById('buy-ai-chat-btn');

        if (aiChatMembersEl) aiChatMembersEl.textContent = getNbAIChatters();
        if (valueEl) valueEl.textContent = getValue();

        const currentAIChats = getNbAIChatters();
        const aiNextPrice = getNextAIChatPrice(currentAIChats + 1); // Next price for buying one more
        if (aiNextPriceEl) aiNextPriceEl.textContent = aiNextPrice;

        if (aiBuyButton) {
            const currentValue = getValue();
            const canAffordAI = currentValue >= aiNextPrice;
            aiBuyButton.disabled = !canAffordAI;
            aiBuyButton.style.opacity = canAffordAI ? '1' : '0.5';
            aiBuyButton.style.cursor = canAffordAI ? 'pointer' : 'not-allowed';
        }
    } else {
        if (aiChatRow) aiChatRow.style.display = 'none';
        if (aiBuyRow) aiBuyRow.style.display = 'none';
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

// Buy AI chat function
window.buyAIChat = function () {
    const currentAIChats = getNbAIChatters();
    const price = getNextAIChatPrice(currentAIChats + 1);
    const currentValue = getValue();

    if (currentValue >= price) {
        incrementNbAIChatters(1);
        incrementValue(-price);
        play_chime_sfx();
        requestNewTarget(); // Request the engine to spawn a new AI target
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
