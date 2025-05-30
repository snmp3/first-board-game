export class QuestionLoader {
    constructor() {
        this.questions = new Map();
        this.subjectsConfig = null;
        this.loaded = false;
        this.debug = true;
    }

    log(...args) {
        if (this.debug) {
            console.log('[QuestionLoader]', ...args);
        }
    }

    error(...args) {
        console.error('[QuestionLoader]', ...args);
    }

    async loadQuestions() {
        try {
            this.log('Загрузка конфигурации предметов...');
            
            // Пытаемся загрузить внешнюю конфигурацию
            const configLoaded = await this.loadSubjectsConfig();
            
            if (configLoaded) {
                // Если конфигурация загружена, пытаемся загрузить вопросы из файлов
                const subjects = Object.keys(this.subjectsConfig.subjects);
                let successCount = 0;
                
                for (const subjectId of subjects) {
                    const loaded = await this.loadSubjectQuestions(subjectId);
                    if (loaded) successCount++;
                }
                
                if (successCount > 0) {
                    this.loaded = true;
                    this.log('✅ Внешние вопросы загружены успешно');
                    this.log('Статистика:', this.getLoadingStatistics());
                    return true;
                }
            }
            
            // Если внешние файлы недоступны, используем встроенные
            this.log('Внешние файлы недоступны, используем встроенные вопросы');
            this.loadFallbackQuestions();
            
            return true;
        } catch (error) {
            this.error('Ошибка загрузки вопросов:', error);
            this.loadFallbackQuestions();
            return true;
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
            return true;
            
        } catch (error) {
            this.error('Не удалось загрузить конфигурацию предметов:', error);
            this.createFallbackConfig();
            return false;
        }
    }

    createFallbackConfig() {
        this.subjectsConfig = {
            subjects: {
                math: {
                    name: "Математика",
                    description: "Сложение и вычитание",
                    icon: "🔢",
                    difficulty: "2nd-grade"
                },
                russian: {
                    name: "Русский язык", 
                    description: "Буквы и слова",
                    icon: "📝",
                    difficulty: "2nd-grade"
                },
                nature: {
                    name: "Окружающий мир",
                    description: "Животные и растения",
                    icon: "🌍",
                    difficulty: "2nd-grade"
                },
                reading: {
                    name: "Чтение",
                    description: "Сказки и книги",
                    icon: "📚",
                    difficulty: "2nd-grade"
                },
                riddles: {
                    name: "Загадки",
                    description: "Детские загадки",
                    icon: "🧩",
                    difficulty: "2nd-grade"
                }
            },
            defaultSelected: ["math", "russian"],
            gradeLevel: "2nd-grade",
            language: "ru"
        };
        
        this.log('Создана резервная конфигурация предметов');
    }

    async loadSubjectQuestions(subjectId) {
        try {
            const subjectInfo = this.subjectsConfig.subjects[subjectId];
            if (!subjectInfo || !subjectInfo.file) {
                return false;
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
            
            return true;
        } catch (error) {
            this.error(`Ошибка загрузки предмета ${subjectId}:`, error);
            return false;
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

    loadFallbackQuestions() {
        // Встроенные вопросы для каждого предмета (по 20 вопросов)
        const fallbackQuestions = {
            math: [
                { text: "Сколько будет 12 + 13?", answer: "25", subject: "math" },
                { text: "Сколько будет 25 - 12?", answer: "13", subject: "math" },
                { text: "Сколько будет 15 + 16?", answer: "31", subject: "math" },
                { text: "Сколько будет 31 - 16?", answer: "15", subject: "math" },
                { text: "Сколько будет 18 + 17?", answer: "35", subject: "math" },
                { text: "Сколько будет 35 - 17?", answer: "18", subject: "math" },
                { text: "Сколько будет 14 + 19?", answer: "33", subject: "math" },
                { text: "Сколько будет 33 - 14?", answer: "19", subject: "math" },
                { text: "Сколько будет 23 + 24?", answer: "47", subject: "math" },
                { text: "Сколько будет 47 - 23?", answer: "24", subject: "math" },
                { text: "Сколько будет 21 + 28?", answer: "49", subject: "math" },
                { text: "Сколько будет 49 - 21?", answer: "28", subject: "math" },
                { text: "Сколько будет 16 + 22?", answer: "38", subject: "math" },
                { text: "Сколько будет 38 - 16?", answer: "22", subject: "math" },
                { text: "Сколько будет 19 + 25?", answer: "44", subject: "math" },
                { text: "Сколько будет 44 - 19?", answer: "25", subject: "math" },
                { text: "Сколько будет 17 + 18?", answer: "35", subject: "math" },
                { text: "Сколько будет 26 + 23?", answer: "49", subject: "math" },
                { text: "Сколько будет 13 + 14?", answer: "27", subject: "math" },
                { text: "Сколько будет 22 + 17?", answer: "39", subject: "math" }
            ],
            russian: [
                { text: "Какая буква идет после А?", answer: "Б", subject: "russian" },
                { text: "Какая буква идет перед В?", answer: "Б", subject: "russian" },
                { text: "Сколько букв в русском алфавите?", answer: "33", subject: "russian" },
                { text: "Какая первая буква алфавита?", answer: "А", subject: "russian" },
                { text: "Какая последняя буква алфавита?", answer: "Я", subject: "russian" },
                { text: "Как пишется слово 'мама'?", answer: "мама", subject: "russian" },
                { text: "Как пишется слово 'папа'?", answer: "папа", subject: "russian" },
                { text: "С какой буквы пишется имя Маша?", answer: "М", subject: "russian" },
                { text: "С какой буквы пишется имя Петя?", answer: "П", subject: "russian" },
                { text: "Сколько слогов в слове 'мама'?", answer: "2", subject: "russian" },
                { text: "Сколько слогов в слове 'дом'?", answer: "1", subject: "russian" },
                { text: "Сколько гласных букв в слове 'мама'?", answer: "2", subject: "russian" },
                { text: "Какая буква в середине слова 'мир'?", answer: "И", subject: "russian" },
                { text: "Как правильно: 'мой Дом' или 'мой дом'?", answer: "мой дом", subject: "russian" },
                { text: "Как пишется слово 'дом'?", answer: "дом", subject: "russian" },
                { text: "Как пишется слово 'кот'?", answer: "кот", subject: "russian" },
                { text: "Как пишется слово 'сон'?", answer: "сон", subject: "russian" },
                { text: "Сколько букв в слове 'школа'?", answer: "5", subject: "russian" },
                { text: "Какая гласная в слове 'сон'?", answer: "О", subject: "russian" },
                { text: "Какая согласная в начале слова 'рука'?", answer: "Р", subject: "russian" }
            ],
            nature: [
                { text: "Как называется детеныш коровы?", answer: "теленок", subject: "nature" },
                { text: "Как называется детеныш лошади?", answer: "жеребенок", subject: "nature" },
                { text: "Что дает корова?", answer: "молоко", subject: "nature" },
                { text: "Что дает курица?", answer: "яйца", subject: "nature" },
                { text: "Сколько времен года?", answer: "4", subject: "nature" },
                { text: "Когда тает снег?", answer: "весной", subject: "nature" },
                { text: "Когда желтеют листья?", answer: "осенью", subject: "nature" },
                { text: "Какого цвета листья летом?", answer: "зеленые", subject: "nature" },
                { text: "Где живет медведь зимой?", answer: "в берлоге", subject: "nature" },
                { text: "Что ест заяц?", answer: "морковь", subject: "nature" },
                { text: "Какого цвета лиса?", answer: "рыжая", subject: "nature" },
                { text: "Сколько лап у кошки?", answer: "4", subject: "nature" },
                { text: "Где живет белка?", answer: "в дупле", subject: "nature" },
                { text: "Какая птица кукует?", answer: "кукушка", subject: "nature" },
                { text: "Где строят гнезда птицы?", answer: "на деревьях", subject: "nature" },
                { text: "Что нужно растениям для роста?", answer: "вода", subject: "nature" },
                { text: "Какого цвета морковь?", answer: "оранжевая", subject: "nature" },
                { text: "Какого цвета помидор?", answer: "красный", subject: "nature" },
                { text: "В какое время года самые длинные дни?", answer: "летом", subject: "nature" },
                { text: "Когда идет снег?", answer: "зимой", subject: "nature" }
            ],
            reading: [
                { text: "Кто съел Колобка?", answer: "лиса", subject: "reading" },
                { text: "Кто написал 'Сказку о рыбаке и рыбке'?", answer: "Пушкин", subject: "reading" },
                { text: "Что поймал старик в море?", answer: "золотую рыбку", subject: "reading" },
                { text: "Кто написал 'Муху-Цокотуху'?", answer: "Чуковский", subject: "reading" },
                { text: "Что нашла Муха-Цокотуха?", answer: "денежку", subject: "reading" },
                { text: "Кто спас Муху от паука?", answer: "комар", subject: "reading" },
                { text: "Кто написал стихи про игрушки?", answer: "Барто", subject: "reading" },
                { text: "Кто идет, качается?", answer: "бычок", subject: "reading" },
                { text: "Что уронили в речку?", answer: "мячик", subject: "reading" },
                { text: "Кому оторвали лапу?", answer: "мишке", subject: "reading" },
                { text: "Кто написал про Незнайку?", answer: "Носов", subject: "reading" },
                { text: "Где жил Незнайка?", answer: "в Цветочном городе", subject: "reading" },
                { text: "Как звали друга Незнайки?", answer: "Гунька", subject: "reading" },
                { text: "Сколько было богатырей в сказке?", answer: "3", subject: "reading" },
                { text: "Что потеряла Золушка?", answer: "туфельку", subject: "reading" },
                { text: "Кто помог Золушке попасть на бал?", answer: "фея", subject: "reading" },
                { text: "Кто лечит всех зверей?", answer: "Айболит", subject: "reading" },
                { text: "Куда ехал Айболит?", answer: "в Африку", subject: "reading" },
                { text: "Что делает бычок на доске?", answer: "идет", subject: "reading" },
                { text: "Почему плачет Таня?", answer: "уронила мячик", subject: "reading" }
            ],
            riddles: [
                { text: "Рыжая плутовка, хитрая и ловкая", answer: "лиса", subject: "riddles" },
                { text: "Зимой и летом одним цветом", answer: "елка", subject: "riddles" },
                { text: "Два конца, два кольца, посередине гвоздик", answer: "ножницы", subject: "riddles" },
                { text: "Не лает, не кусает, а в дом не пускает", answer: "замок", subject: "riddles" },
                { text: "Сто одежек и все без застежек", answer: "капуста", subject: "riddles" },
                { text: "Стоит Антошка на одной ножке", answer: "гриб", subject: "riddles" },
                { text: "Длинные уши, быстрые ноги", answer: "заяц", subject: "riddles" },
                { text: "Косолапый и большой, спит в берлоге зимой", answer: "медведь", subject: "riddles" },
                { text: "Кто молоко дает?", answer: "корова", subject: "riddles" },
                { text: "У кого есть пятачок?", answer: "свинья", subject: "riddles" },
                { text: "Кто говорит 'мяу'?", answer: "кошка", subject: "riddles" },
                { text: "Кто говорит 'гав'?", answer: "собака", subject: "riddles" },
                { text: "Золотое яблочко по небу катается", answer: "солнце", subject: "riddles" },
                { text: "Белая вата плывет куда-то", answer: "облако", subject: "riddles" },
                { text: "На стене висит, время показывает", answer: "часы", subject: "riddles" },
                { text: "Четыре ноги, а ходить не может", answer: "стол", subject: "riddles" },
                { text: "Всегда во рту, а не проглотишь", answer: "язык", subject: "riddles" },
                { text: "Пять братьев в одном домике живут", answer: "пальцы", subject: "riddles" },
                { text: "Круглый, румяный, в печи печен", answer: "хлеб", subject: "riddles" },
                { text: "Красная девица сидит в темнице", answer: "морковь", subject: "riddles" }
            ]
        };

        // Загружаем встроенные вопросы
        Object.entries(fallbackQuestions).forEach(([subjectId, questions]) => {
            this.questions.set(subjectId, questions);
        });
        
        this.loaded = true;
        this.log('✅ Встроенные вопросы загружены');
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
        return this.subjectsConfig?.defaultSelected || ['math', 'russian'];
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
