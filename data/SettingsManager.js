export class SettingsManager {
    constructor() {
        this.storageKey = 'adventure-game-settings';
        this.defaultSettings = {
            selectedThemes: ['math', 'geography'],
            botDifficulty: 'medium',
            soundEnabled: true,
            animationsEnabled: true,
            lastPlayerNames: [],
            gameHistory: [],
            preferences: {
                autoSave: true,
                confirmReset: true,
                showHints: true,
                quickStart: false
            }
        };
        this.currentSettings = { ...this.defaultSettings };
        this.initialized = false;
    }

    initialize() {
        this.loadSettings();
        this.initialized = true;
        console.log('SettingsManager инициализирован');
        return true;
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsedSettings = JSON.parse(stored);
                this.currentSettings = this.mergeSettings(this.defaultSettings, parsedSettings);
            }
            return true;
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            this.currentSettings = { ...this.defaultSettings };
            return false;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentSettings));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            return false;
        }
    }

    mergeSettings(defaults, stored) {
        const merged = { ...defaults };
        
        for (const [key, value] of Object.entries(stored)) {
            if (key in defaults) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    merged[key] = { ...defaults[key], ...value };
                } else {
                    merged[key] = value;
                }
            }
        }
        
        return merged;
    }

    get(settingPath) {
        const keys = settingPath.split('.');
        let current = this.currentSettings;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    set(settingPath, value) {
        const keys = settingPath.split('.');
        const lastKey = keys.pop();
        let current = this.currentSettings;
        
        // Создаем путь если его нет
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
        
        if (this.initialized) {
            this.saveSettings();
        }
        
        return true;
    }

    // Методы для работы с конкретными настройками
    getSelectedThemes() {
        return this.get('selectedThemes') || [];
    }

    setSelectedThemes(themes) {
        return this.set('selectedThemes', themes);
    }

    getBotDifficulty() {
        return this.get('botDifficulty') || 'medium';
    }

    setBotDifficulty(difficulty) {
        return this.set('botDifficulty', difficulty);
    }

    isSoundEnabled() {
        return this.get('soundEnabled') !== false;
    }

    setSoundEnabled(enabled) {
        return this.set('soundEnabled', enabled);
    }

    areAnimationsEnabled() {
        return this.get('animationsEnabled') !== false;
    }

    setAnimationsEnabled(enabled) {
        return this.set('animationsEnabled', enabled);
    }

    // Управление историей имен игроков
    getLastPlayerNames() {
        return this.get('lastPlayerNames') || [];
    }

    addPlayerName(name) {
        const names = this.getLastPlayerNames();
        const filteredNames = names.filter(n => n !== name);
        filteredNames.unshift(name);
        
        // Ограничиваем до 10 имен
        const limitedNames = filteredNames.slice(0, 10);
        return this.set('lastPlayerNames', limitedNames);
    }

    clearPlayerNames() {
        return this.set('lastPlayerNames', []);
    }

    // Управление историей игр
    getGameHistory() {
        return this.get('gameHistory') || [];
    }

    addGameResult(result) {
        const history = this.getGameHistory();
        const gameResult = {
            ...result,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        history.unshift(gameResult);
        
        // Ограничиваем до 50 записей
        const limitedHistory = history.slice(0, 50);
        return this.set('gameHistory', limitedHistory);
    }

    clearGameHistory() {
        return this.set('gameHistory', []);
    }

    getGameStats() {
        const history = this.getGameHistory();
        
        if (history.length === 0) {
            return {
                totalGames: 0,
                averageAccuracy: 0,
                favoriteTheme: null,
                totalPlayTime: 0
            };
        }

        const totalGames = history.length;
        const totalAccuracy = history.reduce((sum, game) => sum + (game.accuracy || 0), 0);
        const averageAccuracy = Math.round(totalAccuracy / totalGames);
        
        // Подсчет популярных тем
        const themeCount = {};
        history.forEach(game => {
            if (game.themes) {
                game.themes.forEach(theme => {
                    themeCount[theme] = (themeCount[theme] || 0) + 1;
                });
            }
        });
        
        const favoriteTheme = Object.keys(themeCount).reduce((a, b) => 
            themeCount[a] > themeCount[b] ? a : b, null
        );
        
        const totalPlayTime = history.reduce((sum, game) => 
            sum + (game.duration || 0), 0
        );

        return {
            totalGames,
            averageAccuracy,
            favoriteTheme,
            totalPlayTime
        };
    }

    // Управление предпочтениями
    getPreference(key) {
        return this.get(`preferences.${key}`);
    }

    setPreference(key, value) {
        return this.set(`preferences.${key}`, value);
    }

    // Экспорт и импорт настроек
    exportSettings() {
        return JSON.stringify(this.currentSettings, null, 2);
    }

    importSettings(settingsJson) {
        try {
            const imported = JSON.parse(settingsJson);
            this.currentSettings = this.mergeSettings(this.defaultSettings, imported);
            return this.saveSettings();
        } catch (error) {
            console.error('Ошибка импорта настроек:', error);
            return false;
        }
    }

    resetSettings() {
        this.currentSettings = { ...this.defaultSettings };
        return this.saveSettings();
    }

    resetToDefaults() {
        if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
            return this.resetSettings();
        }
        return false;
    }

    // Проверка поддержки localStorage
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    // Очистка всех данных
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.currentSettings = { ...this.defaultSettings };
            return true;
        } catch (error) {
            console.error('Ошибка очистки данных:', error);
            return false;
        }
    }

    // Получение размера сохраненных данных
    getStorageSize() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? new Blob([data]).size : 0;
        } catch {
            return 0;
        }
    }
}

