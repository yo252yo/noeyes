// PIXI Application Setup - PIXI is loaded globally via script tag
import { setGameContainer, setPixiApp } from './target-base.js';

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
}
