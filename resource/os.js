
function closeDiaryWindow() {
    document.getElementById('diary-window').style.display = 'none';
}

function closeClassWindow() {
    document.getElementById('class-window').style.display = 'none';
}

// Shared Icon Dragger Class
class IconDragger {
    constructor(iconElement, onClick) {
        this.iconElement = iconElement;
        this.onClick = onClick;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.dragStarted = false;
        this.init();
    }

    getClientCoords(e) {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    }

    startDrag(e) {
        this.isDragging = true;
        this.dragStarted = false;
        const coords = this.getClientCoords(e);
        this.offsetX = coords.clientX - this.iconElement.offsetLeft;
        this.offsetY = coords.clientY - this.iconElement.offsetTop;
        this.iconElement.style.cursor = 'grabbing';
        e.preventDefault();
    }

    moveDrag(e) {
        if (this.isDragging) {
            this.dragStarted = true;
            const coords = this.getClientCoords(e);
            this.iconElement.style.left = (coords.clientX - this.offsetX) + 'px';
            this.iconElement.style.top = (coords.clientY - this.offsetY) + 'px';
            e.preventDefault();
        }
    }

    endDrag(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.iconElement.style.cursor = 'pointer';
        }
    }

    handleClick(e) {
        if (!this.dragStarted) {
            this.onClick();
        }
        this.dragStarted = false;
    }

    handleTouchEnd(e) {
        if (!this.dragStarted) {
            this.onClick();
        }
        this.dragStarted = false;
        e.preventDefault();
    }

    init() {
        // Click and touch events
        this.iconElement.addEventListener('click', (e) => this.handleClick(e));
        this.iconElement.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Mouse events
        this.iconElement.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.moveDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));

        // Touch events
        this.iconElement.addEventListener('touchstart', (e) => this.startDrag(e));
        document.addEventListener('touchmove', (e) => this.moveDrag(e));
        document.addEventListener('touchend', (e) => this.endDrag(e));
    }
}

// Shared Window Dragger Class
class WindowDragger {
    constructor(windowElement) {
        this.windowElement = windowElement;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.titleBar = windowElement.querySelector('.window-title-bar');
        this.init();
    }

    getClientCoords(e) {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    }

    startDrag(e) {
        this.isDragging = true;
        const rect = this.windowElement.getBoundingClientRect();
        const coords = this.getClientCoords(e);
        this.offsetX = coords.clientX - rect.left;
        this.offsetY = coords.clientY - rect.top;
        e.preventDefault();
    }

    moveDrag(e) {
        if (this.isDragging) {
            const coords = this.getClientCoords(e);
            this.windowElement.style.left = (coords.clientX - this.offsetX) + 'px';
            this.windowElement.style.top = (coords.clientY - this.offsetY) + 'px';
            e.preventDefault();
        }
    }

    endDrag(e) {
        this.isDragging = false;
    }

    init() {
        // Mouse events
        this.titleBar.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.moveDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));

        // Touch events
        this.titleBar.addEventListener('touchstart', (e) => this.startDrag(e));
        document.addEventListener('touchmove', (e) => this.moveDrag(e));
        document.addEventListener('touchend', (e) => this.endDrag(e));
    }
}

// Shared Close Button Touch Handler
class CloseButtonHandler {
    constructor(closeButton, closeFunction) {
        this.closeButton = closeButton;
        this.closeFunction = closeFunction;
        this.init();
    }

    init() {
        this.closeButton.addEventListener('touchstart', (e) => {
            this.closeButton.classList.add('pressed');
        });

        this.closeButton.addEventListener('touchend', (e) => {
            this.closeButton.classList.remove('pressed');
            const rect = this.closeButton.getBoundingClientRect();
            const touch = e.changedTouches[0];
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                this.closeFunction();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const diaryIcon = document.getElementById('diary-icon');
    const diaryWindow = document.getElementById('diary-window');
    const classIcon = document.getElementById('class-icon');
    const classWindow = document.getElementById('class-window');

    // Toggle functions
    function displayDiary() {
        diaryWindow.style.display = 'block';
    }

    function displayClass() {
        classWindow.style.display = 'block';
    }

    // Instantiate icon draggers
    const diaryIconDragger = new IconDragger(diaryIcon, displayDiary);
    const classIconDragger = new IconDragger(classIcon, displayClass);

    // Instantiate window draggers
    const diaryWindowDragger = new WindowDragger(diaryWindow);
    const classWindowDragger = new WindowDragger(classWindow);

    // Instantiate close button handlers
    const diaryCloseBtn = diaryWindow.querySelector('.window-close-btn');
    const classCloseBtn = classWindow.querySelector('.window-close-btn');
    const diaryCloseHandler = new CloseButtonHandler(diaryCloseBtn, closeDiaryWindow);
    const classCloseHandler = new CloseButtonHandler(classCloseBtn, closeClassWindow);

    // Window resizing (keeping existing logic)
    diaryWindow.addEventListener('mousedown', function (e) { startResize(e, diaryWindow); });
    diaryWindow.addEventListener('touchstart', function (e) { startResize(e, diaryWindow); });
    diaryWindow.addEventListener('mousemove', function (e) { updateCursor(e, diaryWindow); });

    classWindow.addEventListener('mousedown', function (e) { startResize(e, classWindow); });
    classWindow.addEventListener('touchstart', function (e) { startResize(e, classWindow); });
    classWindow.addEventListener('mousemove', function (e) { updateCursor(e, classWindow); });

    // Global resize events
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchend', endResize);
});
