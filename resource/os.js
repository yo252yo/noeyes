
function closeDiaryWindow() {
    document.getElementById('diary-window').style.display = 'none';
}

function closeClassWindow() {
    document.getElementById('class-window').style.display = 'none';
}

function closeFarmWindow() {
    document.getElementById('farm-window').style.display = 'none';
}

function closeHiveWindow() {
    document.getElementById('hive-window').style.display = 'none';
}

function updateFarmIconVisibility() {
    const farmIcon = document.getElementById('farm-icon');
    if (farmIcon) {
        const currentDay = getDay();
        farmIcon.style.display = currentDay >= 3 ? 'block' : 'none';
    }
}

function updateHiveIconVisibility() {
    const hiveIcon = document.getElementById('hive-icon');
    if (hiveIcon) {
        const currentDay = getDay();
        hiveIcon.style.display = currentDay >= 4 ? 'block' : 'none';
    }
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
        this.startX = 0;
        this.startY = 0;
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
        this.startX = coords.clientX;
        this.startY = coords.clientY;
        this.offsetX = coords.clientX - this.iconElement.offsetLeft;
        this.offsetY = coords.clientY - this.iconElement.offsetTop;
        this.iconElement.style.cursor = 'grabbing';
        e.preventDefault();
    }

    moveDrag(e) {
        if (this.isDragging) {
            const coords = this.getClientCoords(e);
            const deltaX = coords.clientX - this.startX;
            const deltaY = coords.clientY - this.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Only start dragging if moved more than 5 pixels
            if (distance > 5) {
                this.dragStarted = true;
                this.iconElement.style.left = (coords.clientX - this.offsetX) + 'px';
                this.iconElement.style.top = (coords.clientY - this.offsetY) + 'px';
            }
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
        if (!this.iconElement) return; // Prevent errors if element doesn't exist

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
        // Update interaction timestamp when dragging starts
        windowZIndexManager.updateInteraction(this.windowElement);
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

// Window Z-Index Manager
class WindowZIndexManager {
    constructor() {
        this.windows = new Map(); // window element -> last interaction timestamp
        this.baseZIndex = 1000;
    }

    registerWindow(windowElement) {
        this.windows.set(windowElement, 0);
        this.updateZIndices();
    }

    updateInteraction(windowElement) {
        const now = Date.now();
        this.windows.set(windowElement, now);
        this.updateZIndices();
    }

    updateZIndices() {
        // Sort windows by last interaction time (most recent first), but only consider visible windows
        const visibleWindows = Array.from(this.windows.entries())
            .filter(([windowElement]) => windowElement.style.display !== 'none')
            .sort((a, b) => a[1] - b[1]);

        // Assign z-index starting from baseZIndex, incrementing for each visible window
        visibleWindows.forEach(([windowElement, timestamp], index) => {
            windowElement.style.zIndex = this.baseZIndex + index;
        });
    }

    unregisterWindow(windowElement) {
        this.windows.delete(windowElement);
        this.updateZIndices();
    }
}

// Global Z-Index Manager instance
const windowZIndexManager = new WindowZIndexManager();

// Global resize variables
let isResizing = false;
let resizeDirection = '';
let resizeWindow = null;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let startLeft = 0;
let startTop = 0;
const RESIZE_LEEWAY = 10; // pixels of leeway for border detection

function getResizeDirection(e, windowElement) {
    const rect = windowElement.getBoundingClientRect();
    const coords = e.touches && e.touches.length > 0 ?
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } :
        { clientX: e.clientX, clientY: e.clientY };

    const x = coords.clientX - rect.left;
    const y = coords.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    let direction = '';

    // Check corners first (they take priority) - exclude top corners
    if (x <= RESIZE_LEEWAY && y >= h - RESIZE_LEEWAY) {
        direction = 'sw'; // southwest
    } else if (x >= w - RESIZE_LEEWAY && y >= h - RESIZE_LEEWAY) {
        direction = 'se'; // southeast
    }
    // Check edges - exclude top edge
    else if (x <= RESIZE_LEEWAY) {
        direction = 'w'; // west (left)
    } else if (x >= w - RESIZE_LEEWAY) {
        direction = 'e'; // east (right)
    } else if (y >= h - RESIZE_LEEWAY) {
        direction = 's'; // south (bottom)
    }

    return direction;
}

function updateCursor(e, windowElement) {
    if (isResizing) return;

    const direction = getResizeDirection(e, windowElement);
    let cursor = 'default';

    switch (direction) {
        case 'se':
            cursor = 'nw-resize';
            break;
        case 'sw':
            cursor = 'ne-resize';
            break;
        case 's':
            cursor = 'ns-resize';
            break;
        case 'w':
        case 'e':
            cursor = 'ew-resize';
            break;
    }

    // Reset cursor to default if not over a resize area
    if (direction === '') {
        cursor = 'default';
    }

    windowElement.style.cursor = cursor;
}

function startResize(e, windowElement) {
    const direction = getResizeDirection(e, windowElement);
    if (!direction) return;

    isResizing = true;
    resizeDirection = direction;
    resizeWindow = windowElement;

    // Update interaction timestamp when resizing starts
    windowZIndexManager.updateInteraction(windowElement);

    const coords = e.touches && e.touches.length > 0 ?
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } :
        { clientX: e.clientX, clientY: e.clientY };

    startX = coords.clientX;
    startY = coords.clientY;

    const rect = windowElement.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;

    // Disable pointer events on iframe during resize to allow proper event handling
    const iframe = windowElement.querySelector('.window-content iframe');
    if (iframe) {
        iframe.style.pointerEvents = 'none';
    }

    e.preventDefault();
    document.addEventListener('mousemove', doResize);
    document.addEventListener('touchmove', doResize);
}

function doResize(e) {
    if (!isResizing || !resizeWindow) return;

    const coords = e.touches && e.touches.length > 0 ?
        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY } :
        { clientX: e.clientX, clientY: e.clientY };

    const deltaX = coords.clientX - startX;
    const deltaY = coords.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    const minWidth = 200;
    const minHeight = 150;

    // Handle horizontal resizing
    if (resizeDirection.includes('w')) { // west/left
        newWidth = startWidth - deltaX;
        newLeft = startLeft + deltaX;
        if (newWidth < minWidth) {
            newWidth = minWidth;
            newLeft = startLeft + (startWidth - minWidth);
        }
    } else if (resizeDirection.includes('e')) { // east/right
        newWidth = startWidth + deltaX;
        if (newWidth < minWidth) newWidth = minWidth;
    }

    // Handle vertical resizing
    if (resizeDirection.includes('n')) { // north/top
        newHeight = startHeight - deltaY;
        newTop = startTop + deltaY;
        if (newHeight < minHeight) {
            newHeight = minHeight;
            newTop = startTop + (startHeight - minHeight);
        }
    } else if (resizeDirection.includes('s')) { // south/bottom
        newHeight = startHeight + deltaY;
        if (newHeight < minHeight) newHeight = minHeight;
    }

    // Apply the changes
    resizeWindow.style.width = newWidth + 'px';
    resizeWindow.style.height = newHeight + 'px';
    if (newLeft !== startLeft) resizeWindow.style.left = newLeft + 'px';
    if (newTop !== startTop) resizeWindow.style.top = newTop + 'px';

    e.preventDefault();
}

function endResize(e) {
    if (isResizing) {
        // Re-enable pointer events on iframe after resize
        const iframe = resizeWindow.querySelector('.window-content iframe');
        if (iframe) {
            iframe.style.pointerEvents = '';
        }

        isResizing = false;
        resizeDirection = '';
        resizeWindow = null;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('touchmove', doResize);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize day display
    updateDayDisplay();

    // Initialize time display and start real-time updates
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);

    const diaryIcon = document.getElementById('diary-icon');
    const diaryWindow = document.getElementById('diary-window');
    const classIcon = document.getElementById('class-icon');
    const classWindow = document.getElementById('class-window');
    const farmIcon = document.getElementById('farm-icon');
    const farmWindow = document.getElementById('farm-window');
    const hiveIcon = document.getElementById('hive-icon');
    const hiveWindow = document.getElementById('hive-window');

    // Register windows with z-index manager
    windowZIndexManager.registerWindow(diaryWindow);
    windowZIndexManager.registerWindow(classWindow);
    windowZIndexManager.registerWindow(farmWindow);
    windowZIndexManager.registerWindow(hiveWindow);

    // Toggle functions
    function displayDiary() {
        diaryWindow.style.display = 'block';
        // Update interaction when opening window
        windowZIndexManager.updateInteraction(diaryWindow);
    }

    function displayClass() {
        classWindow.style.display = 'block';
        // Update interaction when opening window
        windowZIndexManager.updateInteraction(classWindow);
    }

    function displayFarm() {
        farmWindow.style.display = 'block';
        // Update interaction when opening window
        windowZIndexManager.updateInteraction(farmWindow);
    }

    function displayHive() {
        hiveWindow.style.display = 'block';
        // Update interaction when opening window
        windowZIndexManager.updateInteraction(hiveWindow);
    }

    // Add click event listeners to window content areas for interaction tracking
    diaryWindow.addEventListener('mousedown', () => windowZIndexManager.updateInteraction(diaryWindow));
    diaryWindow.addEventListener('touchstart', () => windowZIndexManager.updateInteraction(diaryWindow));
    classWindow.addEventListener('mousedown', () => windowZIndexManager.updateInteraction(classWindow));
    classWindow.addEventListener('touchstart', () => windowZIndexManager.updateInteraction(classWindow));
    farmWindow.addEventListener('mousedown', () => windowZIndexManager.updateInteraction(farmWindow));
    farmWindow.addEventListener('touchstart', () => windowZIndexManager.updateInteraction(farmWindow));
    hiveWindow.addEventListener('mousedown', () => windowZIndexManager.updateInteraction(hiveWindow));
    hiveWindow.addEventListener('touchstart', () => windowZIndexManager.updateInteraction(hiveWindow));

    // Instantiate icon draggers
    const diaryIconDragger = new IconDragger(diaryIcon, displayDiary);
    const classIconDragger = new IconDragger(classIcon, displayClass);
    const farmIconDragger = new IconDragger(farmIcon, displayFarm);
    const hiveIconDragger = new IconDragger(hiveIcon, displayHive);

    // Instantiate window draggers
    const diaryWindowDragger = new WindowDragger(diaryWindow);
    const classWindowDragger = new WindowDragger(classWindow);
    const farmWindowDragger = new WindowDragger(farmWindow);
    const hiveWindowDragger = new WindowDragger(hiveWindow);

    // Instantiate close button handlers
    const diaryCloseBtn = diaryWindow.querySelector('.window-close-btn');
    const classCloseBtn = classWindow.querySelector('.window-close-btn');
    const farmCloseBtn = farmWindow.querySelector('.window-close-btn');
    const hiveCloseBtn = hiveWindow.querySelector('.window-close-btn');
    const diaryCloseHandler = new CloseButtonHandler(diaryCloseBtn, closeDiaryWindow);
    const classCloseHandler = new CloseButtonHandler(classCloseBtn, closeClassWindow);
    const farmCloseHandler = new CloseButtonHandler(farmCloseBtn, closeFarmWindow);
    const hiveCloseHandler = new CloseButtonHandler(hiveCloseBtn, closeHiveWindow);

    // Window resizing
    diaryWindow.addEventListener('mousedown', function (e) { startResize(e, diaryWindow); });
    diaryWindow.addEventListener('touchstart', function (e) { startResize(e, diaryWindow); });
    diaryWindow.addEventListener('mousemove', function (e) { updateCursor(e, diaryWindow); });

    classWindow.addEventListener('mousedown', function (e) { startResize(e, classWindow); });
    classWindow.addEventListener('touchstart', function (e) { startResize(e, classWindow); });
    classWindow.addEventListener('mousemove', function (e) { updateCursor(e, classWindow); });

    farmWindow.addEventListener('mousedown', function (e) { startResize(e, farmWindow); });
    farmWindow.addEventListener('touchstart', function (e) { startResize(e, farmWindow); });
    farmWindow.addEventListener('mousemove', function (e) { updateCursor(e, farmWindow); });

    hiveWindow.addEventListener('mousedown', function (e) { startResize(e, hiveWindow); });
    hiveWindow.addEventListener('touchstart', function (e) { startResize(e, hiveWindow); });
    hiveWindow.addEventListener('mousemove', function (e) { updateCursor(e, hiveWindow); });

    // Global resize events
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchend', endResize);

    // Initialize farm icon visibility
    updateFarmIconVisibility();
    // Initialize hive icon visibility
    updateHiveIconVisibility();
});
