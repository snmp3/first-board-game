// Игра "Ходилка-приключение"
class AdventureGame {
    constructor() {
        this.questions = {};
        this.gameSettings = {
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
        this.activeThemes = {
            matematika: true,
            geografiya: true,
            istoriya: true,
            biologiya: true,
            zagadki: true
        };
        this.currentScreen = 'main-menu';
        this.gameState = null;
        this.canvas = null;
        this.ctx = null;
        this.selectedPlayerCount = 0;
        this.playerNames = [];
        
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
        this.loadSettings();
        this.showScreen('main-menu');
    }

    async loadQuestions() {
        // Загружаем вопросы из предоставленных данных
        this.questions = {
            matematika: [
                {question: "Сколько будет 7 + 8?", answer: "15"},
                {question: "Сколько будет 12 - 5?", answer: "7"},
                {question: "Сколько будет 6 × 4?", answer: "24"},
                {question: "Сколько углов у треугольника?", answer: "3"},
                {question: "Сколько сторон у квадрата?", answer: "4"},
                {question: "Сколько месяцев в году?", answer: "12"},
                {question: "Сколько дней в неделе?", answer: "7"},
                {question: "Сколько часов в сутках?", answer: "24"},
                {question: "Сколько сантиметров в метре?", answer: "100"},
                {question: "Сколько граммов в килограмме?", answer: "1000"}
            ],
            geografiya: [
                {question: "Какая столица России?", answer: "Москва"},
                {question: "Какая столица Франции?", answer: "Париж"},
                {question: "Сколько материков на Земле?", answer: "6"},
                {question: "Самый большой материк?", answer: "Евразия"},
                {question: "Самый большой океан?", answer: "Тихий"},
                {question: "Самая длинная река в мире?", answer: "Нил"},
                {question: "Самая высокая гора в мире?", answer: "Эверест"},
                {question: "Самое глубокое озеро в мире?", answer: "Байкал"},
                {question: "Самая жаркая пустыня?", answer: "Сахара"},
                {question: "Северная столица России?", answer: "Петербург"}
            ],
            istoriya: [
                {question: "Кто крестил Русь?", answer: "Владимир"},
                {question: "Первый русский царь?", answer: "Иван Грозный"},
                {question: "Кто основал Москву?", answer: "Юрий Долгорукий"},
                {question: "Кто такой Суворов?", answer: "полководец"},
                {question: "В каком году была Куликовская битва?", answer: "1380"},
                {question: "В каком веке жил Пушкин?", answer: "19"},
                {question: "В каком году человек полетел в космос?", answer: "1961"},
                {question: "Кто изобрел радио?", answer: "Попов"},
                {question: "Где находится Эрмитаж?", answer: "Петербург"},
                {question: "Где стоит памятник Минину и Пожарскому?", answer: "Москва"}
            ],
            biologiya: [
                {question: "Самое большое животное на Земле?", answer: "кит"},
                {question: "Самое быстрое животное?", answer: "гепард"},
                {question: "Царь зверей?", answer: "лев"},
                {question: "Где живут пингвины?", answer: "Антарктида"},
                {question: "Сколько ног у паука?", answer: "8"},
                {question: "Из чего растения получают энергию?", answer: "солнце"},
                {question: "Какой газ выделяют растения?", answer: "кислород"},
                {question: "Сколько пальцев на руке?", answer: "5"},
                {question: "Главный орган кровообращения?", answer: "сердце"},
                {question: "Сколько времен года?", answer: "4"}
            ],
            zagadki: [
                {question: "Рыжая плутовка, хитрая и ловкая", answer: "лиса"},
                {question: "Косолапый и большой, спит в берлоге он зимой", answer: "медведь"},
                {question: "Два конца, два кольца, посередине гвоздик", answer: "ножницы"},
                {question: "Не лает, не кусает, а в дом не пускает", answer: "замок"},
                {question: "Сидит дед во сто шуб одет, кто его раздевает, тот слезы проливает", answer: "лук"},
                {question: "Красна девица сидит в темнице, а коса на улице", answer: "морковь"},
                {question: "Круглое, румяное, я расту на ветке", answer: "яблоко"},
                {question: "Шумит он в поле и в саду, а в дом не попадет", answer: "ветер"},
                {question: "Без крыльев летят, без ног бегут, без паруса плывут", answer: "облака"},
                {question: "Двенадцать братьев друг за другом бродят, друг друга не обходят", answer: "месяцы"}
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

        // Правила
        document.getElementById('back-from-rules-btn').addEventListener('click', () => this.showScreen('main-menu'));

        // Выбор игроков
        document.querySelectorAll('.player-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPlayerCount(parseInt(e.target.dataset.players)));
        });
        document.getElementById('back-from-setup-btn').addEventListener('click', () => this.showScreen('main-menu'));

        // НОВЫЙ: Ввод имен игроков
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGameWithNames());
        document.getElementById('back-from-names-btn').addEventListener('click', () => this.showScreen('player-setup-screen'));

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
            document.getElementById(theme).checked = this.activeThemes[theme];
        });
    }

    saveSettings() {
        Object.keys(this.activeThemes).forEach(theme => {
            this.activeThemes[theme] = document.getElementById(theme).checked;
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

    // НОВЫЙ МЕТОД: Выбор количества игроков и переход к вводу имен
    selectPlayerCount(playerCount) {
        const hasActiveTheme = Object.values(this.activeThemes).some(active => active);
        if (!hasActiveTheme) {
            alert('Сначала выберите темы в настройках!');
            return;
        }

        this.selectedPlayerCount = playerCount;
        this.setupNamesForm();
        this.showScreen('names-setup-screen');
    }

    // НОВЫЙ МЕТОД: Создание формы для ввода имен
    setupNamesForm() {
        const form = document.getElementById('player-names-form');
        form.innerHTML = '';

        for (let i = 0; i < this.selectedPlayerCount; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-name-input';
            
            playerDiv.innerHTML = `
                <div class="player-color-indicator" style="background-color: ${this.gameSettings.playerColors[i]}"></div>
                <div class="player-name-field">
                    <label class="form-label">Имя игрока ${i + 1}</label>
                    <input type="text" class="form-control player-name-input-field" 
                           placeholder="Игрок ${i + 1}" 
                           maxlength="15"
                           data-player-index="${i}">
                </div>
            `;
            
            form.appendChild(playerDiv);
        }

        // Добавляем обработчики для валидации
        const nameInputs = form.querySelectorAll('.player-name-input-field');
        nameInputs.forEach(input => {
            input.addEventListener('input', (e) => this.validateNameInput(e.target));
        });

        // Фокус на первое поле
        if (nameInputs.length > 0) {
            nameInputs[0].focus();
        }
    }

    // НОВЫЙ МЕТОД: Валидация ввода имени
    validateNameInput(input) {
        const value = input.value.trim();
        if (value.length > 15) {
            input.value = value.substring(0, 15);
        }
    }

    // НОВЫЙ МЕТОД: Сбор имен и старт игры
    startGameWithNames() {
        const nameInputs = document.querySelectorAll('.player-name-input-field');
        this.playerNames = [];

        nameInputs.forEach((input, index) => {
            const name = input.value.trim();
            this.playerNames.push(name || `Игрок ${index + 1}`);
        });

        this.startGame(this.selectedPlayerCount);
    }

    startGame(playerCount) {
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

    // МОДИФИЦИРОВАННЫЙ МЕТОД: Создание игроков с введенными именами
    createPlayers(count) {
        const players = [];
        const botNames = ['Бот 1', 'Бот 2', 'Бот 3'];
        
        for (let i = 0; i < count; i++) {
            players.push({
                id: i,
                name: this.playerNames[i] || `Игрок ${i + 1}`,
                color: this.gameSettings.playerColors[i],
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
                    color: this.gameSettings.playerColors[count + i],
                    position: 0,
                    isBot: true
                });
            }
        }

        return players;
    }

    createGameBoard() {
        const board = [];
        const totalCells = this.gameSettings.rows * this.gameSettings.cols;
        
        for (let i = 0; i <= totalCells; i++) {
            const coords = this.getCellCoordinates(i);
            board.push({
                id: i,
                x: coords.x,
                y: coords.y,
                isJump: this.jumpCells.hasOwnProperty(i),
                jumpInfo: this.jumpCells[i] || null
            });
        }
        
        return board;
    }

    getCellCoordinates(cellIndex) {
        if (cellIndex === 0) return { x: -1, y: -1 }; // Старт вне поля

        const adjustedIndex = cellIndex - 1;
        const row = Math.floor(adjustedIndex / this.gameSettings.cols);
        let col = adjustedIndex % this.gameSettings.cols;
        
        // Зигзаг: четные ряды слева направо, нечетные справа налево
        if (row % 2 === 1) {
            col = this.gameSettings.cols - 1 - col;
        }
        
        return { x: col, y: this.gameSettings.rows - 1 - row };
    }

    setupCanvas() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        
        const canvasWidth = this.gameSettings.cols * (this.gameSettings.cellSize + this.gameSettings.cellPadding) - this.gameSettings.cellPadding;
        const canvasHeight = this.gameSettings.rows * (this.gameSettings.cellSize + this.gameSettings.cellPadding) - this.gameSettings.cellPadding;
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        this.drawBoard();
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем клетки
        for (let i = 1; i <= 120; i++) {
            const coords = this.getCellCoordinates(i);
            const x = coords.x * (this.gameSettings.cellSize + this.gameSettings.cellPadding);
            const y = coords.y * (this.gameSettings.cellSize + this.gameSettings.cellPadding);
            
            // Определяем цвет клетки
            let cellColor = '#f0f0f0';
            if (this.jumpCells[i]) {
                cellColor = this.jumpCells[i].type === 'up' ? '#4CAF50' : '#f44336';
            }
            
            // Рисуем клетку
            this.ctx.fillStyle = cellColor;
            this.ctx.fillRect(x, y, this.gameSettings.cellSize, this.gameSettings.cellSize);
            
            // Рисуем границу
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, this.gameSettings.cellSize, this.gameSettings.cellSize);
            
            // Рисуем номер клетки
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(i.toString(), x + this.gameSettings.cellSize / 2, y + 15);
            
            // Рисуем стрелки для прыжков
            if (this.jumpCells[i]) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 20px Arial';
                const arrow = this.jumpCells[i].type === 'up' ? '↑' : '↓';
                this.ctx.fillText(arrow, x + this.gameSettings.cellSize / 2, y + this.gameSettings.cellSize / 2 + 7);
            }
        }
        
        // Рисуем игроков
        this.drawPlayers();
    }

    drawPlayers() {
        this.gameState.players.forEach((player, index) => {
            if (player.position > 0) {
                const coords = this.getCellCoordinates(player.position);
                const baseX = coords.x * (this.gameSettings.cellSize + this.gameSettings.cellPadding);
                const baseY = coords.y * (this.gameSettings.cellSize + this.gameSettings.cellPadding);
                
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
                <div class="player-color" style="background-color: ${player.color}"></div>
                <div class="player-name">${player.name}</div>
                <div class="player-position">Клетка: ${player.position}</div>
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
            this.nextPlayer();
            return;
        }
        
        const diceResult = Math.floor(Math.random() * 6) + 1;
        document.querySelector('.dice-result').textContent = diceResult;
        
        // Перемещаем игрока
        this.movePlayer(currentPlayer, diceResult);
    }

    movePlayer(player, steps) {
        const newPosition = Math.min(player.position + steps, 120);
        player.position = newPosition;
        
        // Проверяем победу
        if (newPosition >= 120) {
            this.endGame(player);
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
                    this.nextPlayer();
                }
            }, 1000);
        } else {
            // Задаем вопрос
            this.askQuestion(player);
        }
        
        this.drawBoard();
        this.updateUI();
    }

    askQuestion(player) {
        if (player.isBot) {
            // Бот отвечает автоматически
            const isCorrect = Math.random() > 0.3; // 70% вероятность правильного ответа
            setTimeout(() => {
                if (!isCorrect) {
                    this.gameState.skipNextTurn[player.id] = true;
                }
                this.nextPlayer();
            }, 1000);
            return;
        }
        
        const question = this.getRandomQuestion();
        if (!question) {
            this.nextPlayer();
            return;
        }
        
        this.currentQuestion = question;
        
        // Показываем модальное окно с вопросом
        document.querySelector('.question-theme').textContent = this.getThemeName(question.theme);
        document.querySelector('.question-text').textContent = question.question;
        document.getElementById('answer-input').value = '';
        document.getElementById('question-modal').classList.add('active');
        document.getElementById('answer-input').focus();
    }

    getRandomQuestion() {
        const activeThemeNames = Object.keys(this.activeThemes).filter(theme => this.activeThemes[theme]);
        if (activeThemeNames.length === 0) return null;
        
        const randomTheme = activeThemeNames[Math.floor(Math.random() * activeThemeNames.length)];
        const themeQuestions = this.questions[randomTheme];
        const randomQuestion = themeQuestions[Math.floor(Math.random() * themeQuestions.length)];
        
        return {
            ...randomQuestion,
            theme: randomTheme
        };
    }

    getThemeName(themeKey) {
        const themeNames = {
            matematika: '📊 Математика',
            geografiya: '🌍 География',
            istoriya: '📜 История',
            biologiya: '🧬 Биология',
            zagadki: '🧩 Загадки'
        };
        return themeNames[themeKey] || themeKey;
    }

    submitAnswer() {
        const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();
        const correctAnswer = this.currentQuestion.answer.toLowerCase();
        
        const isCorrect = userAnswer === correctAnswer;
        
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
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    new AdventureGame();
});