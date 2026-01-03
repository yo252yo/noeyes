const streamers = ['vedal987'];
const chatters = new Set();

// Store streamers in localStorage on initialization
setStreamers(streamers);

// Expose chatters globally for access from iframes
window.chatters = chatters;

console.log('Starting Twitch IRC client…');

const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

ws.onopen = () => {
    //console.log('WS OPEN');
    ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    ws.send(`NICK justinfan${Math.floor(Math.random() * 1e6)}`);
    streamers.forEach(s => {
        //console.log('JOINING', s);
        ws.send(`JOIN #${s}`);
    });
};

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
            chatters.add(username);
            //console.log('NEW CHATTER:', username);
            console.log('CHATTER SET:', [...chatters]);

            // Store chatters in localStorage
            setChatters([...chatters]);
        }
    }
};
