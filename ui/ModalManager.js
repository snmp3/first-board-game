export class ModalManager {
    constructor() {
        this.initialized = false;
        this.currentModal = null;
        this.autoCloseTimer = null;
        this.debug = true;
    }

    log(...args) {
        if (this.debug) {
            console.log('[ModalManager]', ...args);
        }
    }

    error(...args) {
        console.error('[ModalManager]', ...args);
    }

    initialize() {
        this.log('Инициализация ModalManager...');
        
        // Получаем ссылки на модальные окна
        this.questionModal = document.getElementById('question-modal');
        this.messageModal = document.getElementById('message-modal');
        this.resultsModal = document.getElementById('results-modal');
        
        if (!this.questionModal || !this.messageModal || !this.resultsModal) {
            this.error('Не все модальные окна найдены в DOM');
            return false;
        }
        
        this.setupEventListeners();
        this.initialized = true;
        this.log('✅ ModalManager инициализирован');
        
        return true;
    }

    setupEventListeners() {
        // Обработчики для модального окна вопроса
        const submitAnswerBtn = document.getElementById('submit-answer');
        const skipQuestionBtn = document.getElementById('skip-question');
        const answerInput = document.getElementById('answer-input');
        
        if (submitAnswerBtn) {
            submitAnswerBtn.addEventListener('click', () => {
                this.submitAnswer();
            });
        }
        
        if (skipQuestionBtn) {
            skipQuestionBtn.addEventListener('click', () => {
                this.skipQuestion();
            });
        }
        
        if (answerInput) {
            // ИСПРАВЛЕНИЕ: Убираем все ограничения на ввод символов, включая пробелы
            answerInput.addEventListener('keypress', (e) => {
                // Разрешаем ввод ВСЕХ символов, включая пробелы
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitAnswer();
                }
                // Убираем любые другие ограничения - разрешаем все символы
            });
            
            // Убираем ограничения на paste (вставку)
            answerInput.addEventListener('paste', (e) => {
                // Разрешаем вставку любого текста
            });
            
            // Убираем ограничения на input
            answerInput.addEventListener('input', (e) => {
                // Разрешаем любой ввод
            });
        }
        
        // Обработчики для модального окна сообщений
        const closeMessageBtn = document.getElementById('close-message');
        if (closeMessageBtn) {
            closeMessageBtn.addEventListener('click', () => {
                this.closeCurrentModal();
            });
        }
        
        // Обработчики для модального окна результатов
        const closeResultsBtn = document.getElementById('close-results');
        if (closeResultsBtn) {
            closeResultsBtn.addEventListener('click', () => {
                this.closeCurrentModal();
            });
        }
        
        // Закрытие модальных окон по клику вне области
        [this.questionModal, this.messageModal, this.resultsModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeCurrentModal();
                    }
                });
            }
        });
        
        // Закрытие по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeCurrentModal();
            }
        });
    }

    showQuestion(questionText, answerCallback) {
        this.log('Показ вопроса:', questionText);
        
        this.closeCurrentModal();
        
        const questionTextElement = document.getElementById('question-text');
        const answerInput = document.getElementById('answer-input');
        
        if (questionTextElement) {
            questionTextElement.textContent = questionText;
        }
        
        if (answerInput) {
            answerInput.value = '';
            answerInput.placeholder = 'Введите ответ (можно использовать пробелы)';
        }
        
        this.answerCallback = answerCallback;
        this.showModal(this.questionModal);
        
        // Фокус на поле ввода
        setTimeout(() => {
            if (answerInput) {
                answerInput.focus();
            }
        }, 100);
    }

    // ИСПРАВЛЕННЫЙ метод с поддержкой автозакрытия для ботов и игроков
    showMessage(title, message, callback = null, options = {}) {
        const { 
            autoClose = false, 
            autoCloseDelay = 1000, 
            isBot = false 
        } = options;
        
        this.log(`Показ сообщения: ${title} (автозакрытие: ${autoClose}, бот: ${isBot})`);
        
        this.closeCurrentModal();
        
        const titleElement = document.getElementById('message-title');
        const messageElement = document.getElementById('message-text');
        
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        if (messageElement) {
            // Обрабатываем переносы строк в сообщении
            messageElement.innerHTML = message.replace(/\n/g, '<br>');
        }
        
        this.messageCallback = callback;
        this.showModal(this.messageModal);
        
        // Автозакрытие для ботов или при правильном ответе игрока
        if (autoClose) {
            this.log(`Автозакрытие через ${autoCloseDelay}ms`);
            this.autoCloseTimer = setTimeout(() => {
                this.log('Автозакрытие модального окна');
                this.closeCurrentModal();
            }, autoCloseDelay);
        }
    }

    showResults(resultsHTML, callback = null) {
        this.log('Показ результатов игры');
        
        this.closeCurrentModal();
        
        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
            resultsContent.innerHTML = resultsHTML;
        }
        
        this.resultsCallback = callback;
        this.showModal(this.resultsModal);
    }

    showModal(modal) {
        if (!modal) return false;
        
        this.currentModal = modal;
        modal.classList.add('active');
        
        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
        
        return true;
    }

    closeCurrentModal() {
        // Очищаем таймер автозакрытия
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
            this.log('Таймер автозакрытия очищен');
        }
        
        if (!this.currentModal) return;
        
        this.currentModal.classList.remove('active');
        
        // Восстанавливаем прокрутку страницы
        document.body.style.overflow = '';
        
        // Выполняем callback в зависимости от типа модального окна
        if (this.currentModal === this.messageModal && this.messageCallback) {
            this.messageCallback();
            this.messageCallback = null;
        } else if (this.currentModal === this.resultsModal && this.resultsCallback) {
            this.resultsCallback();
            this.resultsCallback = null;
        }
        
        this.currentModal = null;
    }

    submitAnswer() {
        const answerInput = document.getElementById('answer-input');
        if (!answerInput || !this.answerCallback) return;
        
        const answer = answerInput.value.trim(); // Разрешаем пробелы в ответе
        this.log('Отправка ответа:', answer);
        
        if (answer === '') {
            this.log('Пустой ответ, показываем предупреждение');
            answerInput.placeholder = 'Пожалуйста, введите ответ';
            answerInput.style.borderColor = '#e74c3c';
            answerInput.focus();
            return;
        }
        
        this.closeCurrentModal();
        
        if (this.answerCallback) {
            this.answerCallback(answer);
            this.answerCallback = null;
        }
    }

    skipQuestion() {
        this.log('Пропуск вопроса');
        this.closeCurrentModal();
        
        if (this.answerCallback) {
            this.answerCallback(''); // Пустой ответ означает пропуск
            this.answerCallback = null;
        }
    }

    isOpen() {
        return this.currentModal !== null;
    }

    getCurrentModal() {
        return this.currentModal;
    }

    // Утилитарные методы для разных типов сообщений
    showSuccessMessage(message, callback = null, autoClose = true) {
        this.showMessage(
            'Правильно! 🎉', 
            message, 
            callback, 
            { autoClose, autoCloseDelay: 1000 }
        );
    }

    showErrorMessage(message, callback = null, autoClose = false) {
        this.showMessage(
            'Неправильно 😔', 
            message, 
            callback, 
            { autoClose, autoCloseDelay: 1000 }
        );
    }

    showBotMessage(title, message, callback = null) {
        this.showMessage(
            title, 
            message, 
            callback, 
            { autoClose: true, autoCloseDelay: 1000, isBot: true }
        );
    }

    showInfoMessage(title, message, callback = null) {
        this.showMessage(title, message, callback, { autoClose: false });
    }

    // Отладочные методы
    getDebugInfo() {
        return {
            initialized: this.initialized,
            currentModal: this.currentModal?.id || null,
            hasAutoCloseTimer: !!this.autoCloseTimer,
            modalStates: {
                question: this.questionModal?.classList.contains('active') || false,
                message: this.messageModal?.classList.contains('active') || false,
                results: this.resultsModal?.classList.contains('active') || false
            }
        };
    }
}
