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
        // Основные компоненты системы
        this.gameState = new GameState();
        this.gameBoard = new GameBoard();
        this.questionLoader = new QuestionLoader();
        this.canvasRenderer = null;
        this.screenManager = new ScreenManager();
        this.modalManager = new ModalManager();
        this.eventHandler = new EventHandler(this);
        
        // Игровые настройки
        this.selectedThemes = new Set(['math', 'geography']);
        this.currentQuestion = null;
        this.dice = null;
        
        // Состояние инициализации
        this.initialized = false;
        this.debug = true;
        
        // Привязываем контекст методов
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
            
            // Ожидаем полной готовности DOM
            await this.waitForDOMReady();
            this.log('✅ DOM полностью готов');
            
            // Загрузка вопросов (не зависит от DOM)
            this.log('📚 Загрузка вопросов...');
            const questionsLoaded = await this.questionLoader.loadQuestions();
            if (!questionsLoaded) {
                throw new Error('Не удалось загрузить вопросы');
            }
            this.log('✅ Вопросы загружены');
            
            // Инициализация Canvas рендерера (не зависит от DOM на этом этапе)
            this.canvasRenderer = new CanvasRenderer();
            this.log('✅ CanvasRenderer создан');
            
            // Ждем появления всех критически важных элементов
            await this.waitForCriticalElements();
            this.log('✅ Все критически важные элементы найдены');
            
            // ТОЛЬКО ПОСЛЕ этого инициализируем компоненты, зависящие от DOM
            
            // Инициализация менеджера экранов
            this.screenManager.initialize();
            this.log('✅ ScreenManager инициализирован');
            
            // Инициализация менеджера модальных окон
            this.modalManager.initialize();
            this.log('✅ ModalManager инициализирован');
            
            // Настройка обработчиков событий
            this.log('🎮 Настройка обработчиков событий...');
            this.eventHandler.setupEventListeners();
            this.log('✅ EventHandler настроен');
            
            // Показ главного меню
            const menuShown = this.screenManager.showScreen(SCREENS.MENU);
            if (!menuShown) {
                throw new Error('Не удалось показать главное меню');
            }
            this.log('✅ Главное меню отображено');
            
            // Подписка на события смены экрана
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

    // Ожидание готовности DOM
    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else if (document.readyState === 'interactive') {
                // DOM готов, но ресурсы еще загружаются
                setTimeout(resolve, 100); // Небольшая задержка для стабильности
            } else {
                // DOM еще загружается
                const handleReady = () => {
                    document.removeEventListener('DOMContentLoaded', handleReady);
                    setTimeout(resolve, 100);
                };
                document.addEventListener('DOMContentLoaded', handleReady);
            }
        });
    }

    // Ожидание появления критически важных элементов
    waitForCriticalElements() {
        return new Promise((resolve, reject) => {
            const criticalElements = [
                'menu',           // Главное меню
                'game',           // Игровой экран  
                'add-player',     // Кнопка добавления игрока
                'players-list'    // Список игроков
            ];
            
            let attempts = 0;
            const maxAttempts = 50; // 5 секунд максимум
            
            const checkElements = () => {
                attempts++;
                
                const missingElements = criticalElements.filter(id => {
                    const element = document.getElementById(id);
                    return !element;
                });
                
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
        // Обработка переходов между экранами
        if (to === SCREENS.GAME && this.canvasRenderer) {
            // При переходе на игровой экран инициализируем Canvas
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
            
            // Переход на игровой экран
            this.screenManager.showScreen(SCREENS.GAME);
            
            // Небольшая задержка для загрузки экрана
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Инициализация Canvas после перехода на игровой экран
            if (this.canvasRenderer && this.canvasRenderer.setupCanvas()) {
                this.updateGameDisplay();
                this.log('✅ Canvas инициализирован');
            } else {
                this.error('❌ Не удалось инициализировать Canvas');
            }
            
            // Обновляем интерфейс
            this.updateCurrentPlayerDisplay();
            this.updateGameControlsDisplay();
            
            this.log('🎉 Игра началась!');
            
            // Автоматический ход для бота, если первый игрок - бот
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

            // Проверяем, что имя уникально
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
            
            // Обновляем отображение кубика
            this.updateDiceDisplay();
            this.updateGameControlsDisplay();
            
            // Для ботов автоматически делаем ход
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
            
            this.dice = null; // Сбрасываем кубик
            
            // Проверяем специальные клетки (лестницы/змеи)
            const jumpDestination = this.gameBoard.getJumpDestination(newPosition);
            if (jumpDestination !== null) {
                const isLadder = jumpDestination > newPosition;
                currentPlayer.position = jumpDestination;
                
                const message = isLadder ? 'Лестница вверх!' : 'Змея вниз!';
                this.modalManager.showMessage(
                    `${currentPlayer.name} попал на специальную клетку!`,
                    `${message} Новая позиция: ${jumpDestination + 1}`,
                    () => this.continueAfterMove()
                );
                
                this.log(`🪜 ${currentPlayer.name}: ${oldPosition + 1} → ${newPosition + 1} → ${jumpDestination + 1} (${message})`);
            } else {
                this.log(`📍 ${currentPlayer.name}: ${oldPosition + 1} → ${newPosition + 1}`);
                this.continueAfterMove();
            }
            
            // Обновляем отображение
            this.updateGameDisplay();
            
        } catch (error) {
            this.error('Ошибка движения игрока:', error);
        }
    }

    continueAfterMove() {
        // Проверяем победу
        const winner = this.gameState.checkWinner();
        if (winner) {
            this.endGame(winner);
            return;
        }

        // Задаем вопрос
        this.askQuestion();
    }

    async askQuestion() {
        try {
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (!currentPlayer) return;

            this.log(`❓ Задаем вопрос игроку ${currentPlayer.name}`);
            
            // Получаем случайный вопрос из выбранных тем
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
            
            // Симуляция времени размышления
            await new Promise(resolve => setTimeout(resolve, difficulty.thinkTime));
            
            const isCorrect = Math.random() < difficulty.correctChance;
            const answer = isCorrect ? this.currentQuestion.answer : 'Неправильный ответ бота';
            
            this.log(`🤖 Бот отвечает: "${answer}" (${isCorrect ? 'правильно' : 'неправильно'})`);
            
            this.handleAnswer(answer);
        } catch (error) {
            this.error('Ошибка обработки ответа бота:', error);
            this.nextTurn();
        }
    }

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
                this.modalManager.showMessage(
                    'Правильно! 🎉', 
                    'Отличная работа! Продолжайте игру.',
                    () => this.nextTurn()
                );
            } else {
                this.modalManager.showMessage(
                    'Неправильно 😔', 
                    `Правильный ответ: ${this.currentQuestion.answer}. Пропускаете следующий ход.`,
                    () => this.nextTurn()
                );
                this.gameState.setSkipTurns(currentPlayer.id, 1);
            }

            this.currentQuestion = null;
            
        } catch (error) {
            this.error('Ошибка обработки ответа:', error);
            this.nextTurn();
        }
    }

    nextTurn() {
        try {
            this.gameState.nextPlayer();
            this.updateCurrentPlayerDisplay();
            this.updateGameControlsDisplay();
            
            // Сбрасываем отображение кубика
            this.dice = null;
            this.updateDiceDisplay();

            const currentPlayer = this.gameState.getCurrentPlayer();
            this.log(`🔄 Переход хода к: ${currentPlayer?.name}`);

            // Автоматический ход для бота
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
            this.selectedThemes = new Set(['math', 'geography']);
            
            // Возврат в главное меню
            this.screenManager.showScreen(SCREENS.MENU);
            
            // Очистка отображения
            this.updatePlayersDisplay();
            
            // Очистка Canvas
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

    // Методы обновления интерфейса
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
        
        container.innerHTML = this.gameState.players.map((player, index) => `
            <div class="player-item" style="border-left: 4px solid ${player.color}">
                <div class="player-info">
                    <span class="player-name">${player.name} ${player.isBot ? '(Бот)' : ''}</span>
                    <span class="player-position">Позиция: ${player.position + 1}/120</span>
                </div>
                ${player.questionsAnswered > 0 ? `
                    <div class="player-stats">
                        <small>Точность: ${player.getAccuracy()}% (${player.correctAnswers}/${player.questionsAnswered})</small>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        // Обновляем состояние кнопки начала игры
        if (this.eventHandler && this.eventHandler.updateStartButtonState) {
            this.eventHandler.updateStartButtonState();
        }
    }

    updatePlayersGameDisplay() {
        const container = document.getElementById('players-list-game');
        if (!container) return;
        
        container.innerHTML = this.gameState.players.map(player => `
            <div class="player-item" style="border-left: 4px solid ${player.color}; ${player.id === this.gameState.currentPlayerIndex ? 'background: #e3f2fd;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${player.name}</span>
                    <span>${player.position + 1}/120</span>
                </div>
                ${player.skipTurns > 0 ? `<small style="color: #e74c3c;">Пропускает: ${player.skipTurns} ход(ов)</small>` : ''}
            </div>
        `).join('');
    }

    updateCurrentPlayerDisplay() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const element = document.getElementById('current-player');
        
        if (element && currentPlayer) {
            element.textContent = `Ход: ${currentPlayer.name}`;
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

    // Отладочные методы
    getDebugInfo() {
        return {
            initialized: this.initialized,
            gameStarted: this.gameState.gameStarted,
            gameEnded: this.gameState.gameEnded,
            playersCount: this.gameState.players.length,
            currentPlayer: this.gameState.getCurrentPlayer()?.name,
            currentScreen: this.screenManager.getCurrentScreen(),
            selectedThemes: [...this.selectedThemes],
            dice: this.dice,
            questionsLoaded: this.questionLoader.loaded
        };
    }

    // Принудительные методы для отладки
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

    // Геттеры для внешнего доступа
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
