export class EventHandler {
    constructor(game) {
        this.game = game;
        this.boundHandlers = new Map();
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 10;
        this.debug = true;
    }

    log(...args) {
        if (this.debug) {
            console.log('[EventHandler]', ...args);
        }
    }

    error(...args) {
        console.error('[EventHandler]', ...args);
    }

    setupEventListeners() {
        if (this.initialized) {
            this.log('EventHandler уже инициализирован');
            return true;
        }

        this.log('Настройка обработчиков событий...');
        
        // Многоуровневая проверка готовности
        if (document.readyState === 'loading') {
            this.log('DOM еще загружается, ждем...');
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeHandlers();
            });
        } else {
            this.initializeHandlers();
        }
        
        return true;
    }

    initializeHandlers() {
        this.log('Инициализация обработчиков...');
        
        // Проверяем наличие всех необходимых элементов
        const requiredElements = [
            'add-player', 'add-bot', 'start-game', 'reset-game',
            'player-name', 'bot-difficulty', 'bot-name'
        ];

        const missingElements = requiredElements.filter(id => {
            const element = document.getElementById(id);
            if (!element) {
                this.error(`Элемент ${id} не найден`);
                return true;
            }
            return false;
        });

        if (missingElements.length > 0) {
            this.error('Отсутствуют элементы:', missingElements);
            
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                this.log(`Попытка ${this.retryCount}/${this.maxRetries} через 200ms...`);
                setTimeout(() => this.initializeHandlers(), 200);
                return;
            } else {
                this.error('Превышено максимальное количество попыток инициализации');
                return;
            }
        }

        // Настраиваем обработчики
        try {
            this.setupMenuEvents();
            this.setupGameEvents();
            this.setupKeyboardEvents();
            this.setupThemeCheckboxes();
            
            this.initialized = true;
            this.log('✅ EventHandler настроен успешно');
            
            // Проверяем что обработчики действительно работают
            this.validateHandlers();
            
        } catch (error) {
            this.error('Ошибка при настройке обработчиков:', error);
        }
    }

    setupMenuEvents() {
        this.log('Настройка событий меню...');
        
        // Добавление игрока
        this.addEventHandler('add-player', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Останавливаем всплытие события
            
            this.log('🔥 Клик по кнопке добавления игрока (EventHandler)');
            
            const nameInput = document.getElementById('player-name');
            if (!nameInput) {
                this.error('Поле ввода имени игрока не найдено');
                return;
            }
            
            // ИСПРАВЛЕННАЯ логика получения значения
            const name = nameInput.value ? nameInput.value.trim() : '';
            this.log(`Получено имя из поля: "${name}" (длина: ${name.length})`);
            
            if (!name || name.length === 0) {
                this.log('❌ Имя пустое, показываем предупреждение');
                alert('Введите имя игрока!');
                nameInput.focus();
                return;
            }
            
            if (this.game.gameState.players.length >= 4) {
                alert('Максимум 4 игрока!');
                return;
            }
            
            try {
                const addedPlayer = this.game.addPlayer(name, false);
                if (addedPlayer) {
                    nameInput.value = ''; // Очищаем поле только при успешном добавлении
                    nameInput.focus();
                    this.updateStartButtonState();
                    this.log(`✅ Игрок "${name}" добавлен успешно`);
                } else {
                    this.log(`❌ Не удалось добавить игрока "${name}"`);
                }
            } catch (error) {
                this.error('Ошибка добавления игрока:', error);
                alert('Ошибка добавления игрока');
            }
        });

        // Добавление бота
        this.addEventHandler('add-bot', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Останавливаем всплытие события
            
            this.log('🤖 Клик по кнопке добавления бота (EventHandler)');
            
            const botNameInput = document.getElementById('bot-name');
            const difficultySelect = document.getElementById('bot-difficulty');
            
            if (!difficultySelect) {
                this.error('Селект сложности бота не найден');
                return;
            }
            
            // ИСПРАВЛЕННАЯ логика получения значений
            const botName = botNameInput && botNameInput.value ? botNameInput.value.trim() : '';
            const difficulty = difficultySelect.value || 'medium';
            
            // Если имя бота не введено, используем случайное имя
            const finalBotName = botName || this.generateBotName();
            
            this.log(`Данные бота: имя="${finalBotName}", сложность="${difficulty}"`);
            
            if (this.game.gameState.players.length >= 4) {
                alert('Максимум 4 игрока!');
                return;
            }
            
            try {
                const addedBot = this.game.addPlayer(finalBotName, true, difficulty);
                if (addedBot) {
                    if (botNameInput) {
                        botNameInput.value = ''; // Очищаем поле только при успешном добавлении
                    }
                    this.updateStartButtonState();
                    this.log(`✅ Бот "${finalBotName}" (${difficulty}) добавлен успешно`);
                } else {
                    this.log(`❌ Не удалось добавить бота "${finalBotName}"`);
                }
            } catch (error) {
                this.error('Ошибка добавления бота:', error);
                alert('Ошибка добавления бота');
            }
        });

        // Начало игры
        this.addEventHandler('start-game', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.log('🎮 Клик по кнопке начала игры (EventHandler)');
            
            if (this.game.gameState.players.length === 0) {
                alert('Добавьте игроков перед началом игры!');
                return;
            }
            
            const selectedThemes = this.getSelectedThemes();
            if (selectedThemes.length === 0) {
                alert('Выберите хотя бы одну тему вопросов!');
                return;
            }
            
            try {
                this.game.updateThemes(selectedThemes);
                this.game.startGame();
                this.log('✅ Игра начата');
            } catch (error) {
                this.error('Ошибка начала игры:', error);
                alert('Ошибка начала игры');
            }
        });

        // Сброс игры
        this.addEventHandler('reset-game', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.log('🔄 Клик по кнопке сброса игры (EventHandler)');
            
            if (confirm('Вы уверены, что хотите сбросить всё?')) {
                try {
                    this.game.resetGame();
                    this.updateStartButtonState();
                    this.log('✅ Игра сброшена');
                } catch (error) {
                    this.error('Ошибка сброса игры:', error);
                    alert('Ошибка сброса игры');
                }
            }
        });

        // Enter в поле имени игрока
        this.addEventHandler('player-name', 'keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const addButton = document.getElementById('add-player');
                if (addButton) {
                    this.log('Enter в поле имени игрока, имитируем клик');
                    addButton.click();
                }
            }
        });

        // Enter в поле имени бота
        this.addEventHandler('bot-name', 'keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const addBotButton = document.getElementById('add-bot');
                if (addBotButton) {
                    this.log('Enter в поле имени бота, имитируем клик');
                    addBotButton.click();
                }
            }
        });
    }

    // Генерация случайного имени для бота
    generateBotName() {
        const botNames = [
            'Робот', 'Андроид', 'Киборг', 'Дроид', 'Бот-2000',
            'Умник', 'Мыслитель', 'Вычислитель', 'Логик', 'Аналитик'
        ];
        const randomIndex = Math.floor(Math.random() * botNames.length);
        return botNames[randomIndex];
    }

    setupGameEvents() {
        this.log('Настройка игровых событий...');
        
        // Бросок кубика
        this.addEventHandler('roll-dice', 'click', (e) => {
            e.preventDefault();
            this.log('🎲 Бросок кубика');
            try {
                this.game.rollDice();
            } catch (error) {
                this.error('Ошибка броска кубика:', error);
            }
        });

        // Движение игрока
        this.addEventHandler('move-player', 'click', (e) => {
            e.preventDefault();
            this.log('🚶 Движение игрока');
            try {
                this.game.moveCurrentPlayer();
            } catch (error) {
                this.error('Ошибка движения игрока:', error);
            }
        });

        // Возврат в главное меню
        this.addEventHandler('back-to-menu', 'click', (e) => {
            e.preventDefault();
            this.log('🏠 Возврат в главное меню');
            
            if (confirm('Вы уверены, что хотите вернуться в главное меню?')) {
                try {
                    this.game.resetGame();
                } catch (error) {
                    this.error('Ошибка возврата в меню:', error);
                }
            }
        });
    }

    setupKeyboardEvents() {
        this.log('Настройка клавиатурных событий...');
        
        document.addEventListener('keydown', (e) => {
            // Глобальные горячие клавиши
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        if (confirm('Сбросить игру? (Ctrl+R)')) {
                            this.game.resetGame();
                        }
                        break;
                }
            }

            // Пробел для броска кубика в игре
            if (e.code === 'Space') {
                const currentScreen = this.game.screenManager.getCurrentScreen();
                if (currentScreen === 'game') {
                    e.preventDefault();
                    const rollButton = document.getElementById('roll-dice');
                    if (rollButton && !rollButton.disabled) {
                        rollButton.click();
                    }
                }
            }
        });
    }

    setupThemeCheckboxes() {
        this.log('Настройка чекбоксов тем...');
        
        // Используем делегирование событий для динамически созданных чекбоксов
        const themesContainer = document.querySelector('.themes-selection');
        if (!themesContainer) {
            this.error('Контейнер тем не найден');
            return;
        }

        // Удаляем старый обработчик если есть
        const oldHandler = this.boundHandlers.get('themes-container-change');
        if (oldHandler) {
            themesContainer.removeEventListener('change', oldHandler);
            this.boundHandlers.delete('themes-container-change');
        }

        // Создаем новый обработчик для всех чекбоксов тем
        const themeChangeHandler = (e) => {
            if (e.target.type === 'checkbox' && e.target.id.startsWith('theme-')) {
                const themeId = e.target.value;
                this.log(`🎯 Изменена тема: ${themeId} (${e.target.checked ? 'включена' : 'отключена'})`);
                this.updateStartButtonState();
            }
        };

        themesContainer.addEventListener('change', themeChangeHandler);
        this.boundHandlers.set('themes-container-change', themeChangeHandler);
        
        this.log('✅ Настроено делегирование событий для чекбоксов тем');
    }

    getSelectedThemes() {
        const themes = [];
        const checkboxes = document.querySelectorAll('input[id^="theme-"]:checked');
        
        checkboxes.forEach(checkbox => {
            themes.push(checkbox.value);
        });
        
        this.log('Выбранные темы:', themes);
        return themes;
    }

    updateStartButtonState() {
        const startButton = document.getElementById('start-game');
        if (!startButton) return;

        const hasPlayers = this.game.gameState.players.length > 0;
        const hasThemes = this.getSelectedThemes().length > 0;
        
        startButton.disabled = !hasPlayers || !hasThemes;
        
        this.log('Состояние кнопки "Начать игру":', {
            hasPlayers,
            hasThemes,
            disabled: startButton.disabled
        });
    }

    addEventHandler(elementId, eventType, handler) {
        const element = document.getElementById(elementId);
        if (!element) {
            this.error(`Элемент ${elementId} не найден для события ${eventType}`);
            return false;
        }

        // Убираем возможный disabled для кнопок, которые должны быть активными
        if (eventType === 'click' && element.tagName === 'BUTTON') {
            if (['add-player', 'add-bot', 'reset-game'].includes(elementId)) {
                element.disabled = false;
                element.style.pointerEvents = 'auto';
                element.style.opacity = '1';
            }
        }

        const key = `${elementId}-${eventType}`;
        
        // Удаляем старый обработчик если есть
        if (this.boundHandlers.has(key)) {
            this.removeEventHandler(elementId, eventType);
        }

        // НЕ оборачиваем в дополнительную функцию для отладки - используем handler напрямую
        this.boundHandlers.set(key, handler);
        element.addEventListener(eventType, handler);
        
        this.log(`✅ Обработчик ${eventType} добавлен для ${elementId}`);
        return true;
    }

    removeEventHandler(elementId, eventType) {
        const element = document.getElementById(elementId);
        const key = `${elementId}-${eventType}`;
        
        if (element && this.boundHandlers.has(key)) {
            const handler = this.boundHandlers.get(key);
            element.removeEventListener(eventType, handler);
            this.boundHandlers.delete(key);
            this.log(`Обработчик ${eventType} удален для ${elementId}`);
            return true;
        }
        
        return false;
    }

    validateHandlers() {
        this.log('Проверка обработчиков...');
        
        const requiredHandlers = [
            'add-player-click',
            'add-bot-click', 
            'start-game-click',
            'reset-game-click'
        ];
        
        const missingHandlers = requiredHandlers.filter(key => 
            !this.boundHandlers.has(key)
        );
        
        if (missingHandlers.length > 0) {
            this.error('Отсутствуют обработчики:', missingHandlers);
        } else {
            this.log('✅ Все обработчики на месте');
        }
        
        // Проверяем что кнопки кликабельны
        const buttons = ['add-player', 'add-bot', 'reset-game'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                this.log(`Кнопка ${id}:`, {
                    disabled: btn.disabled,
                    style: btn.style.pointerEvents,
                    hasHandler: this.boundHandlers.has(`${id}-click`)
                });
            }
        });
    }

    // Методы для обновления состояния UI
    updatePlayersList() {
        this.updateStartButtonState();
    }

    updateGameControls(currentPlayer, diceValue) {
        const rollButton = document.getElementById('roll-dice');
        const moveButton = document.getElementById('move-player');
        
        if (rollButton && moveButton) {
            if (currentPlayer?.isBot) {
                rollButton.disabled = true;
                moveButton.disabled = true;
            } else {
                rollButton.disabled = !!diceValue;
                moveButton.disabled = !diceValue;
            }
        }
    }

    cleanup() {
        this.log('Очистка EventHandler...');
        
        // Удаляем все обработчики событий
        this.boundHandlers.forEach((handler, key) => {
            const [elementId, eventType] = key.split('-');
            this.removeEventHandler(elementId, eventType);
        });
        
        this.boundHandlers.clear();
        this.initialized = false;
        
        this.log('EventHandler очищен');
    }
}
