// Игра "Ходилка-приключение"
class AdventureGame {
    constructor() {
        this.questions = {};
        this.gameConfig = {
            rows: 12,
            cols: 10,
            cellSize: 60,
            cellPadding: 3,
            playerColors: ["#ff4444", "#4444ff", "#44ff44", "#ffaa00"]
        };
        this.specialCells = {
            15: {type: "ladder", target: 35},
            42: {type: "snake", target: 22},
            78: {type: "ladder", target: 94},
            115: {type: "snake", target: 85}
        };
        this.activeThemes = {
            math: true,
            geography: true,
            history: true,
            biology: true,
            riddles: true
        };
        this.currentScreen = 'main-menu';
        this.gameState = null;
        this.canvas = null;
        this.ctx = null;
        this.currentQuestion = null;
        
        this.init();
    }

    async init() {
        this.loadQuestions();
        this.setupEventListeners();
        this.showScreen('main-menu');
    }

    loadQuestions() {
        this.questions = {
            math: [
                {question: "Сколько будет 7 + 8?", answer: "15"},
                {question: "Сколько сторон у треугольника?", answer: "3"},
                {question: "Сколько минут в часе?", answer: "60"},
                {question: "Сколько будет 9 × 6?", answer: "54"},
                {question: "Сколько сантиметров в метре?", answer: "100"},
                {question: "Сколько будет 12 - 5?", answer: "7"},
                {question: "Сколько углов у квадрата?", answer: "4"},
                {question: "Сколько месяцев в году?", answer: "12"},
                {question: "Сколько дней в неделе?", answer: "7"},
                {question: "Сколько граммов в килограмме?", answer: "1000"}
            ],
            geography: [
                {question: "Столица России?", answer: "Москва"},
                {question: "Самый большой океан?", answer: "Тихий"},
                {question: "На каком материке находится Египет?", answer: "Африка"},
                {question: "Столица Франции?", answer: "Париж"},
                {question: "Самая длинная река в мире?", answer: "Нил"},
                {question: "Сколько материков на Земле?", answer: "6"},
                {question: "Самый большой материк?", answer: "Евразия"},
                {question: "Самая высокая гора в мире?", answer: "Эверест"},
                {question: "Самое глубокое озеро в мире?", answer: "Байкал"},
                {question: "Северная столица России?", answer: "Петербург"}
            ],
            history: [
                {question: "В каком году началась Великая Отечественная война?", answer: "1941"},
                {question: "Кто написал 'Война и мир'?", answer: "Толстой"},
                {question: "Столица Древней Руси?", answer: "Киев"},
                {question: "В каком веке жил Петр I?", answer: "17"},
                {question: "Кто открыл Америку?", answer: "Колумб"},
                {question: "Кто крестил Русь?", answer: "Владимир"},
                {question: "Первый русский царь?", answer: "Иван"},
                {question: "В каком году была Куликовская битва?", answer: "1380"},
                {question: "В каком году человек полетел в космос?", answer: "1961"},
                {question: "Кто изобрел радио?", answer: "Попов"}
            ],
            biology: [
                {question: "Сколько ног у паука?", answer: "8"},
                {question: "Самое большое животное в мире?", answer: "кит"},
                {question: "Что вырабатывают растения на свету?", answer: "кислород"},
                {question: "Сколько камер в сердце человека?", answer: "4"},
                {question: "Царь зверей?", answer: "лев"},
                {question: "Самое быстрое животное?", answer: "гепард"},
                {question: "Где живут пингвины?", answer: "Антарктида"},
                {question: "Из чего растения получают энергию?", answer: "солнце"},
                {question: "Сколько пальцев на руке?", answer: "5"},
                {question: "Главный орган кровообращения?", answer: "сердце"}
            ],
            riddles: [
                {question: "Зимой и летом одним цветом", answer: "ёлка"},
                {question: "Висит груша - нельзя скушать", answer: "лампочка"},
                {question: "Без рук, без ног, а рисовать умеет", answer: "мороз"},
                {question: "Течет, течет - не вытечет", answer: "река"},
                {question: "Сто одежек и все без застежек", answer: "капуста"},
                {question: "Два конца, два кольца, посередине гвоздик", answer: "ножницы"},
                {question: "Не лает, не кусает, а в дом не пускает", answer: "замок"},
                {question: "Красна девица сидит в темнице, а коса на улице", answer: "морковь"},
                {question: "Круглое, румяное, я расту на ветке", answer: "яблоко"},
                {question: "Шумит он в поле и в саду, а в дом не попадет", answer: "ветер"}
            ]
        };
    }

    setupEventListeners() {
        // Главное меню
        document.getElementById('new-game-btn').addEventListener('click', () => this.showScreen('player-setup-screen'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen('settings-screen'));
        document.getElementById('rules-btn').addEventListener('click', () => this.showScreen('rules-screen'));

        // Настройки
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showScreen('main-menu'));

        // Правила - исправлен обработчик
        document.getElementById('back-from-rules-btn').addEventListener('click', () => this.showScreen('main-menu'));

        // Выбор игроков
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.startGame(parseInt(e.target.dataset.players)));
        });
        document.getElementById('back-from-setup-btn').addEventListener('click', () => this.showScreen('main-menu'));

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
            players.push({
                id: i,
                name: playerNames[i],
                color: this.gameConfig.playerColors[i],
                position: 0,
                isBot: false
            });
        }

        // Добавляем ботов если играет 1 игрок
        if (count === 1) {
            const botCount = Math.floor(Math.random() * 3) + 1; // 1-3 бота
            for (let i = 0; i < botCount; i++) {
                players.push({
                    id: count + i,
                    name: botNames[i],
                    color: this.gameConfig.playerColors[count + i],
                    position: 0,
                    isBot: true
                });
            }
        }

        return players;
    }

    createGameBoard() {
        const board = [];
        const totalCells = this.gameConfig.rows * this.gameConfig.cols;
        
        for (let i = 0; i <= totalCells; i++) {
            const coords = this.getCellCoordinates(i);
            board.push({
                id: i,
                x: coords.x,
                y: coords.y,
                isJump: this.specialCells.hasOwnProperty(i),
                jumpInfo: this.specialCells[i] || null
            });
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
            if (this.specialCells[i]) {
                cellColor = this.specialCells[i].type === 'ladder' ? '#4CAF50' : '#f44336';
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
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(i.toString(), x + this.gameConfig.cellSize / 2, y + 12);
            
            // Рисуем стрелки для прыжков
            if (this.specialCells[i]) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 16px Arial';
                const arrow = this.specialCells[i].type === 'ladder' ? '↑' : '↓';
                this.ctx.fillText(arrow, x + this.gameConfig.cellSize / 2, y + this.gameConfig.cellSize / 2 + 5);
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
                const offsetX = (index % 2) * 12 + 8;
                const offsetY = Math.floor(index / 2) * 12 + 20;
                
                this.ctx.fillStyle = player.color;
                this.ctx.beginPath();
                this.ctx.arc(baseX + offsetX, baseY + offsetY, 6, 0, 2 * Math.PI);
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 1;
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
                <div class="player-color" style="background-color: ${player.color}"></div>
                <div>
                    <div class="player-name">${player.name}</div>
                    <div class="player-position">Клетка: ${player.position}</div>
                </div>
            `;
            
            playersList.appendChild(playerDiv);
        });
        
        // Включаем/выключаем кнопку кубика
        const rollBtn = document.getElementById('roll-dice-btn');
        rollBtn.disabled = !this.gameState.isGameActive;
    }

    rollDice() {
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
        
        const diceResult = Math.floor(Math.random() * 6) + 1;
        document.querySelector('.dice-result').textContent = diceResult;
        
        // Отключаем кнопку кубика на время хода
        document.getElementById('roll-dice-btn').disabled = true;
        
        // Перемещаем игрока
        setTimeout(() => {
            this.movePlayer(currentPlayer, diceResult);
        }, 500);
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
        if (this.specialCells[newPosition]) {
            setTimeout(() => {
                player.position = this.specialCells[newPosition].target;
                this.drawBoard();
                this.updateUI();
                
                // Проверяем победу после прыжка
                if (player.position >= 120) {
                    this.endGame(player);
                } else {
                    // Включаем кнопку кубика обратно
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
            // Бот отвечает автоматически
            const isCorrect = Math.random() > 0.3; // 70% вероятность правильного ответа
            if (!isCorrect) {
                this.gameState.skipNextTurn[player.id] = true;
            }
            // Включаем кнопку кубика обратно
            document.getElementById('roll-dice-btn').disabled = false;
            this.nextPlayer();
            return;
        }
        
        const question = this.getRandomQuestion();
        if (!question) {
            // Включаем кнопку кубика обратно
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
            math: '🧮 Математика',
            geography: '🌍 География',
            history: '📚 История',
            biology: '🌿 Биология',
            riddles: '💡 Загадки'
        };
        return themeNames[themeKey] || themeKey;
    }

    submitAnswer() {
        if (!this.currentQuestion) return;
        
        const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();
        const correctAnswer = this.currentQuestion.answer.toLowerCase();
        
        // Более гибкая проверка ответов
        const isCorrect = userAnswer === correctAnswer || 
            userAnswer.includes(correctAnswer) || 
            correctAnswer.includes(userAnswer);
        
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
        // Включаем кнопку кубика обратно
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
        
        // Включаем кнопку кубика обратно
        document.getElementById('roll-dice-btn').disabled = false;
    }

    exitGame() {
        if (confirm('Вы уверены, что хотите выйти из игры?')) {
            this.showScreen('main-menu');
            // Сбрасываем состояние игры
            this.gameState = null;
        }
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    new AdventureGame();
});