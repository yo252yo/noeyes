

import { getChatters, getStreamers, setChatters } from './common.js';

export const chatters = new Map();
const MAX_CHATTERS = 200;

// Load existing chatters from storage
const storedChatters = getChatters();
for (const [user, msgs] of Object.entries(storedChatters)) {
    chatters.set(user, msgs);
}

// Expose chatters globally for access from iframes
window.chatters = chatters;

// Track joined streamers to detect new ones
const joinedStreamers = new Set();

console.log('Starting Twitch IRC client…');

const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

ws.onopen = () => {
    //console.log('WS OPEN');
    ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    ws.send(`NICK justinfan${Math.floor(Math.random() * 1e6)}`);
};

// Poll localStorage for new streamers to join (since iframe communication is forbidden)
setInterval(() => {
    const currentStreamers = getStreamers();
    for (const streamer of currentStreamers) {
        if (!joinedStreamers.has(streamer)) {
            if (ws.readyState === WebSocket.OPEN) {
                console.log('JOINING NEW STREAMER FROM POLL:', streamer);
                ws.send(`JOIN #${streamer}`);
                joinedStreamers.add(streamer);
            }
        }
    }
}, 5000); // Check every 5 seconds

ws.onerror = (e) => {
    console.error('WS ERROR', e);
};

ws.onclose = (e) => {
    console.warn('WS CLOSED', e);
};

ws.onmessage = (e) => {
    //console.log('RAW:', e.data);

    const lines = e.data.trim().split('\r\n');
    for (const line of lines) {

        if (line.startsWith('PING')) {
            ws.send('PONG :tmi.twitch.tv');
            return;
        }

        if (!line.includes('PRIVMSG')) return;

        // Parse the message content
        let messageMatch = line.match(/PRIVMSG #[^:]+:(.+)$/);
        let message = messageMatch?.[1];
        if (!message) return;

        // 1) Try display-name from tags
        let userMatch = line.match(/display-name=([^;]*)/);
        let username = userMatch?.[1];

        // 2) Fallback to prefix parsing
        if (!username) {
            const prefixMatch = line.match(/:([^!]+)!/);
            username = prefixMatch?.[1];
        }

        if (!username) return;

        username = username.toLowerCase();

        if (!chatters.has(username)) {
            // If we've reached the max limit, remove the oldest chatter
            if (chatters.size >= MAX_CHATTERS) {
                const firstChatter = chatters.keys().next().value;
                chatters.delete(firstChatter);
            }

            chatters.set(username, []);
        }

        // Store the message
        chatters.get(username).push(message);
        console.log('CHATTER: ', username + ':', message);
        setChatters(Object.fromEntries(chatters));
    }
};
