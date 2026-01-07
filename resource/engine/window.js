// Simple PIXI engine that draws screen border
import { DEBUG } from './config.js';
import { TARGETS_LIST } from './target.js';

export function initializeEngine() {
    // Create PIXI application
    const app = new window.PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window
    });

    // Add canvas to body
    document.body.appendChild(app.view);
    app.view.style.position = 'fixed';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.pointerEvents = 'none'; // Start with none to allow buttons to work
    app.view.style.zIndex = '100';

    // Create graphics for border
    const graphics = new window.PIXI.Graphics();
    app.stage.addChild(graphics);

    // Function to draw border
    function drawBorder() {
        graphics.clear();
        if (DEBUG) {
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;
            graphics.lineStyle(3, 0xff0000, 1); // Red 3px line
            graphics.drawRect(1, 1, clientWidth - 2, clientHeight - 2);
        }
    }

    // Manual click detection system - compatible with touch and mouse
    let touchHandled = false;

    app.view.addEventListener('click', (event) => {
        // Skip click events that follow touch events to prevent double-counting
        if (touchHandled) {
            touchHandled = false;
            return;
        }

        const rect = app.view.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find the target that contains this click
        let targetFound = null;
        let minDistance = Infinity;

        TARGETS_LIST.forEach((target) => {
            if (!target.graphics) return;

            const bounds = target.graphics.getBounds();
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

            // Check if click is within bounds with some tolerance
            const tolerance = 20;
            const withinBounds = x >= bounds.x - tolerance &&
                x <= bounds.x + bounds.width + tolerance &&
                y >= bounds.y - tolerance &&
                y <= bounds.y + bounds.height + tolerance;

            if (withinBounds && distance < minDistance) {
                minDistance = distance;
                targetFound = target;
            }
        });

        if (targetFound) {
            // Call the target's click method
            targetFound.click();
        }
    });

    // Handle touch events for mobile compatibility
    app.view.addEventListener('touchstart', (event) => {
        // Prevent default to avoid scrolling/zooming
        event.preventDefault();

        if (event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            const rect = app.view.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            // Find the target that contains this touch
            let targetFound = null;
            let minDistance = Infinity;

            TARGETS_LIST.forEach((target) => {
                if (!target.graphics) return;

                const bounds = target.graphics.getBounds();
                const centerX = bounds.x + bounds.width / 2;
                const centerY = bounds.y + bounds.height / 2;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

                // Check if touch is within bounds with some tolerance
                const tolerance = 20;
                const withinBounds = x >= bounds.x - tolerance &&
                    x <= bounds.x + bounds.width + tolerance &&
                    y >= bounds.y - tolerance &&
                    y <= bounds.y + bounds.height + tolerance;

                if (withinBounds && distance < minDistance) {
                    minDistance = distance;
                    targetFound = target;
                }
            });

            if (targetFound) {
                // Set flag to prevent double-counting with click event
                touchHandled = true;
                // Call the target's click method
                targetFound.click();
            }
        }
    }, { passive: false });

    // Dynamically set pointer-events based on mouse/touch position relative to targets
    function updatePointerEvents(event) {
        const rect = app.view.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if mouse/touch is over any active target
        let overTarget = false;
        for (const target of TARGETS_LIST) {
            if (!target.graphics) continue;

            const bounds = target.graphics.getBounds();
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) {
                overTarget = true;
                break;
            }
        }

        // Set pointer-events based on whether mouse/touch is over a target
        app.view.style.pointerEvents = overTarget ? 'auto' : 'none';
    }

    window.addEventListener('mousemove', updatePointerEvents);
    window.addEventListener('touchmove', (event) => {
        if (event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            updatePointerEvents({ clientX: touch.clientX, clientY: touch.clientY });
        }
    });

    // Initial setup
    drawBorder();

    // Handle resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        drawBorder();
    });

    return app;
}
