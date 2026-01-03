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
    const streamers = getStreamers();
    const container = document.querySelector('.streamers-container') || document.createElement('div');
    container.className = 'streamers-container';
    container.innerHTML = '';

    streamers.forEach(async (username) => {
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

        // Load avatar
        const avatarUrl = await getAvatarUrl(username);
        avatarImg.src = avatarUrl;
    });

    // Add to page if not already present
    if (!document.querySelector('.streamers-container')) {
        document.body.appendChild(container);
    }
}
