// Shared JavaScript file

console.log("Script loaded");

function callItADay() {
    alert("WIP");
}

function closeDiaryWindow() {
    document.getElementById('diary-window').style.display = 'none';
}

// Desktop icon dragging
let isDragging = false;
let dragElement = null;
let offsetX, offsetY;
let dragStarted = false;

document.addEventListener('DOMContentLoaded', function () {
    const diaryIcon = document.getElementById('diary-icon');
    const diaryWindow = document.getElementById('diary-window');

    // Toggle diary window
    function displayDiary() {
        diaryWindow.style.display = 'block';
    }

    // Click for desktop
    diaryIcon.addEventListener('click', function () {
        if (!dragStarted) {
            displayDiary();
        }
        dragStarted = false; // Reset flag
    });

    // Touch end for mobile tap
    diaryIcon.addEventListener('touchend', function (e) {
        if (!dragStarted) {
            displayDiary();
        }
        dragStarted = false; // Reset flag
        e.preventDefault();
    });

    // Helper function to get client coordinates
    function getClientCoords(e) {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    }

    // Start dragging (mouse and touch)
    function startDrag(e) {
        isDragging = true;
        dragElement = this;
        dragStarted = false; // Reset flag
        const coords = getClientCoords(e);
        offsetX = coords.clientX - this.offsetLeft;
        offsetY = coords.clientY - this.offsetTop;
        this.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent scrolling on touch
    }

    // Move dragging (mouse and touch)
    function moveDrag(e) {
        if (isDragging && dragElement) {
            dragStarted = true; // Mark as dragged
            const coords = getClientCoords(e);
            dragElement.style.left = (coords.clientX - offsetX) + 'px';
            dragElement.style.top = (coords.clientY - offsetY) + 'px';
            e.preventDefault(); // Prevent scrolling on touch
        }
    }

    // End dragging (mouse and touch)
    function endDrag(e) {
        if (isDragging) {
            isDragging = false;
            if (dragElement) {
                dragElement.style.cursor = 'pointer';
                dragElement = null;
            }
        }
    }

    // Mouse events
    diaryIcon.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);

    // Touch events
    diaryIcon.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', moveDrag);
    document.addEventListener('touchend', endDrag);

    // Window dragging
    const titleBar = diaryWindow.querySelector('.window-title-bar');
    let windowDragging = false;
    let windowOffsetX, windowOffsetY;

    function startWindowDrag(e) {
        windowDragging = true;
        const rect = diaryWindow.getBoundingClientRect();
        const coords = getClientCoords(e);
        windowOffsetX = coords.clientX - rect.left;
        windowOffsetY = coords.clientY - rect.top;
        e.preventDefault();
    }

    function moveWindowDrag(e) {
        if (windowDragging) {
            const coords = getClientCoords(e);
            diaryWindow.style.left = (coords.clientX - windowOffsetX) + 'px';
            diaryWindow.style.top = (coords.clientY - windowOffsetY) + 'px';
            e.preventDefault();
        }
    }

    function endWindowDrag(e) {
        windowDragging = false;
    }

    titleBar.addEventListener('mousedown', startWindowDrag);
    titleBar.addEventListener('touchstart', startWindowDrag);
    document.addEventListener('mousemove', moveWindowDrag);
    document.addEventListener('touchmove', moveWindowDrag);
    document.addEventListener('mouseup', endWindowDrag);
    document.addEventListener('touchend', endWindowDrag);
});
