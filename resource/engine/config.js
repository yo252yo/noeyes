// Engine configuration
export const DEBUG = false;

// Target types enum
export const TARGET_TYPES = {
    EMPTY: 'empty',
    EMOJI: 'emoji',
    AVATAR: 'avatar',
    USERNAME: 'username'
};

// Mutable target count
export let NUM_TARGETS = 0;

// Function to decrease target count
export function decreaseNumTargets(amount = 1) {
    NUM_TARGETS = Math.max(0, NUM_TARGETS - amount);
}

// Function to set target count
export function setNumTargets(value) {
    NUM_TARGETS = Math.max(0, value);
}
