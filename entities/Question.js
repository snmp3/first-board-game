export class Question {
    constructor(text, answer, theme, difficulty = 'medium') {
        this.id = this.generateId();
        this.text = text;
        this.answer = this.normalizeAnswer(answer);
        this.theme = theme;
        this.difficulty = difficulty;
        this.createdAt = new Date();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    normalizeAnswer(answer) {
        if (typeof answer === 'number') {
            return answer.toString();
        }
        return answer.toString().toLowerCase().trim();
    }

    checkAnswer(userAnswer) {
        const normalizedUserAnswer = this.normalizeAnswer(userAnswer);
        const normalizedCorrectAnswer = this.answer;

        // Точное совпадение
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
            return true;
        }

        // Проверка числовых ответов
        if (this.isNumericAnswer(normalizedUserAnswer) && this.isNumericAnswer(normalizedCorrectAnswer)) {
            const userNum = parseFloat(normalizedUserAnswer);
            const correctNum = parseFloat(normalizedCorrectAnswer);
            return Math.abs(userNum - correctNum) < 0.01; // небольшая погрешность для float
        }

        // Нечеткое сравнение для текстовых ответов
        return this.fuzzyMatch(normalizedUserAnswer, normalizedCorrectAnswer);
    }

    isNumericAnswer(answer) {
        return !isNaN(parseFloat(answer)) && isFinite(answer);
    }

    fuzzyMatch(userAnswer, correctAnswer) {
        // Удаление пунктуации и лишних пробелов
        const cleanUser = userAnswer.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        const cleanCorrect = correctAnswer.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

        // Прямое совпадение после очистки
        if (cleanUser === cleanCorrect) {
            return true;
        }

        // Проверка вхождения (для случаев типа "Москва" vs "москва столица")
        if (cleanCorrect.length >= 3 && cleanUser.includes(cleanCorrect)) {
            return true;
        }

        if (cleanUser.length >= 3 && cleanCorrect.includes(cleanUser)) {
            return true;
        }

        // Расстояние Левенштейна для опечаток
        const distance = this.levenshteinDistance(cleanUser, cleanCorrect);
        const maxLength = Math.max(cleanUser.length, cleanCorrect.length);
        const similarity = 1 - (distance / maxLength);

        // Принимаем ответ если схожесть больше 80%
        return similarity >= 0.8;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    getHint() {
        // Простая система подсказок
        if (this.isNumericAnswer(this.answer)) {
            const num = parseFloat(this.answer);
            if (num > 100) {
                return "Число больше 100";
            } else if (num > 10) {
                return "Двузначное число";
            } else {
                return "Однозначное число";
            }
        }

        if (this.answer.length > 10) {
            return `Ответ состоит из ${this.answer.length} символов`;
        } else {
            return `Первая буква: ${this.answer.charAt(0).toUpperCase()}`;
        }
    }

    getDifficulty() {
        // Автоматическое определение сложности на основе длины ответа и типа
        if (this.isNumericAnswer(this.answer)) {
            const num = parseFloat(this.answer);
            if (num > 1000) return 'hard';
            if (num > 100) return 'medium';
            return 'easy';
        }

        if (this.answer.length > 15) return 'hard';
        if (this.answer.length > 8) return 'medium';
        return 'easy';
    }

    toJSON() {
        return {
            id: this.id,
            text: this.text,
            answer: this.answer,
            theme: this.theme,
            difficulty: this.difficulty,
            createdAt: this.createdAt
        };
    }
}

