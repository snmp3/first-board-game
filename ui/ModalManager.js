export class ModalManager {
    constructor() {
        this.initialized = false;
        this.currentModal = null;
        this.autoCloseTimer = null;
        this.answerCallback = null;
        this.messageCallback = null;
        this.resultsCallback = null;
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
            // Убираем старые обработчики
            submitAnswerBtn.replaceWith(submitAnswerBtn.cloneNode(true));
            const newSubmitBtn = document.getElementById('submit-answer');
            newSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.submitAnswer();
            });
        }
        
        if (skipQuestionBtn) {
            // Убираем старые обработчики
            skipQuestionBtn.replaceWith(skipQuestionBtn.cloneNode(true));
            const newSkipBtn = document.getElementById('skip-question');
            newSkipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.skipQuestion();
            });
        }
        
        if (answerInput) {
            // Убираем старые обработчики
            answerInput.replaceWith(answerInput.cloneNode(true));
            const newAnswerInput = document.getElementById('answer-input');
            
            // ИСПРАВЛЕНИЕ: Убираем все ограничения на ввод символов, включая пробелы
            newAnswerInput.addEventListener('keypress', (e) => {
                // Разрешаем ввод ВСЕХ символов, включая пробелы
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitAnswer();
                }
            });
            
            // Убираем стилизацию ошибки при вводе
            newAnswerInput.addEventListener('input', (e) => {
                if (e.target.style.borderColor === 'rgb(231, 76, 60)') {
                    e.target.style.borderColor = '';
                    e.target.placeholder = 'Введите ответ (можно использовать пробелы)';
                }
            });
        }
        
        // Обработчики для модального окна сообщений
        const closeMessageBtn = document.getElementById('close-message');
        if (closeMessageBtn) {
            // Убираем старые обработчики
            closeMessageBtn.replaceWith(closeMessageBtn.cloneNode(true));
            const newCloseBtn = document.getElementById('close-message');
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCurrentModal();
            });
        }
        
        // Обработчики для модального окна результатов
        const closeResultsBtn = document.getElementById('close-results');
        if (closeResultsBtn) {
            // Убираем старые обработчики
            closeResultsBtn.replaceWith(closeResultsBtn.cloneNode(true));
            const newCloseResultsBtn = document.getElementById('close-results');
            newCloseResultsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCurrentModal();
            });
        }
        
        // Закрытие модальных окон по клику вне области
        [this.questionModal, this.messageModal, this.resultsModal].forEach(modal => {
            if (modal) {
                // Убираем старые обработчики
                modal.replaceWith(modal.cloneNode(true));
            }
        });
        
        // Обновляем ссылки после клонирования
        this.questionModal = document.getElementById('question-modal');
        this.messageModal = document.getElementById('message-modal');
        this.resultsModal = document.getElementById('results-modal');
        
        // Добавляем новые обработчики
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
        
        // КРИТИЧЕСКИ ВАЖНО: Полное закрытие всех модальных окон
        this.forceCloseAll();
        
        const questionTextElement = document.getElementById('question-text');
        const answerInput = document.getElementById('answer-input');
        
        if (questionTextElement) {
            questionTextElement.textContent = questionText;
        }
        
        if (answerInput) {
            answerInput.value = '';
            answerInput.placeholder = 'Введите ответ (можно использовать пробелы)';
            answerInput.style.borderColor = '';
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
        
        // КРИТИЧЕСКИ ВАЖНО: Полное закрытие всех модальных окон
        this.forceCloseAll();
        
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
        
        // КРИТИЧЕСКИ ВАЖНО: Полное закрытие всех модальных окон
        this.forceCloseAll();
        
        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
            resultsContent.innerHTML = resultsHTML;
        }
        
        this.resultsCallback = callback;
        this.showModal(this.resultsModal);
    }

    showModal(modal) {
        if (!modal) return false;
        
        // Убеждаемся что предыдущие модальные окна закрыты
        this.forceCloseAll();
        
        this.currentModal = modal;
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
        
        this.log(`Модальное окно ${modal.id} показано`);
        
        return true;
    }

    // НОВЫЙ метод принудительного закрытия всех модальных окон
    forceCloseAll() {
        // Очищаем таймеры
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
        
        // Принудительно закрываем все модальные окна
        [this.questionModal, this.messageModal, this.resultsModal].forEach(modal => {
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
        
        // Восстанавливаем прокрутку
        document.body.style.overflow = '';
        
        // Сбрасываем callbacks без их выполнения
        this.answerCallback = null;
        this.messageCallback = null;
        this.resultsCallback = null;
        this.currentModal = null;
        
        this.log('Все модальные окна принудительно закрыты');
    }

    closeCurrentModal() {
        // Очищаем таймер автозакрытия
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
            this.log('Таймер автозакрытия очищен');
        }
        
        if (!this.currentModal) return;
        
        const currentModalId = this.currentModal.id;
        
        this.currentModal.classList.remove('active');
        this.currentModal.style.display = 'none';
        
        // Восстанавливаем прокрутку страницы
        document.body.style.overflow = '';
        
        // Выполняем callback в зависимости от типа модального окна
        if (this.currentModal === this.messageModal && this.messageCallback) {
            const callback = this.messageCallback;
            this.messageCallback = null;
            this.currentModal = null;
            callback();
        } else if (this.currentModal === this.resultsModal && this.resultsCallback) {
            const callback = this.resultsCallback;
            this.resultsCallback = null;
            this.currentModal = null;
            callback();
        } else {
            this.currentModal = null;
        }
        
        this.log(`Модальное окно ${currentModalId} закрыто`);
    }

    submitAnswer() {
        const answerInput = document.getElementById('answer-input');
        if (!answerInput || !this.answerCallback) {
            this.log('Нет поля ввода или callback для отправки ответа');
            return;
        }
        
        const answer = answerInput.value.trim();
        this.log('Отправка ответа:', answer);
        
        if (answer === '') {
            this.log('Пустой ответ, показываем предупреждение');
            answerInput.placeholder = 'Пожалуйста, введите ответ';
            answerInput.style.borderColor = '#e74c3c';
            answerInput.focus();
            return;
        }
        
        // Сохраняем callback перед закрытием
        const callback = this.answerCallback;
        this.answerCallback = null;
        
        // Закрываем модальное окно
        this.closeCurrentModal();
        
        // Вызываем callback
        if (callback) {
            setTimeout(() => {
                callback(answer);
            }, 100);
        }
    }

    skipQuestion() {
        this.log('Пропуск вопроса');
        
        // Сохраняем callback перед закрытием
        const callback = this.answerCallback;
        this.answerCallback = null;
        
        // Закрываем модальное окно
        this.closeCurrentModal();
        
        // Вызываем callback с пустым ответом
        if (callback) {
            setTimeout(() => {
                callback('');
            }, 100);
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
            hasAnswerCallback: !!this.answerCallback,
            hasMessageCallback: !!this.messageCallback,
            hasResultsCallback: !!this.resultsCallback,
            modalStates: {
                question: this.questionModal?.classList.contains('active') || false,
                message: this.messageModal?.classList.contains('active') || false,
                results: this.resultsModal?.classList.contains('active') || false
            }
        };
    }

    // Экстренный сброс всех состояний
    emergencyReset() {
        this.log('ЭКСТРЕННЫЙ СБРОС ModalManager');
        
        this.forceCloseAll();
        
        // Переинициализация обработчиков
        this.setupEventListeners();
        
        this.log('ModalManager сброшен экстренно');
    }
}
