// Simple PIXI engine that draws screen border
import { DEBUG } from './config.js';

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
    app.view.style.pointerEvents = 'none';
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

    // Initial setup
    drawBorder();

    // Handle resize
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        drawBorder();
    });

    return app;
}
