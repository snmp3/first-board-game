import { ExternalQuestionLoader } from './ExternalQuestionLoader.js';

export class QuestionLoader extends ExternalQuestionLoader {
    constructor() {
        super();
        this.fallbackQuestions = this.getFallbackQuestions();
    }

    async loadQuestions() {
        try {
            // Пытаемся загрузить внешние файлы
            const externalLoaded = await super.loadQuestions();
            
            if (externalLoaded && this.getTotalQuestionsCount() > 0) {
                this.log('Используем внешние файлы вопросов');
                return true;
            } else {
                throw new Error('Внешние файлы недоступны');
            }
            
        } catch (error) {
            this.log('Внешние файлы недоступны, используем встроенные вопросы');
            this.loadFallbackQuestions();
            return true;
        }
    }

    loadFallbackQuestions() {
        // Загружаем встроенные вопросы как fallback
        Object.entries(this.fallbackQuestions).forEach(([subjectId, questions]) => {
            this.questions.set(subjectId, questions);
        });
        
        this.loaded = true;
        this.log('✅ Встроенные вопросы загружены');
    }

    getFallbackQuestions() {
        // Минимальный набор встроенных вопросов для каждого предмета
        return {
            math: [
                { text: "Сколько будет 12 + 13?", answer: "25", subject: "math" },
                { text: "Сколько будет 25 - 12?", answer: "13", subject: "math" },
                { text: "Сколько будет 15 + 16?", answer: "31", subject: "math" },
                { text: "Сколько будет 31 - 16?", answer: "15", subject: "math" },
                { text: "Сколько будет 18 + 17?", answer: "35", subject: "math" }
            ],
            russian: [
                { text: "Какая буква идет после А?", answer: "Б", subject: "russian" },
                { text: "Сколько букв в русском алфавите?", answer: "33", subject: "russian" },
                { text: "Как пишется слово 'мама'?", answer: "мама", subject: "russian" },
                { text: "С какой буквы пишется имя Маша?", answer: "М", subject: "russian" },
                { text: "Сколько слогов в слове 'мама'?", answer: "2", subject: "russian" }
            ],
            nature: [
                { text: "Как называется детеныш коровы?", answer: "теленок", subject: "nature" },
                { text: "Сколько времен года?", answer: "4", subject: "nature" },
                { text: "Когда тает снег?", answer: "весной", subject: "nature" },
                { text: "Какого цвета листья летом?", answer: "зеленые", subject: "nature" },
                { text: "Что дает корова?", answer: "молоко", subject: "nature" }
            ],
            reading: [
                { text: "Кто съел Колобка?", answer: "лиса", subject: "reading" },
                { text: "Кто написал 'Сказку о рыбаке и рыбке'?", answer: "Пушкин", subject: "reading" },
                { text: "Кто написал 'Муху-Цокотуху'?", answer: "Чуковский", subject: "reading" },
                { text: "Кто написал стихи про игрушки?", answer: "Барто", subject: "reading" },
                { text: "Кто идет, качается?", answer: "бычок", subject: "reading" }
            ],
            riddles: [
                { text: "Рыжая плутовка, хитрая и ловкая", answer: "лиса", subject: "riddles" },
                { text: "Зимой и летом одним цветом", answer: "елка", subject: "riddles" },
                { text: "Два конца, два кольца, посередине гвоздик", answer: "ножницы", subject: "riddles" },
                { text: "Не лает, не кусает, а в дом не пускает", answer: "замок", subject: "riddles" },
                { text: "Сто одежек и все без застежек", answer: "капуста", subject: "riddles" }
            ]
        };
    }
}
