export class Player {
    constructor(id, name, isBot = false, difficulty = 'medium') {
        this.id = id;
        this.name = name;
        this.position = 0;
        this.isBot = isBot;
        this.difficulty = difficulty;
        this.color = this.getPlayerColor(id);
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.skipTurns = 0;
    }

    getPlayerColor(index) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
        return colors[index % colors.length];
    }

    move(steps) {
        const oldPosition = this.position;
        this.position = Math.min(this.position + steps, 119);
        return {
            from: oldPosition,
            to: this.position,
            moved: this.position - oldPosition
        };
    }

    jump(destination) {
        const oldPosition = this.position;
        this.position = Math.max(0, Math.min(destination, 119));
        return {
            from: oldPosition,
            to: this.position,
            jumped: true
        };
    }

    answerQuestion(isCorrect) {
        this.questionsAnswered++;
        if (isCorrect) {
            this.correctAnswers++;
        }
    }

    getAccuracy() {
        return this.questionsAnswered > 0 ? 
            Math.round((this.correctAnswers / this.questionsAnswered) * 100) : 0;
    }

    canPlay() {
        return this.skipTurns === 0;
    }

    processSkipTurn() {
        if (this.skipTurns > 0) {
            this.skipTurns--;
            return true;
        }
        return false;
    }

    isWinner() {
        return this.position >= 119;
    }

    reset() {
        this.position = 0;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.skipTurns = 0;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            isBot: this.isBot,
            difficulty: this.difficulty,
            color: this.color,
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers,
            accuracy: this.getAccuracy(),
            skipTurns: this.skipTurns
        };
    }
}
