

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
    const dayElement = document.getElementById('day-display');
    if (dayElement) {
        dayElement.textContent = `Day ${getDay()}`;
    }
}

function callItADay() {
    incrementDay();
    updateDiaryContent();
}

function updateDiaryContent() {
    // Update diary content if diary window is open
    const diaryWindow = document.getElementById('diary-window');
    if (diaryWindow && diaryWindow.style.display !== 'none') {
        const diaryIframe = diaryWindow.querySelector('iframe');
        if (diaryIframe && diaryIframe.contentWindow && diaryIframe.contentWindow.generateDiaryContent) {
            diaryIframe.contentWindow.generateDiaryContent();
        }
    }
}
