// Shared JavaScript file

console.log("Script loaded");

function callItADay() {
    alert("WIP");
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
    function toggleDiary() {
        if (diaryWindow.style.display === 'none' || diaryWindow.style.display === '') {
            diaryWindow.style.display = 'block';
        } else {
            diaryWindow.style.display = 'none';
        }
    }

    // Click for desktop
    diaryIcon.addEventListener('click', function () {
        if (!dragStarted) {
            toggleDiary();
        }
        dragStarted = false; // Reset flag
    });

    // Touch end for mobile tap
    diaryIcon.addEventListener('touchend', function (e) {
        if (!dragStarted) {
            toggleDiary();
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
});
