// Streamer arrays
const streamers = ['vedal987', 'dougdoug', 'shindigs'];
const suggested_streamers = ['vedal987', 'dougdoug', 'shindigs', 'probelive', 'ellie_minibot', 'tenma'];

// Store streamers in localStorage on initialization
setStreamers(streamers);
setSuggestedStreamers(suggested_streamers);


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
