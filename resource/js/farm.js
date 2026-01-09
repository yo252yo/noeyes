import { TARGET_TYPES } from '../engine/config.js';
import { requestNewTarget, start } from '../engine/engine.js';
import { addStreamer, addSuggestedStreamer, getDay, getResourcePath, getStreamers, getSuggestedStreamers, getValue } from './common.js';
import { getAvatarUrl } from './twitch.js';

// Price calculation function
function getStreamerPrice(currentCount) {
    switch (currentCount) {
        case 0: return 1;
        case 1: return 50;
        case 2: return 100;
        case 3: return 500;
        case 4: return 1000;
        case 5: return 10000;
        default: return 10000 * Math.pow(10, currentCount - 3);
    }
}

// Function to calculate next AI streamer price (uses attention currency)
function getNextAIStreamerPrice(currentAIStreamers) {
    const prices = {
        1: 256,
        2: 512,
        3: 1024,
        4: 8192,
        5: 65536,
    };
    if (currentAIStreamers in prices) {
        return prices[currentAIStreamers];
    } else {
        return Math.pow(2, 10 + 3 * (currentAIStreamers - 3));
    }
}

// Update visual state of streamer cells (greying/ungreying)
function updateStreamerCellAppearances() {
    const streamerCells = document.querySelectorAll('.streamer-cell');
    const currentValue = getValue();
    const currentStreamers = getStreamers().length;
    const price = getStreamerPrice(currentStreamers);

    streamerCells.forEach(cell => {
        const avatarImg = cell.querySelector('.streamer-avatar');
        const nameSpan = cell.querySelector('.streamer-name');

        if (avatarImg && nameSpan) {
            const canAfford = currentValue >= price;

            if (!canAfford) {
                avatarImg.style.filter = 'grayscale(100%)';
                avatarImg.style.opacity = '0.5';
                nameSpan.style.opacity = '0.5';
            } else {
                avatarImg.style.filter = '';
                avatarImg.style.opacity = '';
                nameSpan.style.opacity = '';
            }
        }
    });
}

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

    // Check if player can afford this streamer
    const currentValue = getValue();
    const currentStreamers = getStreamers().length;
    const price = getStreamerPrice(currentStreamers);
    const canAfford = currentValue >= price;

    // Grey out if cannot afford
    if (!canAfford) {
        avatarImg.style.filter = 'grayscale(100%)';
        avatarImg.style.opacity = '0.5';
        nameSpan.style.opacity = '0.5';
    } else {
        avatarImg.style.filter = '';
        avatarImg.style.opacity = '';
        nameSpan.style.opacity = '';
    }

    // Add click event listener to avatar only to add streamer to main list
    avatarImg.addEventListener('click', async function () {
        const { incrementValue, play_chime_sfx } = await import('./common.js');
        const currentValue = getValue();
        const currentStreamers = getStreamers().length;
        const price = getStreamerPrice(currentStreamers);

        if (currentValue >= price) {
            addStreamer(username);
            incrementValue(-price);
            play_chime_sfx();
            requestNewTarget();
            updateFarmStats();
            window.buildStreamerList();
        }
        // If cannot afford, do nothing (could add feedback here)
    });

    // Load avatar
    const avatarUrl = await getAvatarUrl(username);
    avatarImg.src = avatarUrl;

    // Use default avatar if it fails to load (404 or other error)
    avatarImg.addEventListener('error', function () {
        avatarImg.src = getResourcePath('resource/avatars/default.png');
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

// Update farm stats including AI streamer stats
function updateFarmStats() {
    const valueElement = document.getElementById('farm-value');
    const priceElement = document.getElementById('next-price');
    if (valueElement && priceElement) {
        const currentValue = getValue();
        const currentStreamers = getStreamers().length;
        const nextPrice = getStreamerPrice(currentStreamers);
        valueElement.textContent = currentValue;
        priceElement.textContent = nextPrice;
    }

    // Update AI streamer stats if day >= 6
    const currentDay = getDay();
    const aiStreamerRow = document.getElementById('ai-streamer-row');
    const aiStreamerMembersEl = document.getElementById('ai-streamer-members');
    const attentionEl = document.getElementById('attention');
    const aiStreamerNextPriceEl = document.getElementById('ai-streamer-next-price');
    const aiStreamerBuyButton = document.getElementById('buy-ai-streamer-btn');

    if (currentDay >= 6) { // Show AI streamer row starting from day 6
        if (aiStreamerRow) aiStreamerRow.style.display = 'table-row';

        // Import AI streamer functions dynamically
        import('./common.js').then(common => {
            if (aiStreamerMembersEl) aiStreamerMembersEl.textContent = common.getNbAIStreamers();
            if (attentionEl) attentionEl.textContent = common.getAtt();

            const currentAIStreamers = common.getNbAIStreamers();
            const aiStreamerNextPrice = getNextAIStreamerPrice(currentAIStreamers + 1);
            if (aiStreamerNextPriceEl) aiStreamerNextPriceEl.textContent = aiStreamerNextPrice;

            if (aiStreamerBuyButton) {
                const currentAtt = common.getAtt();
                const canAffordAI = currentAtt >= aiStreamerNextPrice;
                aiStreamerBuyButton.disabled = !canAffordAI;
                aiStreamerBuyButton.style.opacity = canAffordAI ? '1' : '0.5';
                aiStreamerBuyButton.style.cursor = canAffordAI ? 'pointer' : 'not-allowed';
            }
        });
    } else {
        if (aiStreamerRow) aiStreamerRow.style.display = 'none';
    }

    // Update streamer cell appearances based on current affordability
    updateStreamerCellAppearances();
}

// Buy AI streamer function
window.buyAIStreamer = function () {
    import('./common.js').then(common => {
        const currentAIStreamers = common.getNbAIStreamers();
        const price = getNextAIStreamerPrice(currentAIStreamers + 1);
        const currentAtt = common.getAtt();

        if (currentAtt >= price) {
            common.incrementNbAIStreamers(1);
            common.incrementAtt(-price);
            common.play_chime_sfx();
            requestNewTarget(); // Request the engine to spawn a new target
            updateFarmStats();
        }
    });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function () {
    start(TARGET_TYPES.AVATAR, 0);

    // Load saved background color on page load
    const savedColor = localStorage.getItem('farmBackgroundColor');
    if (savedColor) {
        window.changeBackgroundColor(savedColor);
    }

    // Initial stats update
    updateFarmStats();

    // Update stats every 200ms for real-time display
    setInterval(updateFarmStats, 200);

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
});
window.buildStreamerList();
