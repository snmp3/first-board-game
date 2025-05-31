import { GameState } from './GameState.js';
import { GameBoard } from '../entities/GameBoard.js';
import { QuestionLoader } from '../data/QuestionLoader.js';
import { CanvasRenderer } from '../rendering/CanvasRenderer.js';
import { ScreenManager } from '../ui/ScreenManager.js';
import { ModalManager } from '../ui/ModalManager.js';
import { EventHandler } from '../ui/EventHandler.js';
import { GAME_CONFIG, BOT_DIFFICULTY, SCREENS } from './Constants.js';

export class Game {
    constructor() {
        this.gameState = new GameState();
        this.gameBoard = new GameBoard();
        this.questionLoader = new QuestionLoader();
        this.canvasRenderer = null;
        this.screenManager = new ScreenManager();
        this.modalManager = new ModalManager();
        this.eventHandler = new EventHandler(this);
        
        this.selectedThemes = new Set();
        this.availableSubjects = [];
        this.currentQuestion = null;
        this.dice = null;
        
        this.initialized = false;
        this.debug = true;
        
        this.handleAnswer = this.handleAnswer.bind(this);
        this.handleBotAnswer = this.handleBotAnswer.bind(this);
        this.askQuestion = this.askQuestion.bind(this);
    }

    log(...args) {
        if (this.debug) {
            console.log('[Game]', ...args);
        }
    }

    error(...args) {
        console.error('[Game]', ...args);
    }

    async initialize() {
        try {
            this.log('🚀 Инициализация игры...');
            
            await this.waitForDOMReady();
            this.log('✅ DOM полностью готов');
            
            this.log('📚 Загрузка вопросов...');
            const questionsLoaded = await this.questionLoader.loadQuestions();
            if (!questionsLoaded) {
                throw new Error('Не удалось загрузить вопросы');
            }
            this.log('✅ Вопросы загружены');
            
            this.availableSubjects = this.questionLoader.getAvailableSubjects();
            this.log('🎯 Доступные предметы:', this.availableSubjects);
            
            const defaultSubjects = this.questionLoader.getDefaultSubjects();
            this.selectedThemes = new Set(defaultSubjects);
            this.log('🎯 Темы по умолчанию:', defaultSubjects);
            
            this.canvasRenderer = new CanvasRenderer();
            this.log('✅ CanvasRenderer создан');
            
            await this.waitForCriticalElements();
            this.log('✅ Все критически важные элементы найдены');
            
            this.log('🎨 Создание интерфейса разделов знаний...');
            await this.createSubjectsInterface();
            this.log('✅ Интерфейс разделов знаний создан');
            
            this.screenManager.initialize();
            this.log('✅ ScreenManager инициализирован');
            
            this.modalManager.initialize();
            this.log('✅ ModalManager инициализирован');
            
            this.log('🎮 Настройка обработчиков событий...');
            this.eventHandler.setupEventListeners();
            this.log('✅ EventHandler настроен');
            
            const menuShown = this.screenManager.showScreen(SCREENS.MENU);
            if (!menuShown) {
                throw new Error('Не удалось показать главное меню');
            }
            this.log('✅ Главное меню отображено');
            
            this.screenManager.onScreenChange((event) => {
                this.log(`Переход экрана: ${event.detail.from} → ${event.detail.to}`);
                this.handleScreenChange(event.detail.from, event.detail.to);
            });
            
            this.initialized = true;
            this.log('🎉 Игра полностью инициализирована');
            
            return true;
        } catch (error) {
            this.error('❌ Ошибка инициализации игры:', error);
            throw error;
        }
    }

    async createSubjectsInterface() {
        this.log('🎨 Начинаем создание интерфейса разделов знаний...');
        
        const container = document.querySelector('.themes-selection');
        if (!container) {
            this.error('❌ Контейнер .themes-selection не найден в DOM');
            return;
        }
        this.log('✅ Контейнер найден:', container);

        const loadingIndicator = document.getElementById('themes-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            this.log('✅ Индикатор загрузки скрыт');
        }

        const existingCheckboxes = container.querySelectorAll('.theme-checkbox');
        existingCheckboxes.forEach(checkbox => checkbox.remove());
        this.log(`🧹 Очищено ${existingCheckboxes.length} существующих чекбоксов`);

        if (!this.availableSubjects || this.availableSubjects.length === 0) {
            this.error('❌ Нет доступных предметов для создания интерфейса');
            const errorMsg = document.createElement('div');
            errorMsg.style.textAlign = 'center';
            errorMsg.style.color = '#e74c3c';
            errorMsg.style.padding = '20px';
            errorMsg.innerHTML = '⚠️ Не удалось загрузить разделы знаний.<br>Используются встроенные вопросы.';
            container.appendChild(errorMsg);
            return;
        }

        this.log(`📋 Создаем чекбоксы для ${this.availableSubjects.length} предметов`);

        let title = container.querySelector('h3');
        if (!title) {
            title = document.createElement('h3');
            title.textContent = 'Выберите темы вопросов:';
            container.appendChild(title);
            this.log('✅ Заголовок создан');
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        this.availableSubjects.forEach((subject, index) => {
            this.log(`📝 Создаем чекбокс для: ${subject.name} (${subject.id})`);
            
            const checkboxContainer = document.createElement('label');
            checkboxContainer.className = 'theme-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `theme-${subject.id}`;
            checkbox.value = subject.id;
            checkbox.checked = this.selectedThemes.has(subject.id);
            
            const span = document.createElement('span');
            span.innerHTML = `${subject.icon} ${subject.name}`;
            if (subject.description) {
                span.title = subject.description;
            }
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(span);
            container.appendChild(checkboxContainer);
            
            this.log(`✅ Чекбокс создан для: ${subject.name} (ID: theme-${subject.id}, checked: ${checkbox.checked})`);
        });

        container.offsetHeight;
        
        this.log('🎨 Интерфейс разделов знаний создан успешно');
        
        const createdCheckboxes = container.querySelectorAll('.theme-checkbox');
        this.log(`✅ Создано ${createdCheckboxes.length} чекбоксов в DOM`);
        
        createdCheckboxes.forEach((cb, i) => {
            const input = cb.querySelector('input');
            const span = cb.querySelector('span');
            this.log(`   ${i + 1}. ID: ${input?.id}, Value: ${input?.value}, Checked: ${input?.checked}, Text: ${span?.textContent}`);
        });
    }

    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else if (document.readyState === 'interactive') {
                setTimeout(resolve, 100);
            } else {
                const handleReady = () => {
                    document.removeEventListener('DOMContentLoaded', handleReady);
                    setTimeout(resolve, 100);
                };
                document.addEventListener('DOMContentLoaded', handleReady);
            }
        });
    }

    waitForCriticalElements() {
        return new Promise((resolve, reject) => {
            const criticalElements = [
                'menu',
                'game', 
                'add-player',
                'players-list'
            ];
            
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkElements = () => {
                attempts++;
                
                const missingElements = criticalElements.filter(id => {
                    const element = document.getElementById(id);
                    return !element;
                });
                
                const themesContainer = document.querySelector('.themes-selection');
                if (!themesContainer) {
                    missingElements.push('themes-selection');
                }
                
                if (missingElements.length === 0) {
                    this.log('Все критически важные элементы найдены:', criticalElements);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    this.error('Превышено время ожидания элементов:', missingElements);
                    reject(new Error(`Элементы не найдены: ${missingElements.join(', ')}`));
                } else {
                    this.log(`Попытка ${attempts}/${maxAttempts}, ожидаем элементы:`, missingElements);
                    setTimeout(checkElements, 100);
                }
            };
            
            checkElements();
        });
    }

    handleScreenChange(from, to) {
        if (to === SCREENS.GAME && this.canvasRenderer) {
            setTimeout(() => {
                if (this.canvasRenderer.setupCanvas()) {
                    this.updateGameDisplay();
                }
            }, 100);
        }
    }

    async startGame() {
        try {
            if (this.gameState.players.length === 0) {
                this.modalManager.showMessage('Ошибка', 'Добавьте игроков перед началом игры!');
                return false;
            }

            if (this.selectedThemes.size === 0) {
                this.modalManager.showMessage('Ошибка', 'Выберите хотя бы одну тему вопросов!');
                return false;
            }

            this.log('🎮 Начинаем игру...');
            this.log('Игроки:', this.gameState.players.map(p => p.name));
            this.log('Темы:', [...this.selectedThemes]);

            this.gameState.gameStarted = true;
            this.gameState.gameEnded = false;
            
            this.screenManager.showScreen(SCREENS.GAME);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            if (this.canvasRenderer && this.canvasRenderer.setupCanvas()) {
                this.updateGameDisplay();
                this.log('✅ Canvas инициализирован');
            } else {
                this.error('❌ Не удалось инициализировать Canvas');
            }
            
            this.updateCurrentPlayerDisplay();
            this.updateGameControlsDisplay();
            
            this.log('🎉 Игра началась!');
            
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (currentPlayer && currentPlayer.isBot) {
                setTimeout(() => this.rollDice(), 1500);
            }
            
            return true;
        } catch (error) {
            this.error('Ошибка начала игры:', error);
            this.modalManager.showMessage('Ошибка', 'Не удалось начать игру');
            return false;
        }
    }

    addPlayer(name, isBot = false, difficulty = 'medium') {
        try {
            if (this.gameState.players.length >= 4) {
                this.modalManager.showMessage('Внимание', 'Максимум 4 игрока!');
                return null;
            }

            if (!name || name.trim().length === 0) {
                this.modalManager.showMessage('Ошибка', 'Введите имя игрока!');
                return null;
            }

            const existingNames = this.gameState.players.map(p => p.name.toLowerCase());
            if (existingNames.includes(name.toLowerCase())) {
                this.modalManager.showMessage('Внимание', 'Игрок с таким именем уже существует!');
                return null;
            }

            const player = this.gameState.addPlayer(name.trim(), isBot, difficulty);
            this.updatePlayersDisplay();
            
            this.log(`👤 Игрок добавлен: ${player.name} ${isBot ? '(Бот ' + difficulty + ')' : ''}`);
            
            return player;
        } catch (error) {
            this.error('Ошибка добавления игрока:', error);
            this.modalManager.showMessage('Ошибка', 'Не удалось добавить игрока');
            return null;
        }
    }

    rollDice() {
        try {
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (!currentPlayer) {
                this.error('Нет текущего игрока для броска кубика');
                return;
            }

            if (this.dice !== null) {
                this.log('Кубик уже брошен:', this.dice);
                return;
            }

            this.dice = Math.floor(Math.random() * 6) + 1;
            this.log(`🎲 ${currentPlayer.name} бросил кубик: ${this.dice}`);
            
            this.updateDiceDisplay();
            this.updateGameControlsDisplay();
            
            if (currentPlayer.isBot) {
                setTimeout(() => this.moveCurrentPlayer(), 1000);
            }
        } catch (error) {
            this.error('Ошибка броска кубика:', error);
        }
    }

    moveCurrentPlayer() {
        try {
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (!currentPlayer || this.dice === null) {
                this.error('Невозможно переместить игрока', { currentPlayer, dice: this.dice });
                return;
            }

            this.log(`🚶 ${currentPlayer.name} движется на ${this.dice} клеток`);
            
            const oldPosition = currentPlayer.position;
            const newPosition = this.gameState.movePlayer(currentPlayer.id, this.dice);
            
            this.dice = null;
            
            const jumpDestination = this.gameBoard.getJumpDestination(newPosition);
            if (jumpDestination !== null) {
                const isLadder = jumpDestination > newPosition;
                
                this.gameState.setPlayerPosition(currentPlayer.id, jumpDestination);
                
                const message = isLadder ? 'Лестница вверх!' : 'Змея вниз!';
                this.modalManager.showMessage(
                    `${currentPlayer.name} попал на специальную клетку!`,
                    `${message}\nНовая позиция: ${jumpDestination + 1}`,
                    () => this.continueAfterMove(),
                    { autoClose: true, autoCloseDelay: 2000 }
                );
                
                this.log(`🪜 ${currentPlayer.name}: ${oldPosition + 1} → ${newPosition + 1} → ${jumpDestination + 1} (${message})`);
            } else {
                this.log(`📍 ${currentPlayer.name}: ${oldPosition + 1} → ${newPosition + 1}`);
                this.continueAfterMove();
            }
            
            this.updateGameDisplay();
            this.updatePlayersDisplay();
            this.updatePlayersGameDisplay();
            
        } catch (error) {
            this.error('Ошибка движения игрока:', error);
        }
    }

    continueAfterMove() {
        const winner = this.gameState.checkWinner();
        if (winner) {
            this.endGame(winner);
            return;
        }

        this.askQuestion();
    }

    async askQuestion() {
        try {
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (!currentPlayer) return;

            this.log(`❓ Задаем вопрос игроку ${currentPlayer.name}`);
            
            this.currentQuestion = this.questionLoader.getRandomQuestion([...this.selectedThemes]);
            
            if (currentPlayer.isBot) {
                await this.handleBotAnswer();
            } else {
                this.modalManager.showQuestion(
                    this.currentQuestion.text,
                    this.handleAnswer
                );
            }
        } catch (error) {
            this.error('Ошибка при получении вопроса:', error);
            this.modalManager.showMessage('Ошибка', 'Не удалось загрузить вопрос');
            this.nextTurn();
        }
    }

    async handleBotAnswer() {
        try {
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (!currentPlayer || !this.currentQuestion) return;

            const difficulty = BOT_DIFFICULTY[currentPlayer.difficulty] || BOT_DIFFICULTY.medium;
            
            this.log(`🤖 Бот ${currentPlayer.name} думает... (${difficulty.thinkTime}ms)`);
            
            await new Promise(resolve => setTimeout(resolve, difficulty.thinkTime));
            
            const isCorrect = Math.random() < difficulty.correctChance;
            const answer = isCorrect ? this.currentQuestion.answer : 'Неправильный ответ бота';
            
            this.log(`🤖 Бот отвечает: "${answer}" (${isCorrect ? 'правильно' : 'неправильно'})`);
            
            currentPlayer.questionsAnswered++;
            
            if (isCorrect) {
                currentPlayer.correctAnswers++;
                // Для бота: автозакрытие через 1 секунду
                this.modalManager.showBotMessage(
                    'Бот ответил правильно! 🤖🎉',
                    `Вопрос: ${this.currentQuestion.text}\nОтвет: ${answer}`,
                    () => this.nextTurn()
                );
            } else {
                // ИСПРАВЛЕНИЕ: Ставим флаг пропуска следующего хода
                this.gameState.setSkipTurns(currentPlayer.id, 1);
                
                // Для бота: автозакрытие через 1 секунду
                this.modalManager.showBotMessage(
                    'Бот ответил неправильно 🤖😔',
                    `Вопрос: ${this.currentQuestion.text}\nОтвет бота: ${answer}\nПравильный ответ: ${this.currentQuestion.answer}\nБот пропустит следующий ход.`,
                    () => this.nextTurn()
                );
            }

            this.currentQuestion = null;
            
        } catch (error) {
            this.error('Ошибка обработки ответа бота:', error);
            this.nextTurn();
        }
    }

    // ИСПРАВЛЕННЫЙ метод обработки ответов игроков
    handleAnswer(userAnswer) {
        try {
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (!currentPlayer || !this.currentQuestion) {
                this.error('Нет текущего игрока или вопроса для обработки ответа');
                return;
            }

            currentPlayer.questionsAnswered++;
            const isCorrect = this.questionLoader.checkAnswer(userAnswer, this.currentQuestion.answer);
            
            this.log(`💭 ${currentPlayer.name} ответил: "${userAnswer}" (${isCorrect ? 'правильно' : 'неправильно'})`);
            
            if (isCorrect) {
                currentPlayer.correctAnswers++;
                // Для игрока: автозакрытие при правильном ответе через 1 секунду
                this.modalManager.showSuccessMessage(
                    'Отличная работа! Продолжайте игру.',
                    () => this.nextTurn(),
                    true // autoClose = true
                );
            } else {
                // ИСПРАВЛЕНИЕ: Ставим флаг пропуска следующего хода
                this.gameState.setSkipTurns(currentPlayer.id, 1);
                
                // Для игрока: НЕТ автозакрытия при неправильном ответе
                this.modalManager.showErrorMessage(
                    `Правильный ответ: ${this.currentQuestion.answer}\nВы пропустите следующий ход.`,
                    () => this.nextTurn(), // ИСПРАВЛЕНИЕ: вызываем обычный nextTurn
                    false // autoClose = false
                );
            }

            this.currentQuestion = null;
            
        } catch (error) {
            this.error('Ошибка обработки ответа:', error);
            this.nextTurn();
        }
    }

    // ЕДИНСТВЕННЫЙ метод смены хода (убираем nextTurnAfterWrongAnswer)
    nextTurn() {
        try {
            // nextPlayer автоматически обработает пропуск хода
            this.gameState.nextPlayer();
            
            this.updateCurrentPlayerDisplay();
            this.updateGameControlsDisplay();
            this.updatePlayersDisplay();
            this.updatePlayersGameDisplay();
            
            this.dice = null;
            this.updateDiceDisplay();

            const currentPlayer = this.gameState.getCurrentPlayer();
            this.log(`🔄 Переход хода к: ${currentPlayer?.name}`);

            if (currentPlayer && currentPlayer.isBot) {
                setTimeout(() => this.rollDice(), 1500);
            }
        } catch (error) {
            this.error('Ошибка смены хода:', error);
        }
    }

    endGame(winner) {
        try {
            this.gameState.gameEnded = true;
            this.log(`🏆 Игра окончена! Победитель: ${winner.name}`);
            
            const stats = this.gameState.getStatistics();
            let resultsHTML = `
                <div style="text-align: center;">
                    <h2>🎉 Победитель: ${winner.name}!</h2>
                    <p style="margin: 20px 0;">Поздравляем с победой!</p>
                </div>
                <hr style="margin: 20px 0;">
                <h3>Статистика игры:</h3>
            `;
            
            stats.forEach((stat, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                resultsHTML += `
                    <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid ${this.gameState.players[index]?.color || '#ccc'};">
                        <strong>${medal} ${stat.name}</strong><br>
                        <small>
                            Позиция: ${stat.position}/120 | 
                            Точность: ${stat.accuracy}% (${stat.correctAnswers}/${stat.questionsAnswered})
                        </small>
                    </div>
                `;
            });

            this.modalManager.showResults(resultsHTML, () => {
                this.resetGame();
            });
            
        } catch (error) {
            this.error('Ошибка завершения игры:', error);
        }
    }

    updateThemes(themes) {
        this.selectedThemes = new Set(themes);
        this.log('🎯 Обновлены темы:', [...this.selectedThemes]);
    }

    resetGame() {
        try {
            this.log('🔄 Сброс игры...');
            
            this.gameState.reset();
            this.dice = null;
            this.currentQuestion = null;
            
            const defaultSubjects = this.questionLoader.getDefaultSubjects();
            this.selectedThemes = new Set(defaultSubjects);
            
            this.screenManager.showScreen(SCREENS.MENU);
            
            this.updatePlayersDisplay();
            
            this.resetThemeCheckboxes();
            
            const canvas = document.getElementById('game-board');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            this.log('✅ Игра сброшена');
            
        } catch (error) {
            this.error('Ошибка сброса игры:', error);
        }
    }

    resetThemeCheckboxes() {
        const defaultSubjects = this.questionLoader.getDefaultSubjects();
        const checkboxes = document.querySelectorAll('input[id^="theme-"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = defaultSubjects.includes(checkbox.value);
        });
    }

    updateGameDisplay() {
        try {
            if (this.canvasRenderer && this.canvasRenderer.initialized) {
                this.canvasRenderer.drawBoard(this.gameBoard);
                this.canvasRenderer.drawPlayers(this.gameState.players);
            }
            this.updatePlayersGameDisplay();
            this.updateCurrentPlayerDisplay();
        } catch (error) {
            this.error('Ошибка обновления игрового дисплея:', error);
        }
    }

    updatePlayersDisplay() {
        const container = document.getElementById('players-list');
        if (!container) return;
        
        if (this.gameState.players.length === 0) {
            container.innerHTML = '<p class="no-players">Игроки не добавлены</p>';
            return;
        }
        
        container.innerHTML = this.gameState.players.map((player, index) => {
            const skipTurns = this.gameState.getSkipTurns(player.id);
            const skipInfo = skipTurns > 0 ? ` (Пропустит: ${skipTurns} ход)` : '';
            
            return `
                <div class="player-item" style="border-left: 4px solid ${player.color}">
                    <div class="player-info">
                        <span class="player-name">${player.name} ${player.isBot ? '(Бот)' : ''}${skipInfo}</span>
                        <span class="player-position">Позиция: ${player.position + 1}/120</span>
                    </div>
                    ${player.questionsAnswered > 0 ? `
                        <div class="player-stats">
                            <small>Точность: ${player.getAccuracy()}% (${player.correctAnswers}/${player.questionsAnswered})</small>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        if (this.eventHandler && this.eventHandler.updateStartButtonState) {
            this.eventHandler.updateStartButtonState();
        }
    }

    updatePlayersGameDisplay() {
        const container = document.getElementById('players-list-game');
        if (!container) return;
        
        container.innerHTML = this.gameState.players.map(player => {
            const isCurrentPlayer = player.id === this.gameState.currentPlayerIndex;
            const skipTurns = this.gameState.getSkipTurns(player.id);
            
            return `
                <div class="player-item" style="border-left: 4px solid ${player.color}; ${isCurrentPlayer ? 'background: #e3f2fd;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${player.name}${isCurrentPlayer ? ' ←' : ''}</span>
                        <span>${player.position + 1}/120</span>
                    </div>
                    ${skipTurns > 0 ? `<small style="color: #e74c3c;">Пропустит: ${skipTurns} ход</small>` : ''}
                </div>
            `;
        }).join('');
    }

    updateCurrentPlayerDisplay() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const element = document.getElementById('current-player');
        
        if (element && currentPlayer) {
            const skipTurns = this.gameState.getSkipTurns(currentPlayer.id);
            const skipText = skipTurns > 0 ? ` (Пропустит: ${skipTurns} ход)` : '';
            
            element.textContent = `Ход: ${currentPlayer.name}${skipText}`;
            element.style.color = currentPlayer.color;
        }
    }

    updateDiceDisplay() {
        const element = document.getElementById('dice-result');
        if (element) {
            element.textContent = this.dice !== null ? this.dice.toString() : '-';
        }
    }

    updateGameControlsDisplay() {
        const rollButton = document.getElementById('roll-dice');
        const moveButton = document.getElementById('move-player');
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        if (rollButton && moveButton) {
            if (currentPlayer && currentPlayer.isBot) {
                rollButton.disabled = true;
                moveButton.disabled = true;
                rollButton.textContent = 'Ход бота...';
                moveButton.textContent = 'Двигаться';
            } else {
                rollButton.disabled = this.dice !== null;
                moveButton.disabled = this.dice === null;
                rollButton.textContent = 'Бросить кубик';
                moveButton.textContent = 'Двигаться';
            }
        }
    }

    getDebugInfo() {
        return {
            initialized: this.initialized,
            gameStarted: this.gameState.gameStarted,
            gameEnded: this.gameState.gameEnded,
            playersCount: this.gameState.players.length,
            currentPlayer: this.gameState.getCurrentPlayer()?.name,
            currentScreen: this.screenManager.getCurrentScreen(),
            selectedThemes: [...this.selectedThemes],
            availableSubjects: this.availableSubjects.map(s => s.name),
            dice: this.dice,
            questionsLoaded: this.questionLoader.loaded
        };
    }

    forceAddTestPlayers() {
        this.addPlayer('Тестовый игрок', false);
        this.addPlayer('Тестовый бот', true, 'easy');
        this.log('Добавлены тестовые игроки');
    }

    forceStartGame() {
        if (this.gameState.players.length === 0) {
            this.forceAddTestPlayers();
        }
        this.startGame();
    }

    debugThemesInterface() {
        this.log('=== ОТЛАДКА ИНТЕРФЕЙСА ТЕМ ===');
        this.log('availableSubjects:', this.availableSubjects);
        this.log('selectedThemes:', [...this.selectedThemes]);
        
        const container = document.querySelector('.themes-selection');
        this.log('Контейнер тем:', container);
        
        if (container) {
            const checkboxes = container.querySelectorAll('.theme-checkbox');
            this.log(`Найдено ${checkboxes.length} чекбоксов в контейнере`);
            
            checkboxes.forEach((cb, i) => {
                const input = cb.querySelector('input');
                const span = cb.querySelector('span');
                this.log(`  ${i + 1}. ${input?.id}: ${span?.textContent} (checked: ${input?.checked})`);
            });
        }
        
        return {
            container: !!container,
            availableSubjects: this.availableSubjects.length,
            checkboxes: container?.querySelectorAll('.theme-checkbox').length || 0
        };
    }

    getGameStateDebug() {
        return {
            currentPlayerIndex: this.gameState.currentPlayerIndex,
            currentPlayer: this.gameState.getCurrentPlayer()?.name,
            playerPositions: this.gameState.players.map(p => ({
                name: p.name,
                position: p.position + 1,
                skipTurns: this.gameState.getSkipTurns(p.id)
            })),
            skipTurnsMap: this.gameState.getAllSkipTurns()
        };
    }

    get players() {
        return this.gameState.players;
    }

    get isGameStarted() {
        return this.gameState.gameStarted;
    }

    get isGameEnded() {
        return this.gameState.gameEnded;
    }

    get currentPlayerName() {
        return this.gameState.getCurrentPlayer()?.name;
    }
}
