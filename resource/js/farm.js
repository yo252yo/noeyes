import { addStreamer, addSuggestedStreamer, getStreamers, getSuggestedStreamers } from '../resource/common.js';
import { spawnSpecificStreamerAvatar } from '../resource/game.js';
import { getAvatarUrl } from '../resource/twitch.js';

// Make functions available globally
window.getStreamers = getStreamers;
window.getSuggestedStreamers = getSuggestedStreamers;
window.addStreamer = addStreamer;
window.addSuggestedStreamer = addSuggestedStreamer;
window.getAvatarUrl = getAvatarUrl;
window.spawnSpecificStreamerAvatar = spawnSpecificStreamerAvatar;

window.gameConfig = {
    targets: 'avatar',
    winScore: 30,
    fixedTargetNb: 0
};

// Move inline script logic here to ensure modules are loaded
window.buildStreamerList = function () {
    const userStreamers = getStreamers(); // Get user's current streamers from localStorage
    const container = document.querySelector('.streamers-container');
    container.innerHTML = '';

    // Get streamers from suggested list that are NOT in user's streamer list, reversed so newest appears first
    const availableStreamers = getSuggestedStreamers().slice().reverse().filter(username => !userStreamers.includes(username));

    // Function to create streamer element
    const createStreamerElement = async (username) => {
        const streamerDiv = document.createElement('div');
        streamerDiv.className = 'streamer-item';

        const avatarImg = document.createElement('img');
        avatarImg.className = 'streamer-avatar';
        avatarImg.alt = `${username} avatar`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'streamer-name';
        nameSpan.textContent = username;

        streamerDiv.appendChild(avatarImg);
        streamerDiv.appendChild(nameSpan);
        container.appendChild(streamerDiv);

        // Add click event listener to add streamer to main list
        streamerDiv.addEventListener('click', function () {
            addStreamer(username);
            if (window.spawnSpecificStreamerAvatar) {
                window.spawnSpecificStreamerAvatar(username);
            }
            window.buildStreamerList();
        });

        // Load avatar
        const avatarUrl = await getAvatarUrl(username);
        avatarImg.src = avatarUrl;
    };

    // Display available streamers
    availableStreamers.forEach(username => createStreamerElement(username));
};

window.openColorPicker = function () {
    document.getElementById('color-picker-popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
};

window.closeColorPicker = function () {
    document.getElementById('color-picker-popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
};

window.changeBackgroundColor = function (color) {
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="${color.replace('#', '%23')}" /><circle cx="16" cy="16" r="8" fill="%2300ffff" opacity="0.1" /></svg>`;
    document.body.style.background = `url('data:image/svg+xml,${svgData}') repeat`;

    // Save the selected color to localStorage
    localStorage.setItem('farmBackgroundColor', color);

    window.closeColorPicker();
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    window.buildStreamerList();

    // Add streamer functionality
    document.getElementById('add-streamer-btn').addEventListener('click', function () {
        const input = document.getElementById('add-streamer-input');
        const username = input.value.trim();
        if (username) {
            addSuggestedStreamer(username);
            window.buildStreamerList();
            input.value = '';
        }
    });

    // Load saved background color on page load
    const savedColor = localStorage.getItem('farmBackgroundColor');
    if (savedColor) {
        window.changeBackgroundColor(savedColor);
    }
});
