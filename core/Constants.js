export const GAME_CONFIG = {
    boardSize: 120,
    canvasWidth: 800,
    canvasHeight: 600,
    cellsPerRow: 12,
    cellSize: 60,
    playerSize: 20
};

export const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

export const JUMP_CELLS = {
    7: 14,
    15: 26,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    62: 19,
    64: 60,
    71: 91,
    78: 98,
    87: 94,
    92: 88,
    95: 75,
    99: 80
};

export const BOT_DIFFICULTY = {
    easy: { correctChance: 0.3, thinkTime: 2000 },
    medium: { correctChance: 0.6, thinkTime: 1500 },
    hard: { correctChance: 0.9, thinkTime: 1000 }
};

export const SCREENS = {
    MENU: 'menu',
    SETTINGS: 'settings', 
    GAME: 'game',
    RESULTS: 'results'
};

