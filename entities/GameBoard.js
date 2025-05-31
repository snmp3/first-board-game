import { JUMP_CELLS } from '../core/Constants.js';

export class GameBoard {
    constructor() {
        this.rows = 10;
        this.columns = 12;
        this.totalCells = 120;
        
        // ВАЖНО: используем данные из Constants.js
        this.jumpCells = JUMP_CELLS;
        
        // Создаем массив специальных клеток для быстрого доступа
        this.specialCells = new Set(Object.keys(this.jumpCells).map(Number));
        
        this.debug = true;
        
        this.log('GameBoard инициализирован');
        this.log('Клетки-прыгалки:', this.jumpCells);
        this.log('Специальные клетки:', [...this.specialCells]);
    }

    log(...args) {
        if (this.debug) {
            console.log('[GameBoard]', ...args);
        }
    }

    error(...args) {
        console.error('[GameBoard]', ...args);
    }

    // ОСНОВНОЙ метод для получения места прыжка
    getJumpDestination(position) {
        // Проверяем на всякий случай что позиция корректная
        if (position < 0 || position >= this.totalCells) {
            this.error(`Некорректная позиция: ${position}`);
            return null;
        }
        
        // Получаем место назначения прыжка
        const destination = this.jumpCells[position];
        
        if (destination !== undefined) {
            const isLadder = destination > position;
            this.log(`🎯 Прыжок с позиции ${position + 1} на ${destination + 1} (${isLadder ? 'лестница' : 'змея'})`);
            return destination;
        }
        
        // Если прыжка нет, возвращаем null
        return null;
    }

    // Проверка, является ли клетка специальной
    isSpecialCell(position) {
        return this.specialCells.has(position);
    }

    // Получение типа специальной клетки
    getSpecialCellType(position) {
        const destination = this.jumpCells[position];
        if (destination === undefined) {
            return null;
        }
        
        return destination > position ? 'ladder' : 'snake';
    }

    // Получение всех лестниц
    getLadders() {
        const ladders = [];
        for (const [from, to] of Object.entries(this.jumpCells)) {
            if (parseInt(to) > parseInt(from)) {
                ladders.push({ from: parseInt(from), to: parseInt(to), type: 'ladder' });
            }
        }
        return ladders;
    }

    // Получение всех змей
    getSnakes() {
        const snakes = [];
        for (const [from, to] of Object.entries(this.jumpCells)) {
            if (parseInt(to) < parseInt(from)) {
                snakes.push({ from: parseInt(from), to: parseInt(to), type: 'snake' });
            }
        }
        return snakes;
    }

    // Получение всех лестниц и змей
    getSnakesAndLadders() {
        return [...this.getLadders(), ...this.getSnakes()];
    }

    // Проверка корректности позиции
    isValidPosition(position) {
        return position >= 0 && position < this.totalCells;
    }

    // Получение координат клетки в сетке
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

    // Получение позиции из координат
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

    // Проверка, является ли позиция финишной
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
            jumpCells: this.jumpCells,
            ladders: this.getLadders(),
            snakes: this.getSnakes()
        };
    }

    // Тестовый метод для проверки прыжков
    testJumps() {
        this.log('=== ТЕСТ ПРЫЖКОВ ===');
        
        Object.entries(this.jumpCells).forEach(([from, to]) => {
            const fromNum = parseInt(from);
            const toNum = parseInt(to);
            const type = toNum > fromNum ? 'лестница' : 'змея';
            
            this.log(`${type}: ${fromNum + 1} → ${toNum + 1}`);
            
            // Тестируем метод getJumpDestination
            const result = this.getJumpDestination(fromNum);
            if (result !== toNum) {
                this.error(`ОШИБКА: ожидали ${toNum}, получили ${result}`);
            }
        });
        
        this.log('=== КОНЕЦ ТЕСТА ===');
    }
}
