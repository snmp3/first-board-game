import { GAME_CONFIG } from '../core/Constants.js';

export class CanvasRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.cellPositions = [];
        this.animationFrame = null;
        this.initialized = false;
    }

    setupCanvas() {
        this.canvas = document.getElementById('game-board');
        if (!this.canvas) {
            console.error('Canvas элемент не найден');
            return false;
        }

        this.ctx = this.canvas.getContext('2d');
        this.calculateCellPositions();
        this.initialized = true;
        
        console.log('Canvas настроен');
        return true;
    }

    calculateCellPositions() {
        const { cellSize, cellsPerRow } = GAME_CONFIG;
        this.cellPositions = [];
        
        for (let i = 0; i < GAME_CONFIG.boardSize; i++) {
            const row = Math.floor(i / cellsPerRow);
            const col = i % cellsPerRow;
            
            // Зигзагообразное расположение
            const x = row % 2 === 0 ? col : (cellsPerRow - 1 - col);
            const y = row;
            
            this.cellPositions.push({
                x: x * cellSize + cellSize / 2 + 20,
                y: y * cellSize + cellSize / 2 + 20,
                cellNumber: i
            });
        }
    }

    drawBoard(gameBoard) {
        if (!this.initialized) return;

        this.clearCanvas();
        this.drawCells();
        this.drawSpecialCells(gameBoard);
        this.drawCellNumbers();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Фон
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCells() {
        const { cellSize } = GAME_CONFIG;
        
        this.cellPositions.forEach((pos, index) => {
            const x = pos.x - cellSize / 2;
            const y = pos.y - cellSize / 2;
            
            // Чередующиеся цвета клеток
            this.ctx.fillStyle = (index % 2 === 0) ? '#ffffff' : '#f0f0f0';
            this.ctx.fillRect(x, y, cellSize, cellSize);
            
            // Граница клетки
            this.ctx.strokeStyle = '#cccccc';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, cellSize, cellSize);
        });
    }

    drawSpecialCells(gameBoard) {
        const { ladders, snakes } = gameBoard.getSpecialCells();
        
        // Рисуем лестницы (зеленые)
        ladders.forEach(ladder => {
            this.drawConnection(ladder.start, ladder.end, '#27ae60', '↗');
        });
        
        // Рисуем змей (красные)
        snakes.forEach(snake => {
            this.drawConnection(snake.start, snake.end, '#e74c3c', '↘');
        });
    }

    drawConnection(startCell, endCell, color, symbol) {
        const startPos = this.cellPositions[startCell];
        const endPos = this.cellPositions[endCell];
        
        if (!startPos || !endPos) return;
        
        // Линия соединения
        this.ctx.beginPath();
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Символ на начальной клетке
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, startPos.x, startPos.y);
    }

    drawCellNumbers() {
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        this.cellPositions.forEach((pos, index) => {
            const x = pos.x - GAME_CONFIG.cellSize / 2 + 5;
            const y = pos.y - GAME_CONFIG.cellSize / 2 + 2;
            this.ctx.fillText((index + 1).toString(), x, y);
        });
    }

    drawPlayers(players) {
        if (!this.initialized || !players) return;

        players.forEach((player, index) => {
            this.drawPlayer(player, index);
        });
    }

    drawPlayer(player, playerIndex) {
        const position = this.cellPositions[player.position];
        if (!position) return;

        const { playerSize } = GAME_CONFIG;
        const offset = this.getPlayerOffset(playerIndex, player.position);
        
        const x = position.x + offset.x;
        const y = position.y + offset.y;
        
        // Тень игрока
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(x + 2, y + 2, playerSize / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Игрок
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, playerSize / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Граница игрока
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Номер игрока
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText((playerIndex + 1).toString(), x, y);
    }

    getPlayerOffset(playerIndex, position) {
        const playersOnCell = this.getPlayersOnCell(position);
        const playerPosition = playersOnCell.indexOf(playerIndex);
        
        const offsets = [
            { x: 0, y: 0 },
            { x: -15, y: -15 },
            { x: 15, y: -15 },
            { x: 0, y: -25 }
        ];
        
        return offsets[playerPosition] || { x: 0, y: 0 };
    }

    getPlayersOnCell(position) {
        // Эта функция должна быть реализована с учетом всех игроков
        // Для упрощения возвращаем пустой массив
        return [];
    }

    animatePlayerMove(player, fromPosition, toPosition, duration = 1000) {
        if (!this.initialized) return Promise.resolve();

        return new Promise((resolve) => {
            const startPos = this.cellPositions[fromPosition];
            const endPos = this.cellPositions[toPosition];
            
            if (!startPos || !endPos) {
                resolve();
                return;
            }

            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                const currentX = startPos.x + (endPos.x - startPos.x) * easeProgress;
                const currentY = startPos.y + (endPos.y - startPos.y) * easeProgress;
                
                // Перерисовываем только область движения
                this.redrawPlayerArea(player, currentX, currentY);
                
                if (progress < 1) {
                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            this.animationFrame = requestAnimationFrame(animate);
        });
    }

    redrawPlayerArea(player, x, y) {
        // Простая реализация - полная перерисовка
        // В продвинутой версии можно оптимизировать
        this.clearCanvas();
        this.drawBoard();
        
        // Рисуем игрока в новой позиции
        const { playerSize } = GAME_CONFIG;
        
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, playerSize / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    highlightCell(cellIndex, color = '#ffd700') {
        const position = this.cellPositions[cellIndex];
        if (!position) return;

        const { cellSize } = GAME_CONFIG;
        const x = position.x - cellSize / 2;
        const y = position.y - cellSize / 2;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(x, y, cellSize, cellSize);
    }

    cancelAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    resize(width, height) {
        if (!this.canvas) return;
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.calculateCellPositions();
    }

    getCanvasSize() {
        return {
            width: this.canvas ? this.canvas.width : 0,
            height: this.canvas ? this.canvas.height : 0
        };
    }
}

