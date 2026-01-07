// PIXI Application Setup - PIXI is loaded globally via script tag
import { activeTargets, setGameContainer, setPixiApp } from './target-base.js';

export function initializePixiApp() {
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

    setPixiApp(app);

    document.body.appendChild(app.view);

    app.view.style.position = 'fixed';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.pointerEvents = 'none'; // Start with none to allow buttons to work
    app.view.style.zIndex = '200';

    const container = new window.PIXI.Container();
    setGameContainer(container);
    app.stage.addChild(container);

    // Ensure Pixi stage and container can receive pointer events
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    app.stage.sortableChildren = true;

    container.interactive = false; // Don't let container consume events
    container.interactiveChildren = true; // Allow children to receive events

    // Manual click detection system - robust fallback for PIXI interactive system
    app.view.addEventListener('click', (event) => {
        const rect = app.view.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find the target that contains this click
        let targetFound = null;
        let minDistance = Infinity;

        activeTargets.forEach((target) => {
            if (!target.container || target.destroyed) return;

            const bounds = target.container.getBounds();
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
            // Simulate the click on the target
            const clickEvent = {
                global: { x, y }
            };
            targetFound.handleClick(clickEvent);
        }
    });

    // Handle resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    // Dynamically set pointer-events based on mouse position relative to targets
    window.addEventListener('mousemove', (event) => {
        const rect = app.view.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if mouse is over any active target
        let overTarget = false;
        for (const target of activeTargets) {
            if (!target.container || target.destroyed) continue;

            const bounds = target.container.getBounds();
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) {
                overTarget = true;
                break;
            }
        }

        // Set pointer-events based on whether mouse is over a target
        app.view.style.pointerEvents = overTarget ? 'auto' : 'none';
    });

    // Handle stage clicks - forward to HTML if no target found
    app.stage.on('pointerdown', (event) => {
        const x = event.global.x;
        const y = event.global.y;

        // Check if any active target was clicked
        const targetFound = activeTargets.find(target => {
            if (target.container && !target.destroyed) {
                const bounds = target.container.getBounds();
                return x >= bounds.x && x <= bounds.x + bounds.width &&
                    y >= bounds.y && y <= bounds.y + bounds.height;
            }
            return false;
        });

        if (targetFound) {
            // Target found - let the target handle it
            const clickEvent = {
                global: { x, y }
            };
            targetFound.handleClick(clickEvent);
        } else {
            // No target found - forward click to HTML elements below
            forwardClickToHTML(event);
        }
    });

    // Forward click to HTML elements when no target is found
    function forwardClickToHTML(originalEvent) {
        // Temporarily disable pointer events on canvas
        const canvas = app.view;
        const originalPointerEvents = canvas.style.pointerEvents;
        canvas.style.pointerEvents = 'none';

        // Use elementFromPoint to find what HTML element would receive the click
        const targetElement = document.elementFromPoint(
            originalEvent.data.global.x,
            originalEvent.data.global.y
        );

        // Restore pointer events immediately
        canvas.style.pointerEvents = originalPointerEvents;

        // If we found an HTML element and it's not the canvas itself, forward the click
        if (targetElement && targetElement !== canvas && targetElement !== document.body) {
            // Create a new click event and dispatch it to the target element
            const forwardedEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: originalEvent.data.global.x,
                clientY: originalEvent.data.global.y
            });
            targetElement.dispatchEvent(forwardedEvent);
        }
    }
}
