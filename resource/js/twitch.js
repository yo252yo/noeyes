// Streamer arrays
const streamers = [];
export const defaultStreamers = (['vedal987', 'hasanabi', 'shindigs', 'vinesauce', 'dougdoug', 'day9tv']).reverse();



import { addSuggestedStreamer, getSuggestedStreamers } from './common.js';

if (getSuggestedStreamers().length === 0) {
    addSuggestedStreamer(defaultStreamers);
}

// Avatar URLs for streamers - simple dictionary storage
const streamerAvatars = {};

// Fallback avatar
const DEFAULT_AVATAR = '../resource/avatars/default.png';

export async function getAvatarUrl(username) {
    // Check if we already have this avatar cached
    if (streamerAvatars[username]) {
        return streamerAvatars[username];
    }

    // First try local avatar file
    const localAvatarPath = `../resource/avatars/${username}.png`;
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
