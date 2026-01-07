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
    app.view.style.pointerEvents = 'auto';
    app.view.style.zIndex = '50';

    const container = new window.PIXI.Container();
    setGameContainer(container);
    app.stage.addChild(container);

    // Ensure Pixi stage and container can receive pointer events
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    app.stage.sortableChildren = true;

    container.interactive = false; // Don't let container consume events
    container.interactiveChildren = true; // Allow children to receive events

    // Handle resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
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
