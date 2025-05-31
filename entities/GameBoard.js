import { JUMP_CELLS } from '../core/Constants.js';

export class GameBoard {
    constructor() {
        this.rows = 10;
        this.columns = 12;
        this.totalCells = 120;
        
        // ВАЖНО: конвертируем 1-based данные в 0-based для внутренней логики
        this.jumpCells = {};
        Object.entries(JUMP_CELLS).forEach(([from, to]) => {
            this.jumpCells[parseInt(from) - 1] = parseInt(to) - 1;
        });
        
        // Создаем массив специальных клеток для быстрого доступа (0-based)
        this.specialCells = new Set(Object.keys(this.jumpCells).map(Number));
        
        this.debug = true;
        
        this.log('GameBoard инициализирован');
        this.log('Клетки-прыгалки (0-based для внутренней логики):', this.jumpCells);
        this.log('Клетки-прыгалки (1-based как видят игроки):', JUMP_CELLS);
        this.log('Специальные клетки (0-based):', [...this.specialCells]);
    }

    log(...args) {
        if (this.debug) {
            console.log('[GameBoard]', ...args);
        }
    }

    error(...args) {
        console.error('[GameBoard]', ...args);
    }

    // ОСНОВНОЙ метод для получения места прыжка (принимает 0-based позицию)
    getJumpDestination(position) {
        // Проверяем на всякий случай что позиция корректная
        if (position < 0 || position >= this.totalCells) {
            this.error(`Некорректная позиция: ${position}`);
            return null;
        }
        
        // Получаем место назначения прыжка (0-based)
        const destination = this.jumpCells[position];
        
        if (destination !== undefined) {
            const isLadder = destination > position;
            this.log(`🎯 Прыжок с позиции ${position + 1} на ${destination + 1} (${isLadder ? 'лестница' : 'змея'})`);
            return destination;
        }
        
        // Если прыжка нет, возвращаем null
        return null;
    }

    // Проверка, является ли клетка специальной (0-based позиция)
    isSpecialCell(position) {
        return this.specialCells.has(position);
    }

    // Получение типа специальной клетки (0-based позиция)
    getSpecialCellType(position) {
        const destination = this.jumpCells[position];
        if (destination === undefined) {
            return null;
        }
        
        return destination > position ? 'ladder' : 'snake';
    }

    // Получение всех лестниц (возвращает 1-based номера для отображения)
    getLadders() {
        const ladders = [];
        for (const [from, to] of Object.entries(this.jumpCells)) {
            if (parseInt(to) > parseInt(from)) {
                ladders.push({ 
                    from: parseInt(from) + 1, 
                    to: parseInt(to) + 1, 
                    type: 'ladder' 
                });
            }
        }
        return ladders;
    }

    // Получение всех змей (возвращает 1-based номера для отображения)
    getSnakes() {
        const snakes = [];
        for (const [from, to] of Object.entries(this.jumpCells)) {
            if (parseInt(to) < parseInt(from)) {
                snakes.push({ 
                    from: parseInt(from) + 1, 
                    to: parseInt(to) + 1, 
                    type: 'snake' 
                });
            }
        }
        return snakes;
    }

    // Получение всех лестниц и змей (возвращает 1-based номера)
    getSnakesAndLadders() {
        return [...this.getLadders(), ...this.getSnakes()];
    }

    // Проверка корректности позиции (0-based)
    isValidPosition(position) {
        return position >= 0 && position < this.totalCells;
    }

    // Получение координат клетки в сетке (0-based позиция)
    getCellCoordinates(position) {
        if (!this.isValidPosition(position)) {
            return null;
        }
        
        const row = Math.floor(position / this.columns);
        let col;
        
        // Учитываем змейку
        if (row % 2 === 0) {
            col = position % this.columns;
        } else {
            col = this.columns - 1 - (position % this.columns);
        }
        
        return { row, col };
    }

    // Получение позиции из координат (возвращает 0-based позицию)
    getPositionFromCoordinates(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.columns) {
            return null;
        }
        
        let position;
        if (row % 2 === 0) {
            position = row * this.columns + col;
        } else {
            position = row * this.columns + (this.columns - 1 - col);
        }
        
        return position;
    }

    // Проверка, является ли позиция финишной (0-based)
    isWinPosition(position) {
        return position >= this.totalCells - 1;
    }

    // Отладочная информация
    getDebugInfo() {
        return {
            totalCells: this.totalCells,
            rows: this.rows,
            columns: this.columns,
            jumpCellsCount: Object.keys(this.jumpCells).length,
            specialCellsCount: this.specialCells.size,
            jumpCells0Based: this.jumpCells,
            jumpCells1Based: JUMP_CELLS,
            ladders: this.getLadders(),
            snakes: this.getSnakes()
        };
    }

    // Тестовый метод для проверки прыжков
    testJumps() {
        this.log('=== ТЕСТ ПРЫЖКОВ ===');
        
        Object.entries(JUMP_CELLS).forEach(([from1Based, to1Based]) => {
            const from0Based = parseInt(from1Based) - 1;
            const to0Based = parseInt(to1Based) - 1;
            const type = to0Based > from0Based ? 'лестница' : 'змея';
            
            this.log(`${type}: клетка ${from1Based} → клетка ${to1Based} (внутренне: ${from0Based} → ${to0Based})`);
            
            // Тестируем метод getJumpDestination (передаем 0-based)
            const result = this.getJumpDestination(from0Based);
            if (result !== to0Based) {
                this.error(`ОШИБКА: ожидали ${to0Based}, получили ${result}`);
            } else {
                this.log(`✅ Тест прошел для клетки ${from1Based}`);
            }
        });
        
        this.log('=== КОНЕЦ ТЕСТА ===');
    }

    // Новый метод для тестирования конкретной клетки (принимает 1-based номер)
    testSpecificCell(cellNumber1Based) {
        const cellNumber0Based = cellNumber1Based - 1;
        this.log(`🧪 ТЕСТ КЛЕТКИ ${cellNumber1Based} (внутренне: ${cellNumber0Based})`);
        
        const destination = this.getJumpDestination(cellNumber0Based);
        if (destination !== null) {
            this.log(`✅ Прыжок найден: клетка ${cellNumber1Based} → клетка ${destination + 1}`);
            return destination + 1; // Возвращаем 1-based для удобства
        } else {
            this.log(`❌ Прыжка нет для клетки ${cellNumber1Based}`);
            return null;
        }
    }
}
