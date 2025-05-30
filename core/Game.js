import { GameState } from './GameState.js';
import { GameBoard } from '../entities/GameBoard.js';
import { QuestionLoader } from '../data/QuestionLoader.js';
import { CanvasRenderer } from '../rendering/CanvasRenderer.js';
import { ScreenManager } from '../ui/ScreenManager.js';
import { ModalManager } from '../ui/ModalManager.js';
import { EventHandler } from '../ui/EventHandler.js';
import { GAME_CONFIG, BOT_DIFFICULTY } from './Constants.js';

export class Game {
    constructor() {
        this.gameState = new GameState();
        this.gameBoard = new GameBoard();
        this.questionLoader = new QuestionLoader();
        this.canvasRenderer = null;
        this.screenManager = new ScreenManager();
        this.modalManager = new ModalManager();
        this.eventHandler = new EventHandler(this);
        
        this.selectedThemes = new Set(['math', 'geography']);
        this.currentQuestion = null;
        this.dice = null;
    }

    async initialize() {
        try {
            // Загрузка вопросов
            await this.questionLoader.loadQuestions();
            
            // Инициализация рендерера
            this.canvasRenderer = new CanvasRenderer();
            
            // Настройка обработчиков событий
            this.eventHandler.setupEventListeners();
            
            // Инициализация модальных окон
            this.modalManager.initialize();
            
            // Показ главного меню
            this.screenManager.showScreen('menu');
            
            console.log('Игра инициализирована успешно');
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
            throw error;
        }
    }

    async startGame() {
        if (this.gameState.players.length === 0) {
            alert('Добавьте игроков перед началом игры!');
            return;
        }

        this.gameState.gameStarted = true;
        this.screenManager.showScreen('game');
        
        // Инициализация Canvas
        this.canvasRenderer.setupCanvas();
        this.updateGameDisplay();
        
        console.log('Игра началась!');
    }

    addPlayer(name, isBot = false, difficulty = 'medium') {
        if (this.gameState.players.length >= 4) {
            alert('Максимум 4 игрока!');
            return;
        }

        const player = this.gameState.addPlayer(name, isBot, difficulty);
        this.updatePlayersDisplay();
        return player;
    }

    rollDice() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer) return;

        this.dice = Math.floor(Math.random() * 6) + 1;
        document.getElementById('dice-result').textContent = this.dice;
        
        // Обновляем отображение
        this.updateCurrentPlayerDisplay();
        
        // Для ботов автоматически двигаем
        if (currentPlayer.isBot) {
            setTimeout(() => this.moveCurrentPlayer(), 1000);
        }
    }

    moveCurrentPlayer() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer || !this.dice) return;

        const newPosition = this.gameState.movePlayer(currentPlayer.id, this.dice);
        this.dice = null;
        
        // Проверяем прыжковые клетки
        const jumpTo = this.gameBoard.getJumpDestination(newPosition);
        if (jumpTo !== null) {
            currentPlayer.position = jumpTo;
            this.modalManager.showMessage(
                `${currentPlayer.name} попал на специальную клетку!`,
                jumpTo > newPosition ? 'Лестница вверх!' : 'Змея вниз!'
            );
        }

        this.updateGameDisplay();

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
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer) return;

        try {
            this.currentQuestion = this.questionLoader.getRandomQuestion([...this.selectedThemes]);
            
            if (currentPlayer.isBot) {
                await this.handleBotAnswer();
            } else {
                this.modalManager.showQuestion(
                    this.currentQuestion.question,
                    (answer) => this.handleAnswer(answer)
                );
            }
        } catch (error) {
            console.error('Ошибка при получении вопроса:', error);
            this.nextTurn();
        }
    }

    async handleBotAnswer() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const difficulty = BOT_DIFFICULTY[currentPlayer.difficulty];
        
        // Симуляция времени размышления
        await new Promise(resolve => setTimeout(resolve, difficulty.thinkTime));
        
        const isCorrect = Math.random() < difficulty.correctChance;
        const answer = isCorrect ? this.currentQuestion.answer : 'Неправильный ответ';
        
        this.handleAnswer(answer);
    }

    handleAnswer(userAnswer) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (!currentPlayer || !this.currentQuestion) return;

        currentPlayer.questionsAnswered++;
        const isCorrect = this.questionLoader.checkAnswer(userAnswer, this.currentQuestion.answer);
        
        if (isCorrect) {
            currentPlayer.correctAnswers++;
            this.modalManager.showMessage('Правильно!', 'Продолжайте игру!');
        } else {
            this.modalManager.showMessage(
                'Неправильно!', 
                `Правильный ответ: ${this.currentQuestion.answer}. Пропускаете ход.`
            );
            this.gameState.setSkipTurns(currentPlayer.id, 1);
        }

        this.currentQuestion = null;
        this.nextTurn();
    }

    nextTurn() {
        this.gameState.nextPlayer();
        this.updateCurrentPlayerDisplay();
        document.getElementById('dice-result').textContent = '-';

        // Автоматический ход для бота
        const currentPlayer = this.gameState.getCurrentPlayer();
        if (currentPlayer && currentPlayer.isBot) {
            setTimeout(() => this.rollDice(), 1500);
        }
    }

    endGame(winner) {
        this.gameState.gameEnded = true;
        
        const stats = this.gameState.getStatistics();
        let resultsHTML = `<h3>🎉 Победитель: ${winner.name}!</h3><hr>`;
        
        stats.forEach(stat => {
            resultsHTML += `
                <div class="player-stat">
                    <strong>${stat.name}</strong><br>
                    Позиция: ${stat.position + 1}/120<br>
                    Точность: ${stat.accuracy}% (${stat.correctAnswers}/${stat.questionsAnswered})
                </div>
            `;
        });

        this.modalManager.showResults(resultsHTML);
    }

    updateGameDisplay() {
        if (this.canvasRenderer) {
            this.canvasRenderer.drawBoard(this.gameBoard);
            this.canvasRenderer.drawPlayers(this.gameState.players);
        }
        this.updatePlayersDisplay();
        this.updateCurrentPlayerDisplay();
    }

    updatePlayersDisplay() {
        const container = document.getElementById('players-list');
        if (!container) return;
        
        container.innerHTML = this.gameState.players.map(player => `
            <div class="player-item" style="border-left: 4px solid ${player.color}">
                <span>${player.name} ${player.isBot ? '(Бот)' : ''}</span>
                <span>Позиция: ${player.position + 1}</span>
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

    updateThemes(themes) {
        this.selectedThemes = new Set(themes);
    }

    resetGame() {
        this.gameState.reset();
        this.dice = null;
        this.currentQuestion = null;
        this.screenManager.showScreen('menu');
        
        // Очистка отображения
        const canvas = document.getElementById('game-board');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        console.log('Игра сброшена');
    }
}

