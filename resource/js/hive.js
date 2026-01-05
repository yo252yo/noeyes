import { getAtt, getNbChatters, incrementAtt, incrementNbChatters, play_chime_sfx } from './common.js';
import { spawnTarget } from './game.js';

// Make functions available globally
window.getAtt = getAtt;
window.getNbChatters = getNbChatters;
window.incrementNbChatters = incrementNbChatters;
window.incrementAtt = incrementAtt;
window.spawnTarget = spawnTarget;

window.gameConfig = {
    targets: 'username',
    winScore: 50,
    fixedTargetNb: 0
};

// Function to calculate next chat price
window.getNextChatPrice = function (currentChats) {
    const prices = {
        1: 5,
        2: 20,
        3: 30,
        4: 50,
        5: 75,
        6: 100,
        7: 200,
        8: 500,
        9: 1000,
        10: 5000,
        11: 10000
    };
    if (currentChats in prices) {
        return prices[currentChats];
    } else {
        return Math.pow(10, currentChats - 7);
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
        spawnTarget(); // Spawn the new chatter
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
document.addEventListener('DOMContentLoaded', function () {
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
