// Common utility functions for localStorage management

// SFX function mappings - common.js knows which files to play
const SFX_FILES = {
    value: 'resource/SFX/windows_98_tada.mp3',
    startup: 'resource/SFX/windows_98_startup.mp3',
    click: 'resource/SFX/windows_98_click.mp3',
    error: 'resource/SFX/windows_98_chord_1.mp3',
    new_day: 'resource/SFX/windows_98_ring.mp3',
    ding: 'resource/SFX/windows_98_ding.mp3',
    chime: 'resource/SFX/windows_98_chimes.mp3'
};

// SFX helper functions - delegate to top-level window
export function playSFX(soundFile) {
    if (window.top && window.top.playSFX) {
        window.top.playSFX(soundFile);
    }
}

export function play_value_sfx() {
    playSFX(SFX_FILES.value);
}

export function play_startup_sfx() {
    playSFX(SFX_FILES.startup);
}

export function play_click_sfx() {
    playSFX(SFX_FILES.click);
}

export function play_error_sfx() {
    playSFX(SFX_FILES.error);
}

export function play_new_day_sfx() {
    playSFX(SFX_FILES.new_day);
}

export function play_ding_sfx() {
    playSFX(SFX_FILES.ding);
}

export function play_chime_sfx() {
    playSFX(SFX_FILES.chime);
}

// Automatically set up click listeners for next-button elements
export function setupNextButtonListeners() {
    const nextButtons = document.querySelectorAll('.next-button');
    nextButtons.forEach(button => {
        button.addEventListener('click', play_ding_sfx);
    });
}

// Automatically set up next button listeners when the page loads
document.addEventListener('DOMContentLoaded', function () {
    setupNextButtonListeners();
});
setupNextButtonListeners();

// Ending sequences configuration
const ENDING_DAYS = {
    influencer: [9, 24, 31, 35, 38, 47, 52, 55, 58, 62, 65, 66, 67, 69, 71, 72, 73],
    chat: [9, 10, 52641, 52642, 52661]
};

export function setChatters(chatters) {
    localStorage.setItem('twitch_chatters', JSON.stringify(chatters));
}

export function getChatters() {
    const stored = localStorage.getItem('twitch_chatters');
    return stored ? JSON.parse(stored) : [];
}

export function setStreamers(streamers) {
    localStorage.setItem('twitch_streamers', JSON.stringify(streamers));
}

export function getStreamers() {
    const stored = localStorage.getItem('twitch_streamers');
    return stored ? JSON.parse(stored) : [];
}

export function setSuggestedStreamers(suggestedStreamers) {
    localStorage.setItem('twitch_suggested_streamers', JSON.stringify(suggestedStreamers));
}

export function getSuggestedStreamers() {
    const stored = localStorage.getItem('twitch_suggested_streamers');
    return stored ? JSON.parse(stored) : [];
}

export function addSuggestedStreamer(username) {
    const current = getSuggestedStreamers();
    if (!current.includes(username)) {
        current.push(username);
        setSuggestedStreamers(current);
    }
}

export function addStreamer(username) {
    const current = getStreamers();
    if (!current.includes(username)) {
        current.push(username);
        setStreamers(current);
    }
}

export function getDay() {
    const stored = localStorage.getItem('current_day');
    return stored ? parseInt(stored, 10) : 1;
}

export function getMaxAllowedDay() {
    const stored = localStorage.getItem('max_allowed_day');
    return stored ? parseInt(stored, 10) : 1;
}

export function setMaxAllowedDay(day) {
    let current = getMaxAllowedDay();
    localStorage.setItem('max_allowed_day', Math.max(current, day).toString());
}

export function setDay(day) {
    localStorage.setItem('current_day', day.toString());
    updateDayDisplay();

    // Automatically show diary window during ending sequence
    if (day >= 9) {
        const diaryWindow = document.getElementById('diary-window');
        if (diaryWindow) {
            diaryWindow.style.visibility = 'visible';
        }
    }
}

export function incrementDay() {
    const currentDay = getDay();
    setDay(currentDay + 1);
}

export function updateFarmIconVisibility() {
    const farmIcon = document.getElementById('farm-icon');
    if (farmIcon) {
        const currentDay = getDay();
        farmIcon.style.display = currentDay >= 3 ? 'block' : 'none';
    }
}

export function updateHiveIconVisibility() {
    const hiveIcon = document.getElementById('hive-icon');
    if (hiveIcon) {
        const currentDay = getDay();
        hiveIcon.style.display = currentDay >= 4 ? 'block' : 'none';
    }
}

export function updateDayDisplay() {
    const dayElement = document.getElementById('day-text');
    if (dayElement) {
        const currentDay = getDay();
        const finalChoice = getFinalChoice();

        // During ending sequence, show actual day number
        if (finalChoice && currentDay >= 9) {
            dayElement.textContent = `Day ${currentDay}`;
        } else {
            dayElement.textContent = `Day ${currentDay}/7`;
        }
    }
    // Update farm icon visibility when day changes
    updateFarmIconVisibility();
    // Update hive icon visibility when day changes
    updateHiveIconVisibility();
}

export function updateTimeDisplay() {
    const timeElement = document.getElementById('time-text');
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

export function showPopup(message, iconSrc, isError = false) {
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

export function closePopup() {
    const popup = document.getElementById('day-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

export function getValue() {
    const stored = localStorage.getItem('value');
    return stored ? parseInt(stored, 10) : 0;
}

export function setValue(value) {
    localStorage.setItem('value', value.toString());
}

export function incrementValue(amount = 1) {
    const currentValue = getValue();
    setValue(currentValue + amount);
}

export function getAtt() {
    const stored = localStorage.getItem('att');
    return stored ? parseInt(stored, 10) : 0;
}

export function setAtt(att) {
    att = Math.max(att, 0);
    localStorage.setItem('att', att.toString());
}

export function incrementAtt(amount = 1) {
    const currentAtt = getAtt();
    setAtt(currentAtt + amount);
}

export function getNbChatters() {
    const stored = localStorage.getItem('nb_chatters');
    return stored ? parseInt(stored, 10) : 1;
}

export function setNbChatters(nb) {
    nb = Math.max(1, nb); // Minimum 1
    localStorage.setItem('nb_chatters', nb.toString());
}

export function incrementNbChatters(amount = 1) {
    const current = getNbChatters();
    setNbChatters(current + amount);
}

export function getFarmOpen() {
    const stored = localStorage.getItem('farm_open');
    return stored ? stored === 'true' : false;
}

export function setFarmOpen(isOpen) {
    localStorage.setItem('farm_open', isOpen.toString());
}

export function getHiveOpen() {
    const stored = localStorage.getItem('hive_open');
    return stored ? stored === 'true' : false;
}

export function setHiveOpen(isOpen) {
    localStorage.setItem('hive_open', isOpen.toString());
}

export function getFinalChoice() {
    return localStorage.getItem('final_choice');
}

export function setFinalChoice(choice) {
    localStorage.setItem('final_choice', choice);
}

function callItADay_ending(currentDay) {
    const finalChoice = getFinalChoice();
    const endingDays = ENDING_DAYS[finalChoice];
    const currentIndex = endingDays.indexOf(currentDay);

    if (currentIndex >= 0 && currentIndex < endingDays.length - 1) {
        // Jump to next ending day
        const nextDay = endingDays[currentIndex + 1];
        setDay(nextDay);
        setMaxAllowedDay(nextDay);
        showPopup('Welcome to a new day', '../resource/icons/day.png');
        play_new_day_sfx();
    } else if (currentIndex === endingDays.length - 1) {
        // Last day reached, redirect to appropriate ending page
        window.location.href = `ending_${finalChoice}.html`;
    }
}

export function callItADay() {
    const currentDay = getDay();
    const maxAllowedDay = getMaxAllowedDay();

    if (currentDay === 7) {
        // Special case: redirect to choice page
        window.location.href = 'choice.html';
        return;
    }

    // Check if we're in the ending sequence
    if (currentDay >= 9) {
        callItADay_ending(currentDay);
        return;
    }

    // Normal day progression
    if (maxAllowedDay > currentDay) {
        incrementDay();
        showPopup('Welcome to a new day', '../resource/icons/day.png');
        play_new_day_sfx();
    } else {
        showPopup('You must complete all your classes for the day before you can log off', '../resource/icons/error.png', true);
        play_error_sfx();
    }
}
