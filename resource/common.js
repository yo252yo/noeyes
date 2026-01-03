

function setChatters(chatters) {
    localStorage.setItem('twitch_chatters', JSON.stringify(chatters));
}

function getChatters() {
    const stored = localStorage.getItem('twitch_chatters');
    return stored ? JSON.parse(stored) : [];
}

function setStreamers(streamers) {
    localStorage.setItem('twitch_streamers', JSON.stringify(streamers));
}

function getStreamers() {
    const stored = localStorage.getItem('twitch_streamers');
    return stored ? JSON.parse(stored) : [];
}

function callItADay() {
    alert("WIP");
}
