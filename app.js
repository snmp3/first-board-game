// app.js

// Игра "Ходилка-приключение"
class AdventureGame {
    constructor() {
        this.questions = {};
        this.gameConfig = {
            rows: 12,
            cols: 10,
            cellSize: 60,
            cellPadding: 3,
            playerColors: ["#ff4444", "#4444ff", "#44ff44", "#ffff44"]
        };
        this.jumpCells = {
            15: {type: "up", target: 35},
            42: {type: "down", target: 22},
            55: {type: "down", target: 25},
            78: {type: "up", target: 94},
            87: {type: "down", target: 67},
            115: {type: "down", target: 85}
        };
        // По умолчанию включены только математика и загадки
        this.activeThemes = {
            mathematics: true,
            geography: false,
            history: false,
            biology: false,
            riddles: true
        };
        this.botDifficulty = {
            easy: { name: "Легкий", successRate: 0.3, thinkTime: [2000, 3000] },
            medium: { name: "Средний", successRate: 0.6, thinkTime: [1500, 2500] },
            hard: { name: "Сложный", successRate: 0.85, thinkTime: [1000, 2000] }
        };
        this.selectedDifficulty = "medium"; // По умолчанию средняя сложность
        this.currentScreen = 'main-menu';
        this.gameState = null;
        this.canvas = null;
        this.ctx = null;
        this.currentQuestion = null;
        this.playerCount = 0;
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
        this.loadSettings();
        this.showScreen('main-menu');
    }

    // Загрузка вопросов из внешних файлов
    async loadQuestions() {
        const themeFiles = {
            mathematics: 'matematika-questions.md',
            geography: 'geografiya-questions.md',
            history: 'istoriya-questions.md',
            biology: 'biologiya-questions.md',
            riddles: 'zagadki-questions.md'
        };
        this.questions = {};
        const themeNames = Object.keys(themeFiles);
        for (const theme of themeNames) {
            try {
                const response = await fetch(themeFiles[theme]);
                if (!response.ok) {
                    console.error(`Ошибка загрузки файла вопросов для темы ${theme}: ${response.status}`);
                    this.questions[theme] = [];
                    continue;
                }
                const text = await response.text();
                this.questions[theme] = this.parseQuestionsFromMarkdown(text);
            } catch (e) {
                console.error(`Ошибка загрузки или обработки вопросов для темы ${theme}:`, e);
                this.questions[theme] = [];
            }
        }
    }

    // Парсинг вопросов из Markdown
    parseQuestionsFromMarkdown(mdText) {
        const lines = mdText.split('\n');
        const questions = [];
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#') || line.startsWith('##')) continue;
            if (line.startsWith('-')) line = line.slice(1).trim();
            const sep = line.indexOf('|');
            if (sep > 0) {
                const question = line.slice(0, sep).replace(/[.?!]$/, '').trim();
                const answer = line.slice(sep + 1).trim();
                if (question && answer) {
                    questions.push({ question, answer });
                }
            }
        }
        return questions;
    }

    setupEventListeners() {
        // Главное меню
        document.getElementById('new-game-btn').addEventListener('click', () => this.showScreen('player-setup-screen'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen('settings-screen'));
        document.getElementById('rules-btn').addEventListener('click', () => this.showScreen('rules-screen'));
        // Настройки
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showScreen('main-menu'));
        // Правила
        document.getElementById('back-from-rules-btn').addEventListener('click', () => this.showScreen('main-menu'));
        // Выбор игроков
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerCount = parseInt(e.target.dataset.players);
                this.playerCount = playerCount;
                if (playerCount === 1) {
                    this.showScreen('bot-difficulty-screen');
                } else {
                    this.startGame(playerCount);
                }
            });
        });
        document.getElementById('back-from-setup-btn').addEventListener('click', () => this.showScreen('main-menu'));
        // Выбор сложности ботов
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedDifficulty = e.target.closest('.difficulty-btn').dataset.difficulty;
                this.startGame(this.playerCount);
            });
        });
        document.getElementById('back-from-difficulty-btn').addEventListener('click', () => this.showScreen('player-setup-screen'));
        // Игра
        document.getElementById('roll-dice-btn').addEventListener('click', () => this.rollDice());
        document.getElementById('exit-game-btn').addEventListener('click', () => this.exitGame());
        // Модальные окна
        document.getElementById('submit-answer-btn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('continue-game-btn').addEventListener('click', () => this.continueGame());
        document.getElementById('new-game-from-victory-btn').addEventListener('click', () => this.showScreen('player-setup-screen'));
        document.getElementById('menu-from-victory-btn').addEventListener('click', () => this.showScreen('main-menu'));
        // Enter для отправки ответа
        document.getElementById('answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        if (screenId === 'settings-screen') {
            this.updateSettingsUI();
        }
    }

    updateSettingsUI() {
        Object.keys(this.activeThemes).forEach(theme => {
            const checkbox = document.getElementById(theme);
            if (checkbox) {
                checkbox.checked = this.activeThemes[theme];
            }
        });
    }

    saveSettings() {
        Object.keys(this.activeThemes).forEach(theme => {
            const checkbox = document.getElementById(theme);
            if (checkbox) {
                this.activeThemes[theme] = checkbox.checked;
            }
        });
        // Проверяем, что хотя бы одна тема выбрана
        const hasActiveTheme = Object.values(this.activeThemes).some(active => active);
        if (!hasActiveTheme) {
            alert('Выберите хотя бы одну тему!');
            return;
        }
        this.showScreen('main-menu');
    }

    loadSettings() {
        // Настройки по умолчанию уже установлены в конструкторе
    }

    startGame(playerCount) {
        const hasActiveTheme = Object.values(this.activeThemes).some(active => active);
        if (!hasActiveTheme) {
            alert('Сначала выберите темы в настройках!');
            return;
        }
        this.gameState = {
            players: this.createPlayers(playerCount),
            currentPlayerIndex: 0,
            gameBoard: this.createGameBoard(),
            isGameActive: true,
            skipNextTurn: {}
        };
        this.showScreen('game-screen');
        this.setupCanvas();
        this.updateUI();
    }

    createPlayers(count) {
        const players = [];
        const playerNames = ['Игрок 1', 'Игрок 2', 'Игрок 3', 'Игрок 4'];
        const botNames = ['Бот 1', 'Бот 2', 'Бот 3'];
        for (let i = 0; i < count; i++) {
            players.push({ id: i, name: playerNames[i], color: this.gameConfig.playerColors[i], position: 0, isBot: false });
        }
        // Добавляем ботов если играет 1 игрок
        if (count === 1) {
            const botCount = Math.floor(Math.random() * 3) + 1; // 1-3 бота
            for (let i = 0; i < botCount; i++) {
                players.push({ id: count + i, name: botNames[i], color: this.gameConfig.playerColors[count + i], position: 0, isBot: true });
            }
        }
        return players;
    }

    createGameBoard() {
        const board = [];
        const totalCells = this.gameConfig.rows * this.gameConfig.cols;
        for (let i = 0; i <= totalCells; i++) {
            const coords = this.getCellCoordinates(i);
            board.push({ id: i, x: coords.x, y: coords.y, isJump: this.jumpCells.hasOwnProperty(i), jumpInfo: this.jumpCells[i] || null });
        }
        return board;
    }

    getCellCoordinates(cellIndex) {
        if (cellIndex === 0) return { x: -1, y: -1 }; // Старт вне поля
        const adjustedIndex = cellIndex - 1;
        const row = Math.floor(adjustedIndex / this.gameConfig.cols);
        let col = adjustedIndex % this.gameConfig.cols;
        // Зигзаг: четные ряды слева направо, нечетные справа налево
        if (row % 2 === 1) {
            col = this.gameConfig.cols - 1 - col;
        }
        return { x: col, y: this.gameConfig.rows - 1 - row };
    }

    setupCanvas() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        const canvasWidth = this.gameConfig.cols * (this.gameConfig.cellSize + this.gameConfig.cellPadding) - this.gameConfig.cellPadding;
        const canvasHeight = this.gameConfig.rows * (this.gameConfig.cellSize + this.gameConfig.cellPadding) - this.gameConfig.cellPadding;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.drawBoard();
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Рисуем клетки
        for (let i = 1; i <= 120; i++) {
            const coords = this.getCellCoordinates(i);
            const x = coords.x * (this.gameConfig.cellSize + this.gameConfig.cellPadding);
            const y = coords.y * (this.gameConfig.cellSize + this.gameConfig.cellPadding);
            // Определяем цвет клетки
            let cellColor = '#f0f0f0';
            if (this.jumpCells[i]) {
                cellColor = this.jumpCells[i].type === 'up' ? '#4CAF50' : '#f44336';
            }
            // Рисуем клетку
            this.ctx.fillStyle = cellColor;
            this.ctx.fillRect(x, y, this.gameConfig.cellSize, this.gameConfig.cellSize);
            // Рисуем границу
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, this.gameConfig.cellSize, this.gameConfig.cellSize);
            // Рисуем номер клетки
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(i.toString(), x + this.gameConfig.cellSize / 2, y + 15);
            // Рисуем стрелки для прыжков
            if (this.jumpCells[i]) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 20px Arial';
                const arrow = this.jumpCells[i].type === 'up' ? '↑' : '↓';
                this.ctx.fillText(arrow, x + this.gameConfig.cellSize / 2, y + this.gameConfig.cellSize / 2 + 7);
            }
        }
        // Рисуем игроков
        this.drawPlayers();
    }

    drawPlayers() {
        this.gameState.players.forEach((player, index) => {
            if (player.position > 0) {
                const coords = this.getCellCoordinates(player.position);
                const baseX = coords.x * (this.gameConfig.cellSize + this.gameConfig.cellPadding);
                const baseY = coords.y * (this.gameConfig.cellSize + this.gameConfig.cellPadding);
                // Смещение для нескольких игроков на одной клетке
                const offsetX = (index % 2) * 15 + 10;
                const offsetY = Math.floor(index / 2) * 15 + 25;
                this.ctx.fillStyle = player.color;
                this.ctx.beginPath();
                this.ctx.arc(baseX + offsetX, baseY + offsetY, 8, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    updateUI() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        // Обновляем информацию о текущем игроке
        document.querySelector('.player-indicator').style.backgroundColor = currentPlayer.color;
        document.querySelector('.player-name').textContent = currentPlayer.name;
        // Обновляем список игроков
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '';
        this.gameState.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            if (index === this.gameState.currentPlayerIndex) {
                playerDiv.classList.add('current');
            }
            if (this.gameState.skipNextTurn[player.id]) {
                playerDiv.classList.add('skipped');
            }
            playerDiv.innerHTML = `
                <span class="player-indicator" style="background:${player.color}"></span>
                <span class="player-name">${player.name}</span>
                <span class="player-pos">Клетка: ${player.position}</span>
                ${player.isBot ? '<span class="bot-label">🤖</span>' : ''}
                ${this.gameState.skipNextTurn[player.id] ? '<span class="skip-label">😴</span>' : ''}
            `;
            playersList.appendChild(playerDiv);
        });
        
        // ИСПРАВЛЕНО: включаем кнопку кубика
        const rollBtn = document.getElementById('roll-dice-btn');
        rollBtn.disabled = false;
		// ... (остальной UI)
    }
	rollDice() {Add commentMore actions
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        
        // Проверяем, нужно ли пропустить ход
        if (this.gameState.skipNextTurn[currentPlayer.id]) {
            delete this.gameState.skipNextTurn[currentPlayer.id];
            document.querySelector('.dice-result').textContent = "Пропуск";
            setTimeout(() => {
                this.nextPlayer();
            }, 1000);
            return;
        }
        
        // Отключаем кнопку на время хода
        document.getElementById('roll-dice-btn').disabled = true;
        
        const diceResult = Math.floor(Math.random() * 6) + 1;
        document.querySelector('.dice-result').textContent = diceResult;
        
        // Перемещаем игрока
        setTimeout(() => {
            this.movePlayer(currentPlayer, diceResult);
        }, 800);
    }

    movePlayer(player, steps) {
        const newPosition = Math.min(player.position + steps, 120);
        player.position = newPosition;
        
        this.drawBoard();
        this.updateUI();
        
        // Проверяем победу
        if (newPosition >= 120) {
            setTimeout(() => {
                this.endGame(player);
            }, 500);
            return;
        }
        
        // Проверяем прыжки
        if (this.jumpCells[newPosition]) {
            setTimeout(() => {
                player.position = this.jumpCells[newPosition].target;
                this.drawBoard();
                this.updateUI();
                
                // Проверяем победу после прыжка
                if (player.position >= 120) {
                    this.endGame(player);
                } else {
                    // Включаем кнопку обратно
                    document.getElementById('roll-dice-btn').disabled = false;
                    this.nextPlayer();
                }
            }, 1000);
        } else {
            // Задаем вопрос
            setTimeout(() => {
                this.askQuestion(player);
            }, 500);
        }
    }

    askQuestion(player) {
        if (player.isBot) {
            // Получаем настройки бота в зависимости от выбранной сложности
            const botSettings = this.botDifficulty[this.selectedDifficulty];
            
            // Расчет случайного времени "размышления" бота
            const minTime = botSettings.thinkTime[0];
            const maxTime = botSettings.thinkTime[1];
            const thinkTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
            
            // Определяем успешность ответа бота на основе его шанса
            const isCorrect = Math.random() < botSettings.successRate;
            
            // Симулируем время обдумывания для бота
            setTimeout(() => {
                if (!isCorrect) {
                    this.gameState.skipNextTurn[player.id] = true;
                }
                document.getElementById('roll-dice-btn').disabled = false;
                this.nextPlayer();
            }, thinkTime);
            
            return;
        }
        
        const question = this.getRandomQuestion();
        if (!question) {
            document.getElementById('roll-dice-btn').disabled = false;
            this.nextPlayer();
            return;
        }
        
        this.currentQuestion = question;
        
        // Показываем модальное окно с вопросом
        document.querySelector('.question-theme').textContent = this.getThemeName(question.theme);
        document.querySelector('.question-text').textContent = question.question;
        document.getElementById('answer-input').value = '';
        document.getElementById('question-modal').classList.add('active');
        
        // Фокус на поле ввода
        setTimeout(() => {
            document.getElementById('answer-input').focus();
        }, 100);
    }

    getRandomQuestion() {
        const activeThemeNames = Object.keys(this.activeThemes).filter(theme => this.activeThemes[theme]);
        if (activeThemeNames.length === 0) return null;
        
        const randomTheme = activeThemeNames[Math.floor(Math.random() * activeThemeNames.length)];
        const themeQuestions = this.questions[randomTheme];
        
        if (!themeQuestions || themeQuestions.length === 0) return null;
        
        const randomQuestion = themeQuestions[Math.floor(Math.random() * themeQuestions.length)];
        
        return {
            ...randomQuestion,
            theme: randomTheme
        };
    }

    getThemeName(themeKey) {
        const themeNames = {
            mathematics: '🧮 Математика',
            geography: '🌍 География',
            history: '📚 История',
            biology: '🍃 Биология',
            riddles: '💡 Загадки'
        };
        return themeNames[themeKey] || themeKey;
    }

    submitAnswer() {
        if (!this.currentQuestion) return;
        
        const userAnswer = document.getElementById('answer-input').value;
        const correctAnswer = this.currentQuestion.answer;
        
        // ИСПРАВЛЕНО: пустые ответы считаются неправильными
        // Проверяем, что ответ не пустой и не состоит только из пробелов
        const isEmptyAnswer = userAnswer.trim() === '';
        
        // Сравниваем нормализованные ответы (приведенные к нижнему регистру и без лишних пробелов)
        const isCorrect = !isEmptyAnswer && 
                          userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        
        // Скрываем модальное окно с вопросом
        document.getElementById('question-modal').classList.remove('active');
        
        // Показываем результат
        this.showResult(isCorrect, this.currentQuestion.answer);
    }

    showResult(isCorrect, correctAnswer) {
        const resultModal = document.getElementById('result-modal');
        const resultIcon = document.querySelector('.result-icon');
        const resultText = document.querySelector('.result-text');
        const correctAnswerDiv = document.querySelector('.correct-answer');
        
        if (isCorrect) {
            resultIcon.textContent = '✅';
            resultText.textContent = 'Правильно!';
            resultText.style.color = '#4CAF50';
            correctAnswerDiv.style.display = 'none';
        } else {
            resultIcon.textContent = '❌';
            resultText.textContent = 'Неправильно!';
            resultText.style.color = '#f44336';
            correctAnswerDiv.textContent = `Правильный ответ: ${correctAnswer}`;
            correctAnswerDiv.style.display = 'block';
            
            // Игрок пропускает следующий ход
            const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
            this.gameState.skipNextTurn[currentPlayer.id] = true;
        }
        
        resultModal.classList.add('active');
    }

    continueGame() {
        document.getElementById('result-modal').classList.remove('active');
        document.getElementById('roll-dice-btn').disabled = false;
        this.nextPlayer();
    }

    nextPlayer() {
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
        this.updateUI();
        
        // Если следующий игрок - бот, делаем его ход автоматически
        const nextPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        if (nextPlayer.isBot && this.gameState.isGameActive) {
            setTimeout(() => {
                this.rollDice();
            }, 1500);
        }
    }

    endGame(winner) {
        this.gameState.isGameActive = false;
        
        // Показываем модальное окно победы
        document.querySelector('.winner-color').style.backgroundColor = winner.color;
        document.querySelector('.winner-text').textContent = `${winner.name} победил!`;
        document.getElementById('victory-modal').classList.add('active');
    }

    exitGame() {
        if (confirm('Вы уверены, что хотите выйти из игры?')) {
            this.showScreen('main-menu');
        }
    }
    // ... (остальной код игры)
}

// Запуск игры
window.addEventListener('DOMContentLoaded', () => {
    window.game = new AdventureGame();
});
