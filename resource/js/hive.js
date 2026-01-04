import { incrementNbChatters } from '../resource/common.js';
import { spawnTarget } from '../resource/game.js';

// Make functions available globally
window.incrementNbChatters = incrementNbChatters;
window.spawnTarget = spawnTarget;

window.gameConfig = {
    targets: 'username',
    winScore: 50,
    fixedTargetNb: 0
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

window.spawnExtraChatter = function () {
    // Increment the chatter count
    incrementNbChatters(1);
    // Spawn one additional target
    spawnTarget();
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Load saved background color on page load
    const savedColor = localStorage.getItem('hiveBackgroundColor');
    if (savedColor) {
        window.changeBackgroundColor(savedColor);
    }
});
