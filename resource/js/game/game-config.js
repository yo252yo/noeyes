// Configurable game settings - will be overridden by window.gameConfig
export let gameConfig = window.gameConfig || {
    targets: 'emoji', // 'emoji', 'avatar', or 'username'
    winScore: 5,
    fixedTargetNb: 10, // null for unlimited (emoji mode), number for avatar mode
    debugMode: false // Enable debug mode to show hitboxes and collision boundaries
};

export const emoji = ['👶', '👦', '👧', '👨', '👩', '🧑', '👴', '👵'];
export const borderColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'aqua', 'fuchsia'];

// Speed configuration variables for easy tweaking
export const min_speed_emoji = 1;
export const max_speed_emoji = 3;
export const min_speed_avatar = 1;
export const max_speed_avatar = 3;
export const min_speed_username = 0.2;
export const max_speed_username = 1;

// Threshold for text target collision detection (in pixels)
export const TEXT_TARGET_COLLISION_THRESHOLD = 40;
