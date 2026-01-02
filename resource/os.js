
function closeDiaryWindow() {
    document.getElementById('diary-window').style.display = 'none';
}

function closeClassWindow() {
    document.getElementById('class-window').style.display = 'none';
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

    // Close button touch support
    const closeBtn = diaryWindow.querySelector('.window-close-btn');
    closeBtn.addEventListener('touchstart', function (e) {
        this.classList.add('pressed');
    });
    closeBtn.addEventListener('touchend', function (e) {
        this.classList.remove('pressed');
        const rect = this.getBoundingClientRect();
        const touch = e.changedTouches[0];
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            closeDiaryWindow();
        }
    });

    // Window resizing for diary window
    diaryWindow.addEventListener('mousedown', function (e) { startResize(e, diaryWindow); });
    diaryWindow.addEventListener('touchstart', function (e) { startResize(e, diaryWindow); });
    diaryWindow.addEventListener('mousemove', function (e) { updateCursor(e, diaryWindow); });

    // Class icon and window
    const classIcon = document.getElementById('class-icon');
    const classWindow = document.getElementById('class-window');

    // Toggle class window
    function displayClass() {
        classWindow.style.display = 'block';
    }

    // Click for desktop
    classIcon.addEventListener('click', function () {
        if (!dragStarted) {
            displayClass();
        }
        dragStarted = false; // Reset flag
    });

    // Touch end for mobile tap
    classIcon.addEventListener('touchend', function (e) {
        if (!dragStarted) {
            displayClass();
        }
        dragStarted = false; // Reset flag
        e.preventDefault();
    });

    // Mouse events for class icon
    classIcon.addEventListener('mousedown', startDrag);
    // Touch events for class icon
    classIcon.addEventListener('touchstart', startDrag);

    // Window dragging for class window
    const classTitleBar = classWindow.querySelector('.window-title-bar');
    let classWindowDragging = false;
    let classWindowOffsetX, classWindowOffsetY;

    function startClassWindowDrag(e) {
        classWindowDragging = true;
        const rect = classWindow.getBoundingClientRect();
        const coords = getClientCoords(e);
        classWindowOffsetX = coords.clientX - rect.left;
        classWindowOffsetY = coords.clientY - rect.top;
        e.preventDefault();
    }

    function moveClassWindowDrag(e) {
        if (classWindowDragging) {
            const coords = getClientCoords(e);
            classWindow.style.left = (coords.clientX - classWindowOffsetX) + 'px';
            classWindow.style.top = (coords.clientY - classWindowOffsetY) + 'px';
            e.preventDefault();
        }
    }

    function endClassWindowDrag(e) {
        classWindowDragging = false;
    }

    classTitleBar.addEventListener('mousedown', startClassWindowDrag);
    classTitleBar.addEventListener('touchstart', startClassWindowDrag);
    document.addEventListener('mousemove', moveClassWindowDrag);
    document.addEventListener('touchmove', moveClassWindowDrag);
    document.addEventListener('mouseup', endClassWindowDrag);
    document.addEventListener('touchend', endClassWindowDrag);

    // Close button touch support for class window
    const classCloseBtn = classWindow.querySelector('.window-close-btn');
    classCloseBtn.addEventListener('touchstart', function (e) {
        this.classList.add('pressed');
    });
    classCloseBtn.addEventListener('touchend', function (e) {
        this.classList.remove('pressed');
        const rect = this.getBoundingClientRect();
        const touch = e.changedTouches[0];
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            closeClassWindow();
        }
    });

    // Window resizing for class window
    classWindow.addEventListener('mousedown', function (e) { startResize(e, classWindow); });
    classWindow.addEventListener('touchstart', function (e) { startResize(e, classWindow); });
    classWindow.addEventListener('mousemove', function (e) { updateCursor(e, classWindow); });

    // Global resize events
    document.addEventListener('mousemove', moveResize);
    document.addEventListener('touchmove', moveResize);
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchend', endResize);
});
