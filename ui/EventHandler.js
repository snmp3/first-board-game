export class EventHandler {
    constructor(game) {
        this.game = game;
        this.boundHandlers = new Map();
        this.initialized = false;
    }

    setupEventListeners() {
        if (this.initialized) {
            console.warn('EventHandler уже инициализирован');
            return;
        }

        this.setupMenuEvents();
        this.setupGameEvents();
        this.setupModalEvents();
        this.setupKeyboardEvents();
        
        this.initialized = true;
        console.log('EventHandler настроен');
    }

    setupMenuEvents() {
        // Добавление игрока
        this.addEventHandler('add-player', 'click', () => {
            const nameInput = document.getElementById('player-name');
            const name = nameInput ? nameInput.value.trim() : '';
            
            if (name) {
                this.game.addPlayer(name, false);
                nameInput.value = '';
            } else {
                alert('Введите имя игрока!');
            }
        });

        // Добавление бота
        this.addEventHandler('add-bot', 'click', () => {
            const botNameInput = document.getElementById('bot-name');
            const difficultySelect = document.getElementById('bot-difficulty');
            
            const name = botNameInput ? botNameInput.value.trim() || 'Бот' : 'Бот';
            const difficulty = difficultySelect ? difficultySelect.value : 'medium';
            
            this.game.addPlayer(name, true, difficulty);
            
            if (botNameInput) botNameInput.value = '';
        });

        // Начало игры
        this.addEventHandler('start-game', 'click', () => {
            const selectedThemes = this.getSelectedThemes();
            this.game.updateThemes(selectedThemes);
            this.game.startGame();
        });

        // Сброс игры
        this.addEventHandler('reset-game', 'click', () => {
            if (confirm('Вы уверены, что хотите сбросить всё?')) {
                this.game.resetGame();
            }
        });

        // Изменение тем
        this.setupThemeCheckboxes();

        // Enter в поле имени игрока
        this.addEventHandler('player-name', 'keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('add-player')?.click();
            }
        });
    }

    setupGameEvents() {
        // Бросок кубика
        this.addEventHandler('roll-dice', 'click', () => {
            this.game.rollDice();
        });

        // Движение игрока
        this.addEventHandler('move-player', 'click', () => {
            this.game.moveCurrentPlayer();
        });

        // Возврат в главное меню
        this.addEventHandler('back-to-menu', 'click', () => {
            if (confirm('Вы уверены, что хотите вернуться в главное меню?')) {
                this.game.resetGame();
            }
        });
    }

    setupModalEvents() {
        // События модальных окон обрабатываются в ModalManager
        // Здесь только глобальные обработчики
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Глобальные горячие клавиши
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        if (confirm('Сбросить игру?')) {
                            this.game.resetGame();
                        }
                        break;
                }
            }

            // Пробел для броска кубика в игре
            if (e.code === 'Space' && this.game.screenManager.getCurrentScreen() === 'game') {
                e.preventDefault();
                const rollButton = document.getElementById('roll-dice');
                if (rollButton && !rollButton.disabled) {
                    rollButton.click();
                }
            }
        });
    }

    setupThemeCheckboxes() {
        const checkboxes = ['math', 'geography', 'history', 'biology', 'riddles'];
        
        checkboxes.forEach(theme => {
            this.addEventHandler(`theme-${theme}`, 'change', () => {
                this.updateStartButtonState();
            });
        });
    }

    getSelectedThemes() {
        const themes = [];
        const checkboxes = ['math', 'geography', 'history', 'biology', 'riddles'];
        
        checkboxes.forEach(theme => {
            const checkbox = document.getElementById(`theme-${theme}`);
            if (checkbox && checkbox.checked) {
                themes.push(theme);
            }
        });
        
        return themes;
    }

    updateStartButtonState() {
        const startButton = document.getElementById('start-game');
        if (!startButton) return;

        const hasPlayers = this.game.gameState.players.length > 0;
        const hasThemes = this.getSelectedThemes().length > 0;
        
        startButton.disabled = !hasPlayers || !hasThemes;
    }

    addEventHandler(elementId, eventType, handler) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Элемент ${elementId} не найден для события ${eventType}`);
            return false;
        }

        // Сохраняем ссылку на обработчик для возможности удаления
        const key = `${elementId}-${eventType}`;
        if (this.boundHandlers.has(key)) {
            this.removeEventHandler(elementId, eventType);
        }

        this.boundHandlers.set(key, handler);
        element.addEventListener(eventType, handler);
        
        return true;
    }

    removeEventHandler(elementId, eventType) {
        const element = document.getElementById(elementId);
        const key = `${elementId}-${eventType}`;
        
        if (element && this.boundHandlers.has(key)) {
            const handler = this.boundHandlers.get(key);
            element.removeEventListener(eventType, handler);
            this.boundHandlers.delete(key);
            return true;
        }
        
        return false;
    }

    // Методы для обновления состояния UI
    updatePlayersList() {
        this.updateStartButtonState();
    }

    updateGameControls(currentPlayer, diceValue) {
        const rollButton = document.getElementById('roll-dice');
        const moveButton = document.getElementById('move-player');
        
        if (rollButton && moveButton) {
            if (currentPlayer && currentPlayer.isBot) {
                rollButton.disabled = true;
                moveButton.disabled = true;
            } else {
                rollButton.disabled = !!diceValue;
                moveButton.disabled = !diceValue;
            }
        }
    }

    cleanup() {
        // Удаляем все обработчики событий
        this.boundHandlers.forEach((handler, key) => {
            const [elementId, eventType] = key.split('-');
            this.removeEventHandler(elementId, eventType);
        });
        
        this.boundHandlers.clear();
        this.initialized = false;
        
        console.log('EventHandler очищен');
    }
}

