

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

function getMaxAllowedDay() {
    const stored = localStorage.getItem('max_allowed_day');
    return stored ? parseInt(stored, 10) : 1;
}

function setMaxAllowedDay(day) {
    localStorage.setItem('max_allowed_day', day.toString());
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

function showPopup(message, iconSrc, isError = false) {
    // Create popup container if it doesn't exist
    let popup = document.getElementById('day-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'day-popup';
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-icon">
                    <img id="popup-icon-img" src="" alt="Icon">
                </div>
                <div class="popup-message" id="popup-message"></div>
                <button class="popup-ok-btn" onclick="closePopup()">OK</button>
            </div>
        `;
        document.body.appendChild(popup);
    }

    // Set content
    document.getElementById('popup-icon-img').src = iconSrc;
    document.getElementById('popup-message').textContent = message;

    // Show popup
    popup.style.display = 'flex';
}

function closePopup() {
    const popup = document.getElementById('day-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function getValue() {
    const stored = localStorage.getItem('value');
    return stored ? parseInt(stored, 10) : 0;
}

function setValue(value) {
    localStorage.setItem('value', value.toString());
}

function incrementValue(amount = 1) {
    const currentValue = getValue();
    setValue(currentValue + amount);
}

function callItADay() {
    const currentDay = getDay();
    const maxAllowedDay = getMaxAllowedDay();

    if (maxAllowedDay > currentDay) {
        incrementDay();
        showPopup('Welcome to a new day', '/resource/day_icon.png');
    } else {
        showPopup('You must complete all your classes for the day before you can log off', '/resource/error_icon.png', true);
    }
}
