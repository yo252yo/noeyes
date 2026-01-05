import { addStreamer, addSuggestedStreamer, getStreamers, getSuggestedStreamers } from '../common.js';
import { spawnSpecificStreamerAvatar } from '../game.js';
import { getAvatarUrl } from '../twitch.js';

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
window.buildStreamerList = async function () {
    const userStreamers = getStreamers(); // Get user's current streamers from localStorage
    const container = document.querySelector('.streamers-container');
    container.innerHTML = '';

    // Get streamers from suggested list that are NOT in user's streamer list, reversed so newest appears first
    const availableStreamers = getSuggestedStreamers().slice().reverse().filter(username => !userStreamers.includes(username));

    // Process streamers in pairs for 2-column table
    for (let i = 0; i < availableStreamers.length; i += 2) {
        const row = document.createElement('tr');

        // Create first cell
        const cell1 = await createStreamerCell(availableStreamers[i]);
        row.appendChild(cell1);

        // Create second cell (if exists)
        if (i + 1 < availableStreamers.length) {
            const cell2 = await createStreamerCell(availableStreamers[i + 1]);
            row.appendChild(cell2);
        } else {
            // Empty cell for 50/50 split
            const emptyCell = document.createElement('td');
            emptyCell.className = 'streamer-cell';
            row.appendChild(emptyCell);
        }

        container.appendChild(row);
    }
};

// Function to create streamer table cell
async function createStreamerCell(username) {
    const cell = document.createElement('td');
    cell.className = 'streamer-cell';

    const avatarImg = document.createElement('img');
    avatarImg.className = 'streamer-avatar';
    avatarImg.alt = `${username} avatar`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'streamer-name';
    nameSpan.textContent = username;

    cell.appendChild(avatarImg);
    cell.appendChild(nameSpan);

    // Add click event listener to avatar only to add streamer to main list
    avatarImg.addEventListener('click', function () {
        addStreamer(username);
        if (window.spawnSpecificStreamerAvatar) {
            window.spawnSpecificStreamerAvatar(username);
        }
        window.buildStreamerList();
    });

    // Load avatar
    const avatarUrl = await getAvatarUrl(username);
    avatarImg.src = avatarUrl;

    // Use default avatar if it fails to load (404 or other error)
    avatarImg.addEventListener('error', function () {
        avatarImg.src = '../resource/avatars/default.png';
    });

    return cell;
}

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
