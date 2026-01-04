// Twitch-style username generator using chunk mixing

const chunks = {
    prefixes: ['xX', 'lil', 'big', 'pro', 'not', 'real', 'the', 'mr', 'its'],
    starts: ['shadow', 'dark', 'fire', 'ice', 'toxic', 'epic', 'mega', 'super', 'ultra', 'ninja', 'dragon', 'ghost', 'cyber', 'pixel', 'dank', 'poggers', 'based', 'cursed'],
    middles: ['gamer', 'lord', 'king', 'god', 'boi', 'slayer', 'master', 'killer', 'hunter', 'legend', 'pro', 'noob', 'chad', 'memer'],
    ends: ['420', '69', '2000', 'ttv', 'yt', 'tv', 'live', 'gg', 'xd', 'lol', 'uwu'],
    suffixes: ['Xx', 'Jr', 'Sr', 'III', '_']
};

// Simple rules for combining chunks believably
const patterns = [
    // Classic patterns
    (c) => pick(c.starts) + pick(c.middles),
    (c) => pick(c.starts) + pick(c.middles) + pick(c.ends),
    (c) => pick(c.prefixes) + pick(c.starts) + pick(c.middles),

    // With numbers/suffixes
    (c) => pick(c.starts) + pick(c.ends),
    (c) => pick(c.prefixes) + pick(c.starts) + pick(c.suffixes),

    // Symmetric patterns (xX...Xx style)
    (c) => 'xX' + pick(c.starts) + pick(c.middles) + 'Xx',
    (c) => pick(c.prefixes) + pick(c.starts) + pick(c.ends),

    // Simple combos
    (c) => pick(c.starts) + pick(c.starts),
    (c) => pick(c.middles) + pick(c.ends),
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateTwitchUsername() {
    const pattern = pick(patterns);
    return pattern(chunks);
}

export function generateMultiple(count = 10) {
    const usernames = [];
    for (let i = 0; i < count; i++) {
        usernames.push(generateTwitchUsername());
    }
    return usernames;
}
