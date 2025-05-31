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
        this.log('Настройка обработчиков событий...');
        
        // ИСПРАВЛЕНИЕ: НЕ используем replaceWith - просто удаляем старые обработчики
        
        // Обработчики для модального окна вопроса
        const submitAnswerBtn = document.getElementById('submit-answer');
        const skipQuestionBtn = document.getElementById('skip-question');
        const answerInput = document.getElementById('answer-input');
        
        if (submitAnswerBtn) {
            // Удаляем старые обработчики, если есть
            const newSubmitBtn = submitAnswerBtn.cloneNode(true);
            submitAnswerBtn.parentNode.replaceChild(newSubmitBtn, submitAnswerBtn);
            
            // Добавляем новый обработчик
            newSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('🔥 Клик по кнопке "Ответить"');
                this.submitAnswer();
            });
            this.log('✅ Обработчик кнопки "Ответить" установлен');
        }
        
        if (skipQuestionBtn) {
            const newSkipBtn = skipQuestionBtn.cloneNode(true);
            skipQuestionBtn.parentNode.replaceChild(newSkipBtn, skipQuestionBtn);
            
            newSkipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('🔥 Клик по кнопке "Пропустить"');
                this.skipQuestion();
            });
            this.log('✅ Обработчик кнопки "Пропустить" установлен');
        }
        
        if (answerInput) {
            const newAnswerInput = answerInput.cloneNode(true);
            answerInput.parentNode.replaceChild(newAnswerInput, answerInput);
            
            // ИСПРАВЛЕНИЕ: Убираем все ограничения на ввод символов, включая пробелы
            newAnswerInput.addEventListener('keypress', (e) => {
                // Разрешаем ввод ВСЕХ символов, включая пробелы
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.log('🔥 Enter в поле ввода ответа');
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
            this.log('✅ Обработчики поля ввода установлены');
        }
        
        // Обработчики для модального окна сообщений
        const closeMessageBtn = document.getElementById('close-message');
        if (closeMessageBtn) {
            const newCloseBtn = closeMessageBtn.cloneNode(true);
            closeMessageBtn.parentNode.replaceChild(newCloseBtn, closeMessageBtn);
            
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('🔥 Клик по кнопке "OK" сообщения');
                this.closeCurrentModal();
            });
            this.log('✅ Обработчик кнопки "OK" сообщения установлен');
        }
        
        // Обработчики для модального окна результатов
        const closeResultsBtn = document.getElementById('close-results');
        if (closeResultsBtn) {
            const newCloseResultsBtn = closeResultsBtn.cloneNode(true);
            closeResultsBtn.parentNode.replaceChild(newCloseResultsBtn, closeResultsBtn);
            
            newCloseResultsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.log('🔥 Клик по кнопке "Закрыть" результатов');
                this.closeCurrentModal();
            });
            this.log('✅ Обработчик кнопки "Закрыть" результатов установлен');
        }
        
        // Обновляем ссылки на элементы после замены
        this.questionModal = document.getElementById('question-modal');
        this.messageModal = document.getElementById('message-modal');
        this.resultsModal = document.getElementById('results-modal');
        
        // Закрытие модальных окон по клику вне области
        [this.questionModal, this.messageModal, this.resultsModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.log('🔥 Клик вне модального окна');
                        this.closeCurrentModal();
                    }
                });
            }
        });
        
        // Закрытие по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.log('🔥 Нажата клавиша Escape');
                this.closeCurrentModal();
            }
        });
        
        this.log('✅ Все обработчики событий настроены');
    }

    showQuestion(questionText, answerCallback) {
        this.log('📋 Показ вопроса:', questionText);
        this.log('📋 Callback передан:', !!answerCallback);
        
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
        
        // КРИТИЧЕСКИ ВАЖНО: Сохраняем callback
        this.answerCallback = answerCallback;
        this.log('📋 Callback сохранен:', !!this.answerCallback);
        
        this.showModal(this.questionModal);
        
        // Фокус на поле ввода
        setTimeout(() => {
            const currentAnswerInput = document.getElementById('answer-input');
            if (currentAnswerInput) {
                currentAnswerInput.focus();
                this.log('📋 Фокус установлен на поле ввода');
            }
        }, 100);
    }

    showMessage(title, message, callback = null, options = {}) {
        const { 
            autoClose = false, 
            autoCloseDelay = 1000, 
            isBot = false 
        } = options;
        
        this.log(`💬 Показ сообщения: ${title} (автозакрытие: ${autoClose}, бот: ${isBot})`);
        
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
            this.log(`💬 Автозакрытие через ${autoCloseDelay}ms`);
            this.autoCloseTimer = setTimeout(() => {
                this.log('💬 Автозакрытие модального окна');
                this.closeCurrentModal();
            }, autoCloseDelay);
        }
    }

    showResults(resultsHTML, callback = null) {
        this.log('🏆 Показ результатов игры');
        
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
        
        this.log(`🪟 Модальное окно ${modal.id} показано`);
        
        return true;
    }

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
        
        // ВАЖНО: НЕ сбрасываем callbacks здесь, только в closeCurrentModal
        this.currentModal = null;
        
        this.log('🧹 Все модальные окна принудительно закрыты');
    }

    closeCurrentModal() {
        // Очищаем таймер автозакрытия
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
            this.log('⏰ Таймер автозакрытия очищен');
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
            this.log(`💬 Выполняем callback сообщения`);
            callback();
        } else if (this.currentModal === this.resultsModal && this.resultsCallback) {
            const callback = this.resultsCallback;
            this.resultsCallback = null;
            this.currentModal = null;
            this.log(`🏆 Выполняем callback результатов`);
            callback();
        } else {
            this.currentModal = null;
        }
        
        this.log(`🪟 Модальное окно ${currentModalId} закрыто`);
    }

    submitAnswer() {
        this.log('📤 Попытка отправки ответа...');
        
        const answerInput = document.getElementById('answer-input');
        if (!answerInput) {
            this.error('❌ Поле ввода ответа не найдено');
            return;
        }
        
        if (!this.answerCallback) {
            this.error('❌ Callback для ответа не установлен');
            return;
        }
        
        const answer = answerInput.value.trim();
        this.log(`📤 Отправляем ответ: "${answer}"`);
        
        if (answer === '') {
            this.log('❌ Пустой ответ, показываем предупреждение');
            answerInput.placeholder = 'Пожалуйста, введите ответ';
            answerInput.style.borderColor = '#e74c3c';
            answerInput.focus();
            return;
        }
        
        // Сохраняем callback перед закрытием
        const callback = this.answerCallback;
        this.answerCallback = null;
        
        // Закрываем модальное окно
        this.currentModal.classList.remove('active');
        this.currentModal.style.display = 'none';
        document.body.style.overflow = '';
        this.currentModal = null;
        
        this.log(`✅ Ответ отправлен: "${answer}"`);
        
        // Вызываем callback с небольшой задержкой
        setTimeout(() => {
            this.log(`📞 Вызываем callback с ответом: "${answer}"`);
            callback(answer);
        }, 50);
    }

    skipQuestion() {
        this.log('⏭️ Пропуск вопроса');
        
        // Сохраняем callback перед закрытием
        const callback = this.answerCallback;
        this.answerCallback = null;
        
        // Закрываем модальное окно
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            this.currentModal.style.display = 'none';
            document.body.style.overflow = '';
            this.currentModal = null;
        }
        
        // Вызываем callback с пустым ответом
        if (callback) {
            setTimeout(() => {
                this.log('📞 Вызываем callback с пустым ответом (пропуск)');
                callback('');
            }, 50);
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
            },
            elementStates: {
                submitButton: !!document.getElementById('submit-answer'),
                skipButton: !!document.getElementById('skip-question'),
                answerInput: !!document.getElementById('answer-input'),
                closeMessageButton: !!document.getElementById('close-message'),
                closeResultsButton: !!document.getElementById('close-results')
            }
        };
    }

    // Экстренный сброс всех состояний
    emergencyReset() {
        this.log('🚨 ЭКСТРЕННЫЙ СБРОС ModalManager');
        
        this.forceCloseAll();
        
        // Сбрасываем все callbacks
        this.answerCallback = null;
        this.messageCallback = null;
        this.resultsCallback = null;
        
        // Переинициализация обработчиков
        setTimeout(() => {
            this.setupEventListeners();
            this.log('✅ ModalManager сброшен и переинициализирован');
        }, 100);
    }

    // Тестовый метод для проверки кнопки ответить
    testSubmitButton() {
        this.log('🧪 ТЕСТ КНОПКИ ОТВЕТИТЬ');
        
        const submitBtn = document.getElementById('submit-answer');
        
        if (!submitBtn) {
            this.error('❌ Кнопка submit-answer не найдена');
            return false;
        }
        
        this.log('✅ Кнопка найдена:', submitBtn);
        this.log('Disabled:', submitBtn.disabled);
        this.log('Style display:', submitBtn.style.display);
        this.log('Parent element:', submitBtn.parentElement);
        
        // Проверяем, есть ли обработчики
        submitBtn.click();
        
        return true;
    }
}
