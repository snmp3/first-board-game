export class CanvasRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initialized = false;
        this.debug = true;
        
        // Настройки игрового поля
        this.boardConfig = {
            canvasWidth: 800,
            canvasHeight: 600,
            cellsPerRow: 12,
            cellsPerColumn: 10, // 120 клеток всего
            cellSize: 45, // Уменьшен для лучшего размещения
            borderWidth: 3,
            borderColor: '#2c3e50',
            backgroundColor: '#ecf0f1'
        };
        
        // Рассчитываем отступы для центрирования
        this.calculatePadding();
    }

    log(...args) {
        if (this.debug) {
            console.log('[CanvasRenderer]', ...args);
        }
    }

    error(...args) {
        console.error('[CanvasRenderer]', ...args);
    }

    calculatePadding() {
        const { canvasWidth, canvasHeight, cellsPerRow, cellsPerColumn, cellSize } = this.boardConfig;
        
        // Общий размер сетки
        const gridWidth = cellsPerRow * cellSize;
        const gridHeight = cellsPerColumn * cellSize;
        
        // Рассчитываем равномерные отступы
        this.boardConfig.paddingX = (canvasWidth - gridWidth) / 2;
        this.boardConfig.paddingY = (canvasHeight - gridHeight) / 2;
        
        this.log(`Рассчитаны отступы: X=${this.boardConfig.paddingX}, Y=${this.boardConfig.paddingY}`);
        this.log(`Размер сетки: ${gridWidth}x${gridHeight}, Canvas: ${canvasWidth}x${canvasHeight}`);
    }

    setupCanvas() {
        try {
            this.canvas = document.getElementById('game-board');
            if (!this.canvas) {
                this.error('Canvas элемент не найден');
                return false;
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                this.error('Не удалось получить 2D контекст');
                return false;
            }

            // Устанавливаем размеры canvas
            this.canvas.width = this.boardConfig.canvasWidth;
            this.canvas.height = this.boardConfig.canvasHeight;
            
            // Применяем стили для адаптивности
            this.canvas.style.maxWidth = '100%';
            this.canvas.style.height = 'auto';
            this.canvas.style.border = `${this.boardConfig.borderWidth}px solid ${this.boardConfig.borderColor}`;
            this.canvas.style.borderRadius = '10px';
            this.canvas.style.backgroundColor = this.boardConfig.backgroundColor;

            this.initialized = true;
            this.log('✅ Canvas инициализирован');
            
            return true;
        } catch (error) {
            this.error('Ошибка инициализации Canvas:', error);
            return false;
        }
    }

    drawBoard(gameBoard) {
        if (!this.initialized) {
            this.error('Canvas не инициализирован');
            return;
        }

        try {
            // Очищаем canvas
            this.ctx.clearRect(0, 0, this.boardConfig.canvasWidth, this.boardConfig.canvasHeight);
            
            // Заливаем фон
            this.ctx.fillStyle = this.boardConfig.backgroundColor;
            this.ctx.fillRect(0, 0, this.boardConfig.canvasWidth, this.boardConfig.canvasHeight);
            
            // Рисуем клетки с равномерными отступами
            this.drawCells();
            
            // Рисуем лестницы и змеи
            if (gameBoard) {
                this.drawSnakesAndLadders(gameBoard);
            }
            
        } catch (error) {
            this.error('Ошибка отрисовки доски:', error);
        }
    }

    drawCells() {
        const { cellSize, cellsPerRow, cellsPerColumn, paddingX, paddingY } = this.boardConfig;
        
        for (let row = 0; row < cellsPerColumn; row++) {
            for (let col = 0; col < cellsPerRow; col++) {
                // Вычисляем номер клетки (змейка)
                let cellNumber;
                if (row % 2 === 0) {
                    // Четные строки: слева направо
                    cellNumber = row * cellsPerRow + col + 1;
                } else {
                    // Нечетные строки: справа налево
                    cellNumber = row * cellsPerRow + (cellsPerRow - col);
                }
                
                // Пропускаем клетки больше 120
                if (cellNumber > 120) continue;
                
                // Рассчитываем позицию с учетом отступов
                const x = paddingX + col * cellSize;
                const y = paddingY + (cellsPerColumn - 1 - row) * cellSize; // Инвертируем Y для правильного порядка
                
                this.drawCell(x, y, cellSize, cellNumber);
            }
        }
    }

    drawCell(x, y, size, number) {
        // Цвет клетки в зависимости от типа
        let cellColor = '#ffffff';
        let textColor = '#2c3e50';
        let borderColor = '#bdc3c7';
        
        // Специальные клетки
        if (number === 1) {
            cellColor = '#2ecc71'; // Стартовая клетка - зеленая
            textColor = '#ffffff';
        } else if (number === 120) {
            cellColor = '#e74c3c'; // Финишная клетка - красная
            textColor = '#ffffff';
        } else if (this.isSpecialCell(number)) {
            cellColor = '#f39c12'; // Клетки с лестницами/змеями - оранжевые
        }
        
        // Рисуем фон клетки
        this.ctx.fillStyle = cellColor;
        this.ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
        
        // Рисуем границу клетки
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
        
        // Рисуем номер клетки
        this.ctx.fillStyle = textColor;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(number.toString(), x + size / 2, y + size / 2);
    }

    isSpecialCell(number) {
        // Проверяем, есть ли на этой клетке лестница или змея
        const specialCells = [
            // Лестницы (начало)
            4, 9, 21, 28, 36, 51, 71, 80,
            // Змеи (начало)
            16, 47, 49, 56, 62, 64, 87, 93, 95, 98
        ];
        return specialCells.includes(number);
    }

    drawSnakesAndLadders(gameBoard) {
        if (!gameBoard || !gameBoard.snakesAndLadders) return;
        
        const { cellSize, cellsPerRow, paddingX, paddingY } = this.boardConfig;
        
        gameBoard.snakesAndLadders.forEach(({ from, to, type }) => {
            const fromPos = this.getCellPosition(from);
            const toPos = this.getCellPosition(to);
            
            if (type === 'ladder') {
                this.drawLadder(fromPos, toPos);
            } else if (type === 'snake') {
                this.drawSnake(fromPos, toPos);
            }
        });
    }

    getCellPosition(cellNumber) {
        const { cellSize, cellsPerRow, cellsPerColumn, paddingX, paddingY } = this.boardConfig;
        
        // Преобразуем номер клетки в координаты
        const row = Math.floor((cellNumber - 1) / cellsPerRow);
        let col;
        
        if (row % 2 === 0) {
            // Четные строки: слева направо
            col = (cellNumber - 1) % cellsPerRow;
        } else {
            // Нечетные строки: справа налево
            col = cellsPerRow - 1 - ((cellNumber - 1) % cellsPerRow);
        }
        
        const x = paddingX + col * cellSize + cellSize / 2;
        const y = paddingY + (cellsPerColumn - 1 - row) * cellSize + cellSize / 2;
        
        return { x, y };
    }

    drawLadder(fromPos, toPos) {
        this.ctx.strokeStyle = '#27ae60';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([]);
        
        // Рисуем основную линию лестницы
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.lineTo(toPos.x, toPos.y);
        this.ctx.stroke();
        
        // Рисуем перекладины лестницы
        const steps = 5;
        for (let i = 1; i < steps; i++) {
            const ratio = i / steps;
            const stepX1 = fromPos.x + (toPos.x - fromPos.x) * ratio - 8;
            const stepX2 = fromPos.x + (toPos.x - fromPos.x) * ratio + 8;
            const stepY = fromPos.y + (toPos.y - fromPos.y) * ratio;
            
            this.ctx.beginPath();
            this.ctx.moveTo(stepX1, stepY);
            this.ctx.lineTo(stepX2, stepY);
            this.ctx.stroke();
        }
    }

    drawSnake(fromPos, toPos) {
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([]);
        
        // Рисуем изогнутую линию змеи
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        
        // Создаем кривую Безье для эффекта змеи
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        const controlX = midX + (Math.random() - 0.5) * 40;
        const controlY = midY + (Math.random() - 0.5) * 40;
        
        this.ctx.quadraticCurveTo(controlX, controlY, toPos.x, toPos.y);
        this.ctx.stroke();
        
        // Рисуем голову змеи
        this.ctx.fillStyle = '#c0392b';
        this.ctx.beginPath();
        this.ctx.arc(toPos.x, toPos.y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawPlayers(players) {
        if (!this.initialized || !players) return;
        
        try {
            players.forEach((player, index) => {
                if (player.position >= 0 && player.position < 120) {
                    this.drawPlayer(player, index);
                }
            });
        } catch (error) {
            this.error('Ошибка отрисовки игроков:', error);
        }
    }

    drawPlayer(player, index) {
        const pos = this.getCellPosition(player.position + 1);
        const { cellSize } = this.boardConfig;
        
        // Смещение для нескольких игроков на одной клетке
        const offsetX = (index % 2) * 8 - 4;
        const offsetY = Math.floor(index / 2) * 8 - 4;
        
        const x = pos.x + offsetX;
        const y = pos.y + offsetY;
        
        // Рисуем фишку игрока
        this.ctx.fillStyle = player.color;
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Рисуем инициал имени или номер игрока
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const displayText = player.name.charAt(0).toUpperCase();
        this.ctx.fillText(displayText, x, y);
    }

    // Метод для изменения размера canvas при изменении размера окна
    resize() {
        if (!this.initialized) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const containerWidth = container.clientWidth - 40; // Учитываем padding
        const aspectRatio = this.boardConfig.canvasHeight / this.boardConfig.canvasWidth;
        
        if (containerWidth < this.boardConfig.canvasWidth) {
            this.canvas.style.width = containerWidth + 'px';
            this.canvas.style.height = (containerWidth * aspectRatio) + 'px';
        } else {
            this.canvas.style.width = this.boardConfig.canvasWidth + 'px';
            this.canvas.style.height = this.boardConfig.canvasHeight + 'px';
        }
    }

    // Получение координат клетки для внешних модулей
    getCellCoordinates(cellNumber) {
        return this.getCellPosition(cellNumber);
    }

    // Отладочная информация
    getDebugInfo() {
        return {
            initialized: this.initialized,
            canvasSize: {
                width: this.canvas?.width,
                height: this.canvas?.height
            },
            boardConfig: this.boardConfig,
            padding: {
                x: this.boardConfig.paddingX,
                y: this.boardConfig.paddingY
            }
        };
    }

    // Очистка canvas
    clear() {
        if (this.initialized && this.ctx) {
            this.ctx.clearRect(0, 0, this.boardConfig.canvasWidth, this.boardConfig.canvasHeight);
        }
    }
}
