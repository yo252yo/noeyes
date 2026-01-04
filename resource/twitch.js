// Streamer arrays
const streamers = ['vedal987', 'dougdoug'];
const suggested_streamers = ['vedal987', 'dougdoug', 'shindigs'];

// Store streamers in localStorage on initialization
setStreamers(streamers);


// Avatar URLs for streamers - simple dictionary storage
const streamerAvatars = {};

// Fallback avatar
const DEFAULT_AVATAR = '/resource/avatars/default.png';

async function getAvatarUrl(username) {
    // Check if we already have this avatar cached
    if (streamerAvatars[username]) {
        return streamerAvatars[username];
    }

    // First try local avatar file
    const localAvatarPath = `/resource/avatars/${username}.png`;
    try {
        const response = await fetch(localAvatarPath, { method: 'HEAD' });
        if (response.ok) {
            streamerAvatars[username] = localAvatarPath;
            return localAvatarPath;
        }
    } catch (error) {
        // Local file doesn't exist, continue to API
    }

    // Try decapi.me API
    try {
        const response = await fetch(`https://decapi.me/twitch/avatar/${username}`);
        if (response.ok) {
            const avatarUrl = await response.text();
            if (avatarUrl && avatarUrl.startsWith('http')) {
                streamerAvatars[username] = avatarUrl;
                return avatarUrl;
            }
        }
    } catch (error) {
        console.warn(`Failed to fetch avatar for ${username} from API:`, error);
    }

    // Fallback to default avatar
    streamerAvatars[username] = DEFAULT_AVATAR;
    return DEFAULT_AVATAR;
}

function displayStreamers() {
    const allStreamers = suggested_streamers;
    const userStreamers = getStreamers(); // Get user's current streamers from localStorage
    const container = document.querySelector('.streamers-container') || document.createElement('div');
    container.className = 'streamers-container';
    container.innerHTML = '';

    // Separate suggested and non-suggested streamers
    const suggestedStreamers = [];
    const regularStreamers = [];

    allStreamers.forEach(username => {
        if (userStreamers.includes(username)) {
            suggestedStreamers.push(username);
        } else {
            regularStreamers.push(username);
        }
    });

    // Function to create streamer element
    const createStreamerElement = async (username, isSuggested) => {
        const streamerDiv = document.createElement('div');
        streamerDiv.className = 'streamer-item' + (isSuggested ? ' suggested' : '');

        const avatarImg = document.createElement('img');
        avatarImg.className = 'streamer-avatar';
        avatarImg.alt = `${username} avatar`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'streamer-name';
        nameSpan.textContent = username;

        streamerDiv.appendChild(avatarImg);
        streamerDiv.appendChild(nameSpan);
        container.appendChild(streamerDiv);

        // Load avatar
        const avatarUrl = await getAvatarUrl(username);
        avatarImg.src = avatarUrl;
    };

    // Display regular streamers first
    regularStreamers.forEach(username => createStreamerElement(username, false));

    // Then display suggested streamers (appear pushed and at bottom)
    suggestedStreamers.forEach(username => createStreamerElement(username, true));

    // Add to page if not already present
    if (!document.querySelector('.streamers-container')) {
        document.body.appendChild(container);
    }
}
