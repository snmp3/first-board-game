// Константы для игры
export const GAME_CONFIG = {
    maxPlayers: 4,
    boardSize: 120,
    winPosition: 119
};

export const SCREENS = {
    MENU: 'menu',
    GAME: 'game'
};

export const BOT_DIFFICULTY = {
    easy: {
        correctChance: 0.3,
        thinkTime: 1000
    },
    medium: {
        correctChance: 0.6,
        thinkTime: 1500
    },
    hard: {
        correctChance: 0.9,
        thinkTime: 2000
    }
};

// ИСПРАВЛЕННЫЕ данные прыжков - должны совпадать с CanvasRenderer
export const JUMP_CELLS = {
    // Лестницы (вверх) - точно как в CanvasRenderer.js
    4: 14,   // лестница с 4 на 14
    9: 31,   // лестница с 9 на 31
    21: 42,  // лестница с 21 на 42
    28: 84,  // лестница с 28 на 84
    36: 44,  // лестница с 36 на 44
    51: 67,  // лестница с 51 на 67
    71: 91,  // лестница с 71 на 91
    80: 100, // лестница с 80 на 100
    
    // Змеи (вниз) - точно как в CanvasRenderer.js
    16: 6,   // змея с 16 на 6
    47: 26,  // змея с 47 на 26
    49: 11,  // змея с 49 на 11
    56: 53,  // змея с 56 на 53
    62: 19,  // змея с 62 на 19
    64: 60,  // змея с 64 на 60
    87: 24,  // змея с 87 на 24
    93: 73,  // змея с 93 на 73
    95: 75,  // змея с 95 на 75
    98: 78   // змея с 98 на 78
};

// Предметы по умолчанию
export const DEFAULT_SUBJECTS = ['math', 'russian'];

// Цвета игроков
export const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

// Настройки игрового поля
export const BOARD_CONFIG = {
    rows: 10,
    columns: 12,
    cellSize: 50
};
