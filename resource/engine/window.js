// Simple PIXI engine that draws screen border
import { DEBUG } from './config.js';
import { TARGETS_LIST } from './target.js';

export function initializeEngine() {
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

    document.body.appendChild(app.view);
    app.view.style.position = 'fixed';
    app.view.style.top = '0';
    app.view.style.left = '0';
    app.view.style.pointerEvents = 'none';
    app.view.style.zIndex = '100';

    const graphics = new window.PIXI.Graphics();
    app.stage.addChild(graphics);

    function drawBorder() {
        graphics.clear();
        if (DEBUG) {
            graphics.lineStyle(3, 0xff0000, 1);
            graphics.drawRect(1, 1, document.documentElement.clientWidth - 2, document.documentElement.clientHeight - 2);
        }
    }

    function findTargetAtPosition(x, y) {
        let targetFound = null;
        let minDistance = Infinity;

        TARGETS_LIST.forEach((target) => {
            if (!target.graphics) return;
            const bounds = target.graphics.getBounds();
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const tolerance = 20;
            const withinBounds = x >= bounds.x - tolerance && x <= bounds.x + bounds.width + tolerance &&
                y >= bounds.y - tolerance && y <= bounds.y + bounds.height + tolerance;
            if (withinBounds && distance < minDistance) {
                minDistance = distance;
                targetFound = target;
            }
        });
        return targetFound;
    }

    let touchHandled = false;

    document.addEventListener('click', (event) => {
        if (touchHandled) {
            touchHandled = false;
            return;
        }
        const target = findTargetAtPosition(event.clientX, event.clientY);
        if (target) {
            event.preventDefault();
            event.stopPropagation();
            target.click();
        }
    });

    document.addEventListener('touchstart', (event) => {
        if (event.changedTouches.length > 0) {
            const touch = event.changedTouches[0];
            const target = findTargetAtPosition(touch.clientX, touch.clientY);
            if (target) {
                touchHandled = true;
                target.click();
            }
        }
    }, { passive: false });

    drawBorder();

    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        drawBorder();
    });

    return app;
}
