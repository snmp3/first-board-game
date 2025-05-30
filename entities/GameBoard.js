import { GAME_CONFIG, JUMP_CELLS } from '../core/Constants.js';

export class GameBoard {
    constructor() {
        this.size = GAME_CONFIG.boardSize;
        this.cellsPerRow = GAME_CONFIG.cellsPerRow;
        this.jumpCells = JUMP_CELLS;
        this.cellPositions = this.calculateCellPositions();
    }

    calculateCellPositions() {
        const positions = [];
        const { cellSize, cellsPerRow } = GAME_CONFIG;
        
        for (let i = 0; i < this.size; i++) {
            const row = Math.floor(i / cellsPerRow);
            const col = i % cellsPerRow;
            
            // Зигзагообразное расположение
            const x = row % 2 === 0 ? col : (cellsPerRow - 1 - col);
            const y = row;
            
            positions.push({
                x: x * cellSize + cellSize / 2,
                y: y * cellSize + cellSize / 2,
                cellNumber: i
            });
        }
        
        return positions;
    }

    getCellPosition(cellIndex) {
        if (cellIndex < 0 || cellIndex >= this.size) {
            return null;
        }
        return this.cellPositions[cellIndex];
    }

    getJumpDestination(position) {
        return this.jumpCells[position] || null;
    }

    isJumpCell(position) {
        return position in this.jumpCells;
    }

    isLadder(position) {
        const destination = this.getJumpDestination(position);
        return destination !== null && destination > position;
    }

    isSnake(position) {
        const destination = this.getJumpDestination(position);
        return destination !== null && destination < position;
    }

    getSpecialCells() {
        const ladders = [];
        const snakes = [];
        
        for (const [start, end] of Object.entries(this.jumpCells)) {
            const startPos = parseInt(start);
            if (end > startPos) {
                ladders.push({ start: startPos, end });
            } else {
                snakes.push({ start: startPos, end });
            }
        }
        
        return { ladders, snakes };
    }

    getAdjacentCells(position) {
        const adjacent = [];
        const row = Math.floor(position / this.cellsPerRow);
        const col = position % this.cellsPerRow;
        
        // Проверяем соседние клетки
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // основные направления
            [-1, -1], [-1, 1], [1, -1], [1, 1] // диагонали
        ];
        
        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < Math.ceil(this.size / this.cellsPerRow) &&
                newCol >= 0 && newCol < this.cellsPerRow) {
                const newPosition = newRow * this.cellsPerRow + newCol;
                if (newPosition < this.size) {
                    adjacent.push(newPosition);
                }
            }
        });
        
        return adjacent;
    }

    getPath(start, end) {
        // Простейший путь по игровому полю
        const path = [];
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            path.push(i);
        }
        return path;
    }

    validateMove(currentPosition, diceRoll) {
        const newPosition = currentPosition + diceRoll;
        return {
            isValid: newPosition <= this.size - 1,
            finalPosition: Math.min(newPosition, this.size - 1),
            wouldWin: newPosition >= this.size - 1
        };
    }

    reset() {
        // Игровое поле не изменяется, поэтому сброс не требуется
        console.log('Игровое поле готово к новой игре');
    }
}

