export class CanvasRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initialized = false;
        this.debug = true;
        
        // Настройки игрового поля с увеличенными клетками
        this.boardConfig = {
            canvasWidth: 800,
            canvasHeight: 600,
            cellsPerRow: 12,
            cellsPerColumn: 10, // 120 клеток всего
            cellSize: 55, // Увеличено с 45 до 55 для лучшего баланса
            borderWidth: 3,
            borderColor: '#2c3e50',
            backgroundColor: '#ecf0f1'
        };
        
        // Рассчитываем отступы для центрирования
        this.calculatePadding();
        
        // Предопределенные лестницы и змеи для отрисовки линий
        this.snakesAndLadders = [
            // Лестницы (вверх)
            { from: 4, to: 14, type: 'ladder' },
            { from: 9, to: 31, type: 'ladder' },
            { from: 21, to: 42, type: 'ladder' },
            { from: 28, to: 84, type: 'ladder' },
            { from: 36, to: 44, type: 'ladder' },
            { from: 51, to: 67, type: 'ladder' },
            { from: 71, to: 91, type: 'ladder' },
            { from: 80, to: 100, type: 'ladder' },
            
            // Змеи (вниз)
            { from: 16, to: 6, type: 'snake' },
            { from: 47, to: 26, type: 'snake' },
            { from: 49, to: 11, type: 'snake' },
            { from: 56, to: 53, type: 'snake' },
            { from: 62, to: 19, type: 'snake' },
            { from: 64, to: 60, type: 'snake' },
            { from: 87, to: 24, type: 'snake' },
            { from: 93, to: 73, type: 'snake' },
            { from: 95, to: 75, type: 'snake' },
            { from: 98, to: 78, type: 'snake' }
        ];
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
        this.log(`Размер клетки: ${cellSize}px`);
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
            this.log('✅ Canvas инициализирован с размером клеток:', this.boardConfig.cellSize);
            
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
            
            // Рисуем лестницы и змеи (используем встроенные данные)
            this.drawSnakesAndLadders();
            
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
        } else if (this.isLadderStart(number)) {
            cellColor = '#3498db'; // Начало лестницы - синяя
            textColor = '#ffffff';
        } else if (this.isSnakeStart(number)) {
            cellColor = '#e67e22'; // Начало змеи - оранжевая
            textColor = '#ffffff';
        } else if (this.isLadderEnd(number)) {
            cellColor = '#85c1e9'; // Конец лестницы - светло-синяя
        } else if (this.isSnakeEnd(number)) {
            cellColor = '#f8c471'; // Конец змеи - светло-оранжевая
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
        this.ctx.font = 'bold 14px Arial'; // Увеличен размер шрифта
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(number.toString(), x + size / 2, y + size / 2);
        
        // Рисуем символы для специальных клеток
        if (this.isLadderStart(number)) {
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('🪜', x + size / 2, y + size / 4);
        } else if (this.isSnakeStart(number)) {
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('🐍', x + size / 2, y + size / 4);
        }
    }

    isLadderStart(number) {
        return this.snakesAndLadders.some(item => item.from === number && item.type === 'ladder');
    }

    isSnakeStart(number) {
        return this.snakesAndLadders.some(item => item.from === number && item.type === 'snake');
    }

    isLadderEnd(number) {
        return this.snakesAndLadders.some(item => item.to === number && item.type === 'ladder');
    }

    isSnakeEnd(number) {
        return this.snakesAndLadders.some(item => item.to === number && item.type === 'snake');
    }

    drawSnakesAndLadders() {
        this.snakesAndLadders.forEach(({ from, to, type }) => {
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
        // Основная линия лестницы
        this.ctx.strokeStyle = '#27ae60';
        this.ctx.lineWidth = 6; // Увеличена толщина для лучшей видимости
        this.ctx.setLineDash([]);
        
        // Рисуем боковые стойки лестницы
        const offset = 8;
        
        // Левая стойка
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x - offset, fromPos.y);
        this.ctx.lineTo(toPos.x - offset, toPos.y);
        this.ctx.stroke();
        
        // Правая стойка
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x + offset, fromPos.y);
        this.ctx.lineTo(toPos.x + offset, toPos.y);
        this.ctx.stroke();
        
        // Рисуем перекладины лестницы
        this.ctx.strokeStyle = '#229954';
        this.ctx.lineWidth = 4;
        
        const steps = Math.max(3, Math.floor(Math.abs(toPos.y - fromPos.y) / 25));
        for (let i = 1; i < steps; i++) {
            const ratio = i / steps;
            const stepX1 = fromPos.x + (toPos.x - fromPos.x) * ratio - offset;
            const stepX2 = fromPos.x + (toPos.x - fromPos.x) * ratio + offset;
            const stepY = fromPos.y + (toPos.y - fromPos.y) * ratio;
            
            this.ctx.beginPath();
            this.ctx.moveTo(stepX1, stepY);
            this.ctx.lineTo(stepX2, stepY);
            this.ctx.stroke();
        }
        
        // Стрелка вверх в конце лестницы
        this.drawArrow(toPos.x, toPos.y - 15, 'up', '#27ae60');
    }

    drawSnake(fromPos, toPos) {
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 8; // Увеличена толщина
        this.ctx.setLineDash([]);
        
        // Рисуем изогнутую линию змеи с несколькими сегментами
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        
        // Создаем более плавную кривую змеи с несколькими контрольными точками
        const segments = 3;
        const deltaX = (toPos.x - fromPos.x) / segments;
        const deltaY = (toPos.y - fromPos.y) / segments;
        
        for (let i = 1; i <= segments; i++) {
            const segmentX = fromPos.x + deltaX * i;
            const segmentY = fromPos.y + deltaY * i;
            
            // Добавляем случайное отклонение для эффекта извивающейся змеи
            const offsetMagnitude = 20;
            const controlX = segmentX + Math.sin(i * Math.PI / 2) * offsetMagnitude;
            const controlY = segmentY + Math.cos(i * Math.PI / 2) * offsetMagnitude / 2;
            
            if (i === segments) {
                this.ctx.quadraticCurveTo(controlX, controlY, toPos.x, toPos.y);
            } else {
                this.ctx.quadraticCurveTo(controlX, controlY, segmentX, segmentY);
            }
        }
        this.ctx.stroke();
        
        // Рисуем голову змеи
        this.ctx.fillStyle = '#c0392b';
        this.ctx.beginPath();
        this.ctx.arc(toPos.x, toPos.y, 10, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Глаза змеи
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(toPos.x - 3, toPos.y - 3, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(toPos.x + 3, toPos.y - 3, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Стрелка вниз в конце змеи
        this.drawArrow(toPos.x, toPos.y + 15, 'down', '#e74c3c');
    }

    drawArrow(x, y, direction, color) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        
        const size = 8;
        this.ctx.beginPath();
        
        if (direction === 'up') {
            this.ctx.moveTo(x, y - size);
            this.ctx.lineTo(x - size/2, y);
            this.ctx.lineTo(x + size/2, y);
        } else if (direction === 'down') {
            this.ctx.moveTo(x, y + size);
            this.ctx.lineTo(x - size/2, y);
            this.ctx.lineTo(x + size/2, y);
        }
        
        this.ctx.closePath();
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
        
        // Смещение для нескольких игроков на одной клетке (увеличено для больших клеток)
        const offsetX = (index % 2) * 12 - 6;
        const offsetY = Math.floor(index / 2) * 12 - 6;
        
        const x = pos.x + offsetX;
        const y = pos.y + offsetY;
        
        // Рисуем фишку игрока (увеличен размер)
        this.ctx.fillStyle = player.color;
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, 2 * Math.PI); // Увеличен радиус с 12 до 15
        this.ctx.fill();
        this.ctx.stroke();
        
        // Рисуем инициал имени или номер игрока
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial'; // Увеличен размер шрифта
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

    // Получение информации о специальной клетке
    getSpecialCellInfo(cellNumber) {
        const snakeOrLadder = this.snakesAndLadders.find(item => item.from === cellNumber);
        return snakeOrLadder || null;
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
            },
            snakesAndLaddersCount: this.snakesAndLadders.length
        };
    }

    // Очистка canvas
    clear() {
        if (this.initialized && this.ctx) {
            this.ctx.clearRect(0, 0, this.boardConfig.canvasWidth, this.boardConfig.canvasHeight);
        }
    }
}
