import { Player } from '../entities/Player.js';

export class GameState {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.skipTurns = new Map();
        this.debug = true;
    }

    log(...args) {
        if (this.debug) {
            console.log('[GameState]', ...args);
        }
    }

    error(...args) {
        console.error('[GameState]', ...args);
    }

    addPlayer(name, isBot = false, difficulty = 'medium') {
        const id = this.players.length;
        const player = new Player(id, name, isBot, difficulty);
        this.players.push(player);
        
        this.skipTurns.set(id, 0);
        
        this.log(`Игрок добавлен: ${name} (ID: ${id}, бот: ${isBot})`);
        return player;
    }

    removePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            const removedPlayer = this.players.splice(playerIndex, 1)[0];
            this.skipTurns.delete(playerId);
            
            if (this.currentPlayerIndex >= this.players.length) {
                this.currentPlayerIndex = 0;
            }
            
            this.log(`Игрок удален: ${removedPlayer.name}`);
            return removedPlayer;
        }
        return null;
    }

    getCurrentPlayer() {
        if (this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex];
    }

    setSkipTurns(playerId, turns) {
        this.skipTurns.set(playerId, turns);
        this.log(`Игрок ${playerId} пропускает ${turns} ход(ов)`);
        
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.skipTurns = turns;
        }
    }

    getSkipTurns(playerId) {
        return this.skipTurns.get(playerId) || 0;
    }

    // ИСПРАВЛЕННАЯ логика смены игрока
    nextPlayer() {
        if (this.players.length === 0) return null;
        
        // Переходим к следующему игроку
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return null;
        
        // Проверяем, должен ли НОВЫЙ текущий игрок пропустить ход
        const skipTurns = this.getSkipTurns(currentPlayer.id);
        if (skipTurns > 0) {
            this.log(`${currentPlayer.name} пропускает ход (осталось: ${skipTurns - 1})`);
            this.setSkipTurns(currentPlayer.id, skipTurns - 1);
            
            // Рекурсивно вызываем nextPlayer для перехода к следующему игроку
            return this.nextPlayer();
        }
        
        this.log(`Переход хода к: ${currentPlayer.name} (индекс: ${this.currentPlayerIndex})`);
        return currentPlayer;
    }

    movePlayer(playerId, steps) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            this.error(`Игрок с ID ${playerId} не найден`);
            return -1;
        }

        const oldPosition = player.position;
        player.position = Math.min(player.position + steps, 119);
        
        this.log(`${player.name}: ${oldPosition + 1} → ${player.position + 1} (двигался на ${steps})`);
        
        return player.position;
    }

    setPlayerPosition(playerId, position) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            this.error(`Игрок с ID ${playerId} не найден`);
            return -1;
        }

        const oldPosition = player.position;
        player.position = Math.max(0, Math.min(position, 119));
        
        this.log(`${player.name}: позиция изменена ${oldPosition + 1} → ${player.position + 1}`);
        
        return player.position;
    }

    checkWinner() {
        return this.players.find(player => player.position >= 119);
    }

    getStatistics() {
        return this.players
            .slice()
            .sort((a, b) => {
                if (b.position !== a.position) {
                    return b.position - a.position;
                }
                return b.getAccuracy() - a.getAccuracy();
            })
            .map(player => ({
                name: player.name,
                position: player.position + 1,
                accuracy: player.getAccuracy(),
                correctAnswers: player.correctAnswers,
                questionsAnswered: player.questionsAnswered,
                isBot: player.isBot
            }));
    }

    reset() {
        this.players.forEach(player => player.reset());
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.skipTurns.clear();
        
        this.log('GameState сброшен');
    }

    clearPlayers() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.skipTurns.clear();
        this.log('Все игроки удалены');
    }

    getAllSkipTurns() {
        const result = {};
        this.skipTurns.forEach((turns, playerId) => {
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                result[player.name] = turns;
            }
        });
        return result;
    }

    getDebugInfo() {
        return {
            playersCount: this.players.length,
            currentPlayerIndex: this.currentPlayerIndex,
            currentPlayer: this.getCurrentPlayer()?.name,
            gameStarted: this.gameStarted,
            gameEnded: this.gameEnded,
            skipTurns: this.getAllSkipTurns(),
            playerPositions: this.players.map(p => ({
                name: p.name,
                position: p.position + 1,
                skipTurns: this.getSkipTurns(p.id)
            }))
        };
    }
}
