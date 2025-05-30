export class GameState {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.skipTurns = new Map();
        this.gameHistory = [];
    }

    addPlayer(name, isBot = false, difficulty = 'medium') {
        const player = {
            id: this.players.length,
            name,
            position: 0,
            isBot,
            difficulty,
            color: this.getPlayerColor(this.players.length),
            questionsAnswered: 0,
            correctAnswers: 0
        };
        this.players.push(player);
        return player;
    }

    getPlayerColor(index) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
        return colors[index % colors.length];
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    nextPlayer() {
        if (this.players.length === 0) return null;
        
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.shouldSkipPlayer(this.getCurrentPlayer()));
        
        this.decrementSkipTurns();
        return this.getCurrentPlayer();
    }

    shouldSkipPlayer(player) {
        return this.skipTurns.has(player.id) && this.skipTurns.get(player.id) > 0;
    }

    setSkipTurns(playerId, turns) {
        this.skipTurns.set(playerId, turns);
    }

    decrementSkipTurns() {
        for (let [playerId, turns] of this.skipTurns.entries()) {
            if (turns > 0) {
                this.skipTurns.set(playerId, turns - 1);
            }
        }
    }

    movePlayer(playerId, steps) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            const oldPosition = player.position;
            player.position = Math.min(player.position + steps, 119);
            
            this.gameHistory.push({
                playerId,
                action: 'move',
                from: oldPosition,
                to: player.position,
                timestamp: Date.now()
            });
            
            return player.position;
        }
        return -1;
    }

    checkWinner() {
        return this.players.find(player => player.position >= 119);
    }

    reset() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.skipTurns.clear();
        this.gameHistory = [];
    }

    getStatistics() {
        return this.players.map(player => ({
            name: player.name,
            position: player.position,
            questionsAnswered: player.questionsAnswered,
            correctAnswers: player.correctAnswers,
            accuracy: player.questionsAnswered > 0 ? 
                Math.round((player.correctAnswers / player.questionsAnswered) * 100) : 0
        }));
    }
}

