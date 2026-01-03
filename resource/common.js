

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

function getDay() {
    const stored = localStorage.getItem('current_day');
    return stored ? parseInt(stored, 10) : 1;
}

function setDay(day) {
    localStorage.setItem('current_day', day.toString());
    updateDayDisplay();
}

function incrementDay() {
    const currentDay = getDay();
    setDay(currentDay + 1);
}

function updateDayDisplay() {
    const dayElement = document.getElementById('day-text');
    if (dayElement) {
        dayElement.textContent = `Day ${getDay()}`;
    }
}

function updateTimeDisplay() {
    const timeElement = document.getElementById('time-text');
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

function callItADay() {
    incrementDay();
}

