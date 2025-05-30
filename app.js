// Конфигурация игры
const GAME_CONFIG = {
  boardSize: 120,
  jumpUpCells: [15, 28, 42, 55, 67, 79, 91, 103],
  jumpDownCells: [22, 36, 48, 61, 74, 87, 99, 112],
  jumpRanges: {
    up: { min: 3, max: 7 },
    down: { min: 2, max: 5 }
  }
};

const CARDS = [
  {
    type: "math",
    question: "Сколько будет 7 + 5?",
    answer: "12",
    options: ["10", "11", "12", "13"]
  },
  {
    type: "math",
    question: "Сколько будет 15 - 8?",
    answer: "7",
    options: ["6", "7", "8", "9"]
  },
  {
    type: "riddle",
    question: "Что можно увидеть с закрытыми глазами?",
    answer: "сон"
  },
  {
    type: "knowledge",
    question: "Какой самый большой океан на Земле?",
    answer: "Тихий",
    options: ["Атлантический", "Тихий", "Индийский", "Северный Ледовитый"]
  },
  {
    type: "math",
    question: "Сколько будет 6 × 4?",
    answer: "24",
    options: ["20", "22", "24", "26"]
  },
  {
    type: "riddle",
    question: "Зимой и летом одним цветом. Что это?",
    answer: "елка"
  },
  {
    type: "knowledge",
    question: "Сколько дней в неделе?",
    answer: "7",
    options: ["5", "6", "7", "8"]
  },
  {
    type: "math",
    question: "Сколько будет 20 ÷ 4?",
    answer: "5",
    options: ["4", "5", "6", "7"]
  }
];

const PLAYER_COLORS = ["#FF4444", "#4444FF", "#44FF44", "#FFFF44"];
const BOT_NAMES = ["Робот Макс", "Бот Алиса", "ИИ Степан"];

// Главный класс игры
class AdventureGame {
  constructor() {
    this.currentScreen = 'main-menu';
    this.gameState = {
      players: [],
      currentPlayer: 0,
      turnCounter: 1,
      gameStarted: false,
      gameEnded: false
    };
    this.settings = {
      soundEnabled: true,
      volume: 50
    };
    this.board = null;
    this.cardSystem = new CardSystem();
    this.botSystem = new BotSystem();
    
    this.loadSettings();
    this.initializeEventListeners();
    this.showScreen('main-menu');
  }

  // Инициализация обработчиков событий
  initializeEventListeners() {
    // Главное меню
    document.getElementById('new-game-btn').addEventListener('click', () => {
      this.showScreen('game-setup');
    });
    
    document.getElementById('rules-btn').addEventListener('click', () => {
      this.showScreen('rules-screen');
    });
    
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.showScreen('settings-screen');
    });

    // Настройка игры
    document.getElementById('player-count').addEventListener('change', (e) => {
      this.updatePlayerSetup(parseInt(e.target.value));
    });

    document.getElementById('back-to-menu').addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    document.getElementById('start-game').addEventListener('click', () => {
      this.startGame();
    });

    // Игровой экран
    document.getElementById('roll-dice').addEventListener('click', () => {
      this.rollDice();
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    // Карточки
    document.getElementById('card-submit').addEventListener('click', () => {
      this.cardSystem.submitAnswer();
    });

    // Другие экраны
    document.getElementById('rules-back').addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    document.getElementById('settings-back').addEventListener('click', () => {
      this.saveSettings();
      this.showScreen('main-menu');
    });

    // Результаты
    document.getElementById('new-game-again').addEventListener('click', () => {
      this.showScreen('game-setup');
    });

    document.getElementById('back-to-main').addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    // Инициализация настройки игроков
    this.updatePlayerSetup(2);
  }

  // Переключение экранов
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    this.currentScreen = screenId;
  }

  // Обновление настройки игроков
  updatePlayerSetup(playerCount) {
    const container = document.getElementById('player-setup');
    container.innerHTML = '';

    for (let i = 0; i < playerCount; i++) {
      const playerDiv = document.createElement('div');
      playerDiv.className = 'player-input-group';
      playerDiv.innerHTML = `
        <div class="player-color-picker" 
             style="background-color: ${PLAYER_COLORS[i]}"
             data-color="${PLAYER_COLORS[i]}"></div>
        <input type="text" class="form-control" 
               placeholder="Имя игрока ${i + 1}" 
               value="Игрок ${i + 1}" 
               data-player="${i}">
        <select class="form-control" data-player="${i}">
          <option value="human">Человек</option>
          <option value="bot" ${i > 0 ? 'selected' : ''}>Бот</option>
        </select>
      `;
      container.appendChild(playerDiv);
    }
  }

  // Начало игры
  startGame() {
    const playerInputs = document.querySelectorAll('#player-setup input[type="text"]');
    const playerTypes = document.querySelectorAll('#player-setup select');
    const botDifficulty = document.getElementById('bot-difficulty').value;

    this.gameState.players = [];
    
    playerInputs.forEach((input, index) => {
      const isBot = playerTypes[index].value === 'bot';
      const name = isBot ? BOT_NAMES[index % BOT_NAMES.length] : input.value || `Игрок ${index + 1}`;
      
      this.gameState.players.push({
        id: index,
        name: name,
        color: PLAYER_COLORS[index],
        position: 0,
        isBot: isBot,
        botDifficulty: botDifficulty,
        skipNextTurn: false
      });
    });

    this.gameState.currentPlayer = 0;
    this.gameState.turnCounter = 1;
    this.gameState.gameStarted = true;
    this.gameState.gameEnded = false;

    this.board = new GameBoard();
    this.updateUI();
    this.showScreen('game-screen');

    // Проверяем первый ход
    this.checkTurnStart();
  }

  // Проверка начала хода (пропуск если нужно)
  checkTurnStart() {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    
    if (currentPlayer.skipNextTurn) {
      currentPlayer.skipNextTurn = false;
      this.showMessage(`😴 ${currentPlayer.name} пропускает ход!`);
      
      setTimeout(() => {
        this.nextTurn();
      }, 2000);
      return;
    }

    // Если текущий игрок бот, автоматически начинаем его ход
    if (currentPlayer.isBot) {
      setTimeout(() => this.botTurn(), 1000);
    }
  }

  // Бросок кубика
  rollDice() {
    if (this.gameState.gameEnded) return;

    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (currentPlayer.skipNextTurn) return;

    const diceElement = document.getElementById('dice');
    const diceValue = document.getElementById('dice-value');
    const rollButton = document.getElementById('roll-dice');
    
    rollButton.disabled = true;
    diceElement.classList.add('rolling');
    
    this.playSound('diceRoll');

    // Анимация броска кубика
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      diceValue.textContent = Math.floor(Math.random() * 6) + 1;
      rollCount++;
      
      if (rollCount > 10) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        diceValue.textContent = finalValue;
        diceElement.classList.remove('rolling');
        
        this.movePlayer(finalValue);
        rollButton.disabled = false;
      }
    }, 100);
  }

  // Перемещение игрока
  movePlayer(steps) {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    const oldPosition = currentPlayer.position;
    let newPosition = Math.min(oldPosition + steps, GAME_CONFIG.boardSize);
    
    currentPlayer.position = newPosition;
    this.board.animatePlayerMove(this.gameState.currentPlayer, oldPosition, newPosition);
    
    this.playSound('move');

    setTimeout(() => {
      this.handleSpecialCell(newPosition);
    }, 1000);
  }

  // Обработка специальных клеток
  handleSpecialCell(position) {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    
    if (GAME_CONFIG.jumpUpCells.includes(position)) {
      const jump = Math.floor(Math.random() * (GAME_CONFIG.jumpRanges.up.max - GAME_CONFIG.jumpRanges.up.min + 1)) + GAME_CONFIG.jumpRanges.up.min;
      currentPlayer.position = Math.min(currentPlayer.position + jump, GAME_CONFIG.boardSize);
      this.board.updatePlayerPosition(this.gameState.currentPlayer, currentPlayer.position);
      this.showMessage(`🎉 ${currentPlayer.name} прыгает вперед на ${jump} клеток!`);
      
      // Проверка победы после прыжка
      if (currentPlayer.position >= GAME_CONFIG.boardSize) {
        setTimeout(() => this.endGame(), 1500);
        return;
      }
      
      setTimeout(() => this.nextTurn(), 1500);
    } else if (GAME_CONFIG.jumpDownCells.includes(position)) {
      const jump = Math.floor(Math.random() * (GAME_CONFIG.jumpRanges.down.max - GAME_CONFIG.jumpRanges.down.min + 1)) + GAME_CONFIG.jumpRanges.down.min;
      currentPlayer.position = Math.max(currentPlayer.position - jump, 0);
      this.board.updatePlayerPosition(this.gameState.currentPlayer, currentPlayer.position);
      this.showMessage(`😞 ${currentPlayer.name} откатывается назад на ${jump} клеток!`);
      
      setTimeout(() => this.nextTurn(), 1500);
    } else {
      // На всех остальных клетках показываем карточку с заданием
      this.cardSystem.showCard(currentPlayer);
    }
  }

  // Следующий ход
  nextTurn() {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
    
    if (this.gameState.currentPlayer === 0) {
      this.gameState.turnCounter++;
    }

    this.updateUI();
    this.checkTurnStart();
  }

  // Ход бота
  botTurn() {
    if (this.gameState.gameEnded) return;
    
    const bot = this.gameState.players[this.gameState.currentPlayer];
    this.botSystem.makeMove(bot, this.gameState);
    
    setTimeout(() => {
      this.rollDice();
    }, 500);
  }

  // Завершение игры
  endGame() {
    this.gameState.gameEnded = true;
    const winner = this.gameState.players[this.gameState.currentPlayer];
    
    this.playSound('win');
    
    // Сортировка игроков по позициям
    const sortedPlayers = [...this.gameState.players].sort((a, b) => b.position - a.position);
    
    // Отображение результатов
    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-color').style.backgroundColor = winner.color;
    
    const finalPositions = document.getElementById('final-positions');
    finalPositions.innerHTML = '';
    
    sortedPlayers.forEach((player, index) => {
      const positionDiv = document.createElement('div');
      positionDiv.className = 'position-entry';
      positionDiv.innerHTML = `
        <div class="position-info">
          <span style="font-weight: bold; margin-right: 8px;">${index + 1}.</span>
          <div class="player-color-indicator" style="background-color: ${player.color}"></div>
          <span>${player.name}</span>
        </div>
        <span>Позиция: ${player.position}</span>
      `;
      finalPositions.appendChild(positionDiv);
    });

    setTimeout(() => {
      this.showScreen('game-results');
    }, 2000);
  }

  // Обновление интерфейса
  updateUI() {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    
    // Обновление текущего игрока
    document.getElementById('current-player-name').textContent = currentPlayer.name;
    document.getElementById('current-player-color').style.backgroundColor = currentPlayer.color;
    document.getElementById('turn-counter').textContent = this.gameState.turnCounter;

    // Обновление списка игроков
    const playersStatus = document.getElementById('players-status');
    playersStatus.innerHTML = '';

    this.gameState.players.forEach((player, index) => {
      const playerDiv = document.createElement('div');
      playerDiv.className = `player-status ${index === this.gameState.currentPlayer ? 'active' : ''}`;
      
      let statusText = '';
      if (player.skipNextTurn) {
        statusText = ' 😴';
      }
      
      playerDiv.innerHTML = `
        <div class="player-info">
          <div class="player-color-indicator" style="background-color: ${player.color}"></div>
          <span>${player.name}${player.isBot ? ' 🤖' : ''}${statusText}</span>
        </div>
        <span class="player-position">${player.position}</span>
      `;
      playersStatus.appendChild(playerDiv);
    });

    // Обновление позиций на доске
    if (this.board) {
      this.board.updateAllPlayers(this.gameState.players);
    }
  }

  // Отображение сообщения
  showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--color-surface);
      border: 2px solid var(--color-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-20);
      font-size: var(--font-size-lg);
      z-index: 1001;
      box-shadow: var(--shadow-lg);
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 2000);
  }

  // Звуковые эффекты
  playSound(soundType) {
    if (!this.settings.soundEnabled) return;
    
    // Простая имитация звука через изменение стилей
    const button = document.querySelector('.btn:hover') || document.querySelector('.btn');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 100);
    }
  }

  // Сохранение настроек
  saveSettings() {
    this.settings.soundEnabled = document.getElementById('sound-enabled').checked;
    this.settings.volume = document.getElementById('volume-slider').value;
    localStorage.setItem('adventure-game-settings', JSON.stringify(this.settings));
  }

  // Загрузка настроек
  loadSettings() {
    const saved = localStorage.getItem('adventure-game-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
      document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
      document.getElementById('volume-slider').value = this.settings.volume;
    }
  }
}

// Класс игрового поля
class GameBoard {
  constructor() {
    this.canvas = document.getElementById('game-board');
    this.ctx = this.canvas.getContext('2d');
    this.cells = this.generateCells();
    this.draw();
  }

  // Генерация клеток по спирали
  generateCells() {
    const cells = [];
    const boardSize = 20; // 20x20 сетка
    const cellSize = this.canvas.width / boardSize;
    
    // Спиральное расположение клеток
    let x = 0, y = boardSize - 1;
    let dx = 1, dy = 0;
    
    for (let i = 1; i <= GAME_CONFIG.boardSize; i++) {
      const pixelX = x * cellSize;
      const pixelY = y * cellSize;
      
      let cellType = 'normal';
      if (GAME_CONFIG.jumpUpCells.includes(i)) cellType = 'jumpUp';
      else if (GAME_CONFIG.jumpDownCells.includes(i)) cellType = 'jumpDown';
      
      cells.push({
        number: i,
        x: pixelX,
        y: pixelY,
        size: cellSize,
        type: cellType
      });

      // Спиральная логика
      const nextX = x + dx;
      const nextY = y + dy;
      
      if (nextX < 0 || nextX >= boardSize || nextY < 0 || nextY >= boardSize ||
          cells.some(cell => Math.abs(cell.x - nextX * cellSize) < 1 && Math.abs(cell.y - nextY * cellSize) < 1)) {
        [dx, dy] = [-dy, dx]; // Поворот направления
      }
      
      x += dx;
      y += dy;
    }
    
    return cells;
  }

  // Отрисовка доски
  draw() {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.cells.forEach(cell => {
      // Цвет клетки в зависимости от типа
      let fillColor = '#DEB887';
      if (cell.type === 'jumpUp') fillColor = '#90EE90';
      else if (cell.type === 'jumpDown') fillColor = '#FFB6C1';
      
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(cell.x + 2, cell.y + 2, cell.size - 4, cell.size - 4);
      
      // Рамка клетки
      this.ctx.strokeStyle = '#8B4513';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(cell.x + 2, cell.y + 2, cell.size - 4, cell.size - 4);
      
      // Номер клетки
      this.ctx.fillStyle = '#000';
      this.ctx.font = `${Math.max(8, cell.size * 0.3)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        cell.number,
        cell.x + cell.size / 2,
        cell.y + cell.size / 2
      );
    });
  }

  // Анимация перемещения игрока
  animatePlayerMove(playerId, fromPosition, toPosition) {
    if (fromPosition === toPosition) return;
    
    const fromCell = this.cells[fromPosition] || this.cells[0];
    const toCell = this.cells[toPosition - 1] || this.cells[GAME_CONFIG.boardSize - 1];
    
    let progress = 0;
    const animate = () => {
      progress += 0.1;
      if (progress >= 1) {
        progress = 1;
      }
      
      this.draw();
      this.updateAllPlayers(game.gameState.players, playerId, {
        x: fromCell.x + (toCell.x - fromCell.x) * progress,
        y: fromCell.y + (toCell.y - fromCell.y) * progress
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Обновление позиции игрока
  updatePlayerPosition(playerId, position) {
    this.draw();
    this.updateAllPlayers(game.gameState.players);
  }

  // Обновление всех игроков
  updateAllPlayers(players, animatingPlayerId = -1, animatingPosition = null) {
    players.forEach((player, index) => {
      let cell;
      if (index === animatingPlayerId && animatingPosition) {
        cell = animatingPosition;
      } else {
        cell = this.cells[Math.max(0, player.position - 1)] || this.cells[0];
      }
      
      this.drawPlayer(player, cell, index);
    });
  }

  // Отрисовка игрока
  drawPlayer(player, cell, playerId) {
    const offsetX = (playerId % 2) * 8 - 4;
    const offsetY = Math.floor(playerId / 2) * 8 - 4;
    
    this.ctx.fillStyle = player.color;
    this.ctx.beginPath();
    this.ctx.arc(
      cell.x + cell.size / 2 + offsetX,
      cell.y + cell.size / 2 + offsetY,
      6,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
    
    // Рамка игрока
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}

// Система карточек
class CardSystem {
  constructor() {
    this.currentCard = null;
    this.currentPlayer = null;
  }

  showCard(player) {
    this.currentPlayer = player;
    this.currentCard = CARDS[Math.floor(Math.random() * CARDS.length)];
    
    const modal = document.getElementById('card-modal');
    const title = document.getElementById('card-title');
    const type = document.getElementById('card-type');
    const question = document.getElementById('card-question');
    const options = document.getElementById('card-options');
    
    title.textContent = this.getCardTypeTitle(this.currentCard.type);
    type.textContent = this.getCardTypeTitle(this.currentCard.type);
    type.className = `status status--${this.getCardTypeClass(this.currentCard.type)}`;
    question.textContent = this.currentCard.question;
    
    options.innerHTML = '';
    
    if (this.currentCard.options) {
      // Варианты ответов
      this.currentCard.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => {
          document.querySelectorAll('.option-button').forEach(b => b.classList.remove('selected'));
          button.classList.add('selected');
        });
        options.appendChild(button);
      });
    } else {
      // Поле ввода для загадок
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      input.placeholder = 'Введите ответ...';
      input.id = 'card-answer-input';
      options.appendChild(input);
    }
    
    modal.classList.remove('hidden');
  }

  submitAnswer() {
    let userAnswer = '';
    
    if (this.currentCard.options) {
      const selected = document.querySelector('.option-button.selected');
      if (!selected) return;
      userAnswer = selected.textContent;
    } else {
      const input = document.getElementById('card-answer-input');
      if (!input) return;
      userAnswer = input.value.trim().toLowerCase();
    }
    
    const isCorrect = userAnswer.toLowerCase() === this.currentCard.answer.toLowerCase();
    
    this.handleAnswer(isCorrect);
    this.hideCard();
  }

  handleAnswer(isCorrect) {
    if (isCorrect) {
      game.playSound('correct');
      game.showMessage(`✅ Правильно! ${this.currentPlayer.name} продолжает игру.`);
    } else {
      game.playSound('wrong');
      this.currentPlayer.skipNextTurn = true;
      game.showMessage(`❌ Неправильно! ${this.currentPlayer.name} пропускает следующий ход.`);
    }
    
    // Проверка победы
    if (this.currentPlayer.position >= GAME_CONFIG.boardSize) {
      setTimeout(() => game.endGame(), 1000);
    } else {
      setTimeout(() => game.nextTurn(), 2000);
    }
  }

  hideCard() {
    document.getElementById('card-modal').classList.add('hidden');
  }

  getCardTypeTitle(type) {
    switch (type) {
      case 'math': return 'Математика';
      case 'riddle': return 'Загадка';
      case 'knowledge': return 'Эрудиция';
      default: return 'Задание';
    }
  }

  getCardTypeClass(type) {
    switch (type) {
      case 'math': return 'info';
      case 'riddle': return 'warning';
      case 'knowledge': return 'success';
      default: return 'info';
    }
  }
}

// Система ботов
class BotSystem {
  makeMove(bot, gameState) {
    // Простая стратегия для демонстрации
    switch (bot.botDifficulty) {
      case 'easy':
        // Случайная стратегия
        break;
      case 'medium':
        // Базовая стратегия
        this.mediumStrategy(bot, gameState);
        break;
      case 'hard':
        // Продвинутая стратегия
        this.hardStrategy(bot, gameState);
        break;
    }
  }

  mediumStrategy(bot, gameState) {
    // Анализ ближайших клеток
    const position = bot.position;
    const dangerousCells = GAME_CONFIG.jumpDownCells;
    
    // Простой анализ: избегать красных клеток если возможно
    for (let i = 1; i <= 6; i++) {
      if (dangerousCells.includes(position + i)) {
        // Бот "знает" о опасности и может корректировать стратегию
        break;
      }
    }
  }

  hardStrategy(bot, gameState) {
    // Продвинутый анализ позиций всех игроков
    const otherPlayers = gameState.players.filter(p => p.id !== bot.id);
    const leadingPlayer = otherPlayers.reduce((leader, player) => 
      player.position > leader.position ? player : leader
    );
    
    // Стратегия догонялки
    if (bot.position < leadingPlayer.position - 10) {
      // Агрессивная игра для догона
    }
  }

  // Ответ бота на карточку
  answerCard(bot, card) {
    let correctRate = 0.5; // По умолчанию 50%
    
    switch (bot.botDifficulty) {
      case 'easy':
        correctRate = 0.3; // 30% правильных ответов
        break;
      case 'medium':
        correctRate = 0.6; // 60% правильных ответов
        break;
      case 'hard':
        correctRate = 0.8; // 80% правильных ответов
        break;
    }
    
    return Math.random() < correctRate;
  }
}

// Инициализация игры
let game;
document.addEventListener('DOMContentLoaded', () => {
  game = new AdventureGame();
});