import { Question } from '../entities/Question.js';

export class QuestionLoader {
    constructor() {
        this.questions = new Map();
        this.loaded = false;
        this.themes = ['math', 'geography', 'history', 'biology', 'riddles'];
    }

    async loadQuestions() {
        if (this.loaded) {
            return true;
        }

        try {
            // Загрузка всех тем
            for (const theme of this.themes) {
                const themeQuestions = this.getQuestionsForTheme(theme);
                this.questions.set(theme, themeQuestions);
            }

            this.loaded = true;
            console.log('Вопросы загружены успешно');
            return true;
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
            return false;
        }
    }

    getQuestionsForTheme(theme) {
        const questionData = {
            math: [
                { question: "Сколько будет 2 + 2?", answer: "4" },
                { question: "Сколько будет 5 * 6?", answer: "30" },
                { question: "Сколько будет 100 - 25?", answer: "75" },
                { question: "Сколько будет 144 / 12?", answer: "12" },
                { question: "Сколько будет 7 * 8?", answer: "56" },
                { question: "Сколько будет 15 + 27?", answer: "42" },
                { question: "Сколько будет 9 * 9?", answer: "81" },
                { question: "Сколько будет 200 - 45?", answer: "155" },
                { question: "Сколько будет 63 / 7?", answer: "9" },
                { question: "Сколько будет 11 * 11?", answer: "121" },
                { question: "Сколько будет 45 + 55?", answer: "100" },
                { question: "Сколько будет 8 * 12?", answer: "96" },
                { question: "Сколько будет 300 - 175?", answer: "125" },
                { question: "Сколько будет 84 / 4?", answer: "21" },
                { question: "Сколько будет 13 * 4?", answer: "52" },
                { question: "Квадратный корень из 16", answer: "4" },
                { question: "Сколько будет 6 в квадрате?", answer: "36" },
                { question: "Сколько будет 25% от 80?", answer: "20" },
                { question: "Сколько сторон у восьмиугольника?", answer: "8" },
                { question: "Сколько градусов в прямом угле?", answer: "90" }
            ],
            geography: [
                { question: "Столица России", answer: "Москва" },
                { question: "Самая длинная река в мире", answer: "Нил" },
                { question: "Самая высокая гора в мире", answer: "Эверест" },
                { question: "Столица Франции", answer: "Париж" },
                { question: "Самый большой океан", answer: "Тихий" },
                { question: "Столица Италии", answer: "Рим" },
                { question: "В какой стране находится город Сидней?", answer: "Австралия" },
                { question: "Столица Японии", answer: "Токио" },
                { question: "Самая большая страна по площади", answer: "Россия" },
                { question: "Столица Египта", answer: "Каир" },
                { question: "В какой стране находится Мачу-Пикчу?", answer: "Перу" },
                { question: "Столица Бразилии", answer: "Бразилиа" },
                { question: "Самое глубокое озеро в мире", answer: "Байкал" },
                { question: "Столица Индии", answer: "Дели" },
                { question: "На каком континенте находится Египет?", answer: "Африка" },
                { question: "Столица Германии", answer: "Берлин" },
                { question: "Самая маленькая страна в мире", answer: "Ватикан" },
                { question: "В какой стране находится водопад Ниагара?", answer: "США" },
                { question: "Столица Китая", answer: "Пекин" },
                { question: "Какой пролив разделяет Европу и Азию?", answer: "Босфор" }
            ],
            history: [
                { question: "В каком году началась Вторая мировая война?", answer: "1939" },
                { question: "Кто открыл Америку?", answer: "Колумб" },
                { question: "В каком году была Октябрьская революция?", answer: "1917" },
                { question: "Первый император Франции", answer: "Наполеон" },
                { question: "В каком году пал Берлин?", answer: "1945" },
                { question: "Кто был первым президентом США?", answer: "Вашингтон" },
                { question: "В каком году был основан Рим?", answer: "753" },
                { question: "Какая династия правила в России до Романовых?", answer: "Рюриковичи" },
                { question: "В каком году запустили первый спутник?", answer: "1957" },
                { question: "Кто написал 'Война и мир'?", answer: "Толстой" },
                { question: "В каком году отменили крепостное право в России?", answer: "1861" },
                { question: "Первый человек в космосе", answer: "Гагарин" },
                { question: "В каком году началась Первая мировая война?", answer: "1914" },
                { question: "Кто построил первую паровую машину?", answer: "Уатт" },
                { question: "В каком году была Куликовская битва?", answer: "1380" },
                { question: "Автор теории относительности", answer: "Эйнштейн" },
                { question: "В каком году разрушили Берлинскую стену?", answer: "1989" },
                { question: "Кто изобрел телефон?", answer: "Белл" },
                { question: "В каком году основали Санкт-Петербург?", answer: "1703" },
                { question: "Последний российский император", answer: "Николай" }
            ],
            biology: [
                { question: "Сколько камер у сердца человека?", answer: "4" },
                { question: "Как называется наука о растениях?", answer: "Ботаника" },
                { question: "Сколько хромосом у человека?", answer: "46" },
                { question: "Самое большое животное на Земле", answer: "Кит" },
                { question: "Как называется процесс фотосинтеза?", answer: "Фотосинтез" },
                { question: "Сколько костей у новорожденного ребенка?", answer: "270" },
                { question: "Самая быстрая птица в мире", answer: "Сапсан" },
                { question: "Сколько зубов у взрослого человека?", answer: "32" },
                { question: "Как называется наука о животных?", answer: "Зоология" },
                { question: "Какой газ выделяют растения?", answer: "Кислород" },
                { question: "Сколько пальцев у кошки?", answer: "18" },
                { question: "Самое высокое животное", answer: "Жираф" },
                { question: "Сколько легких у человека?", answer: "2" },
                { question: "Как называется детеныш кенгуру?", answer: "Кенгуренок" },
                { question: "Какой орган вырабатывает инсулин?", answer: "Поджелудочная" },
                { question: "Сколько глаз у паука?", answer: "8" },
                { question: "Самая ядовитая змея", answer: "Тайпан" },
                { question: "Сколько позвонков у жирафа?", answer: "7" },
                { question: "Как называется группа львов?", answer: "Прайд" },
                { question: "Какая кровь течет по венам?", answer: "Венозная" }
            ],
            riddles: [
                { question: "Висит груша, нельзя скушать. Что это?", answer: "Лампочка" },
                { question: "Зимой и летом одним цветом", answer: "Елка" },
                { question: "Сто одежек и все без застежек", answer: "Капуста" },
                { question: "Не лает, не кусает, а в дом не пускает", answer: "Замок" },
                { question: "Маленький, удаленький, сквозь землю прошел, красну шапочку нашел", answer: "Гриб" },
                { question: "Два конца, два кольца, посередине гвоздик", answer: "Ножницы" },
                { question: "Течет, течет - не вытечет, бежит, бежит - не выбежит", answer: "Река" },
                { question: "В воде родится, а воды боится", answer: "Соль" },
                { question: "Кто говорит на всех языках?", answer: "Эхо" },
                { question: "Что можно увидеть с закрытыми глазами?", answer: "Сон" },
                { question: "Чем больше из неё берешь, тем больше она становится", answer: "Яма" },
                { question: "Что становится мокрым, когда сушит?", answer: "Полотенце" },
                { question: "У кого есть шляпа без головы и нога без сапога?", answer: "Гриб" },
                { question: "Что идет, никуда не приходя?", answer: "Часы" },
                { question: "Что можно поймать, но нельзя бросить?", answer: "Взгляд" },
                { question: "Кто ходит сидя?", answer: "Шахматист" },
                { question: "Что имеет голову, но не имеет мозгов?", answer: "Сыр" },
                { question: "Что растет вниз головой?", answer: "Сосулька" },
                { question: "Кто говорит молча?", answer: "Книга" },
                { question: "Что легче пуха?", answer: "Мысль" }
            ]
        };

        return questionData[theme] || [];
    }

    getRandomQuestion(themes) {
        if (!this.loaded) {
            throw new Error('Вопросы не загружены');
        }

        if (!themes || themes.length === 0) {
            throw new Error('Темы не выбраны');
        }

        // Выбираем случайную тему
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        const themeQuestions = this.questions.get(randomTheme);

        if (!themeQuestions || themeQuestions.length === 0) {
            throw new Error(`Нет вопросов для темы ${randomTheme}`);
        }

        // Выбираем случайный вопрос
        const randomQuestion = themeQuestions[Math.floor(Math.random() * themeQuestions.length)];
        
        return new Question(
            randomQuestion.question,
            randomQuestion.answer,
            randomTheme
        );
    }

    checkAnswer(userAnswer, correctAnswer) {
        const question = new Question('', correctAnswer, '');
        return question.checkAnswer(userAnswer);
    }

    getQuestionsByTheme(theme) {
        return this.questions.get(theme) || [];
    }

    getAvailableThemes() {
        return [...this.themes];
    }

    getQuestionsCount(theme) {
        const questions = this.questions.get(theme);
        return questions ? questions.length : 0;
    }

    getTotalQuestionsCount() {
        let total = 0;
        this.questions.forEach(questions => {
            total += questions.length;
        });
        return total;
    }

    addCustomQuestion(theme, questionText, answer) {
        if (!this.questions.has(theme)) {
            this.questions.set(theme, []);
        }

        const themeQuestions = this.questions.get(theme);
        themeQuestions.push({
            question: questionText,
            answer: answer
        });

        return true;
    }

    removeQuestion(theme, questionIndex) {
        const themeQuestions = this.questions.get(theme);
        if (!themeQuestions || questionIndex < 0 || questionIndex >= themeQuestions.length) {
            return false;
        }

        themeQuestions.splice(questionIndex, 1);
        return true;
    }

    searchQuestions(searchTerm, themes = null) {
        const results = [];
        const searchLower = searchTerm.toLowerCase();
        
        const themesToSearch = themes || this.themes;
        
        themesToSearch.forEach(theme => {
            const themeQuestions = this.questions.get(theme);
            if (themeQuestions) {
                themeQuestions.forEach((q, index) => {
                    if (q.question.toLowerCase().includes(searchLower) ||
                        q.answer.toLowerCase().includes(searchLower)) {
                        results.push({
                            theme,
                            index,
                            question: q.question,
                            answer: q.answer
                        });
                    }
                });
            }
        });

        return results;
    }
}

