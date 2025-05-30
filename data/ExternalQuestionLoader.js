export class ExternalQuestionLoader {
    constructor() {
        this.questions = new Map();
        this.subjectsConfig = null;
        this.loaded = false;
        this.debug = true;
    }

    log(...args) {
        if (this.debug) {
            console.log('[ExternalQuestionLoader]', ...args);
        }
    }

    error(...args) {
        console.error('[ExternalQuestionLoader]', ...args);
    }

    async loadQuestions() {
        try {
            this.log('Загрузка конфигурации предметов...');
            
            // Загружаем конфигурацию предметов
            await this.loadSubjectsConfig();
            
            // Загружаем вопросы для каждого предмета
            const subjects = Object.keys(this.subjectsConfig.subjects);
            
            for (const subjectId of subjects) {
                await this.loadSubjectQuestions(subjectId);
            }
            
            this.loaded = true;
            this.log('✅ Все вопросы загружены успешно');
            this.log('Статистика:', this.getLoadingStatistics());
            
            return true;
        } catch (error) {
            this.error('Ошибка загрузки вопросов:', error);
            return false;
        }
    }

    async loadSubjectsConfig() {
        try {
            const response = await fetch('./data/subjects-config.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.subjectsConfig = await response.json();
            this.log('✅ Конфигурация предметов загружена');
            
        } catch (error) {
            this.error('Не удалось загрузить конфигурацию предметов:', error);
            throw error;
        }
    }

    async loadSubjectQuestions(subjectId) {
        try {
            const subjectInfo = this.subjectsConfig.subjects[subjectId];
            if (!subjectInfo) {
                throw new Error(`Предмет ${subjectId} не найден в конфигурации`);
            }
            
            this.log(`Загрузка вопросов: ${subjectInfo.name} (${subjectInfo.file})`);
            
            const response = await fetch(`./data/questions/${subjectInfo.file}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const markdownContent = await response.text();
            const questions = this.parseMarkdownQuestions(markdownContent, subjectId);
            
            this.questions.set(subjectId, questions);
            this.log(`✅ ${subjectInfo.name}: загружено ${questions.length} вопросов`);
            
        } catch (error) {
            this.error(`Ошибка загрузки предмета ${subjectId}:`, error);
            // Устанавливаем пустой массив для предмета с ошибкой
            this.questions.set(subjectId, []);
        }
    }

    parseMarkdownQuestions(markdownContent, subjectId) {
        const questions = [];
        const lines = markdownContent.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Пропускаем заголовки, комментарии и пустые строки
            if (!trimmedLine || 
                trimmedLine.startsWith('#') || 
                trimmedLine.startsWith('<!--') ||
                trimmedLine.startsWith('-->')) {
                continue;
            }
            
            // Ищем строки в формате: Вопрос?|Ответ
            if (trimmedLine.includes('|')) {
                const [questionText, answer] = trimmedLine.split('|', 2);
                
                if (questionText.trim() && answer.trim()) {
                    questions.push({
                        text: questionText.trim(),
                        answer: answer.trim(),
                        subject: subjectId
                    });
                }
            }
        }
        
        return questions;
    }

    getRandomQuestion(subjects) {
        if (!this.loaded) {
            throw new Error('Вопросы не загружены');
        }

        if (!subjects || subjects.length === 0) {
            throw new Error('Предметы не выбраны');
        }

        // Собираем все вопросы из выбранных предметов
        const allQuestions = [];
        
        subjects.forEach(subjectId => {
            const subjectQuestions = this.questions.get(subjectId);
            if (subjectQuestions && subjectQuestions.length > 0) {
                allQuestions.push(...subjectQuestions);
            }
        });

        if (allQuestions.length === 0) {
            throw new Error(`Нет вопросов для предметов: ${subjects.join(', ')}`);
        }

        // Выбираем случайный вопрос
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        const questionData = allQuestions[randomIndex];
        
        return {
            text: questionData.text,
            answer: questionData.answer,
            subject: questionData.subject,
            subjectName: this.getSubjectName(questionData.subject)
        };
    }

    checkAnswer(userAnswer, correctAnswer) {
        // Нормализуем ответы для сравнения
        const normalizeAnswer = (answer) => {
            return answer.toString().toLowerCase().trim()
                .replace(/[^\w\sа-яё]/gi, '')
                .replace(/\s+/g, ' ');
        };

        const normalizedUser = normalizeAnswer(userAnswer);
        const normalizedCorrect = normalizeAnswer(correctAnswer);

        // Точное совпадение
        if (normalizedUser === normalizedCorrect) {
            return true;
        }

        // Для числовых ответов
        if (!isNaN(normalizedUser) && !isNaN(normalizedCorrect)) {
            return parseFloat(normalizedUser) === parseFloat(normalizedCorrect);
        }

        // Нечеткое сравнение (расстояние Левенштейна)
        return this.fuzzyMatch(normalizedUser, normalizedCorrect, 0.8);
    }

    fuzzyMatch(str1, str2, threshold = 0.8) {
        if (str1.length === 0) return str2.length === 0;
        if (str2.length === 0) return false;

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

        const distance = matrix[str2.length][str1.length];
        const maxLength = Math.max(str1.length, str2.length);
        const similarity = 1 - (distance / maxLength);

        return similarity >= threshold;
    }

    getSubjectName(subjectId) {
        return this.subjectsConfig?.subjects[subjectId]?.name || subjectId;
    }

    getAvailableSubjects() {
        if (!this.subjectsConfig) return [];
        
        return Object.entries(this.subjectsConfig.subjects).map(([id, info]) => ({
            id,
            name: info.name,
            description: info.description,
            icon: info.icon,
            difficulty: info.difficulty,
            estimatedTime: info.estimatedTime
        }));
    }

    getDefaultSubjects() {
        return this.subjectsConfig?.defaultSelected || [];
    }

    getQuestionsCount(subjectId) {
        const questions = this.questions.get(subjectId);
        return questions ? questions.length : 0;
    }

    getTotalQuestionsCount() {
        let total = 0;
        this.questions.forEach(questions => {
            total += questions.length;
        });
        return total;
    }

    getLoadingStatistics() {
        const stats = {
            totalSubjects: this.questions.size,
            totalQuestions: this.getTotalQuestionsCount(),
            subjectDetails: {}
        };

        this.questions.forEach((questions, subjectId) => {
            stats.subjectDetails[subjectId] = {
                name: this.getSubjectName(subjectId),
                questionsCount: questions.length
            };
        });

        return stats;
    }

    // Метод для поиска вопросов
    searchQuestions(searchTerm, subjects = null) {
        const results = [];
        const searchLower = searchTerm.toLowerCase();
        
        const subjectsToSearch = subjects || Array.from(this.questions.keys());
        
        subjectsToSearch.forEach(subjectId => {
            const subjectQuestions = this.questions.get(subjectId);
            if (subjectQuestions) {
                subjectQuestions.forEach((q, index) => {
                    if (q.text.toLowerCase().includes(searchLower) ||
                        q.answer.toLowerCase().includes(searchLower)) {
                        results.push({
                            subject: subjectId,
                            subjectName: this.getSubjectName(subjectId),
                            index,
                            text: q.text,
                            answer: q.answer
                        });
                    }
                });
            }
        });

        return results;
    }
}
