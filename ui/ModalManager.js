export class ModalManager {
    constructor() {
        this.modals = new Map();
        this.currentModal = null;
        this.initialized = false;
        this.keyboardHandler = this.handleKeyboard.bind(this);
    }

    initialize() {
        this.findModals();
        this.setupEventListeners();
        this.initialized = true;
        console.log('ModalManager инициализирован');
    }

    findModals() {
        // Находим все модальные окна
        const modalIds = ['question-modal', 'message-modal', 'results-modal'];
        
        modalIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.modals.set(id, {
                    element,
                    isOpen: false,
                    config: this.getModalConfig(id)
                });
            } else {
                console.warn(`Модальное окно ${id} не найдено`);
            }
        });
    }

    getModalConfig(modalId) {
        const configs = {
            'question-modal': {
                closeOnEscape: true,
                closeOnBackdrop: false,
                focusInput: true,
                autoHeight: true
            },
            'message-modal': {
                closeOnEscape: true,
                closeOnBackdrop: true,
                focusInput: false,
                autoHeight: true
            },
            'results-modal': {
                closeOnEscape: true,
                closeOnBackdrop: true,
                focusInput: false,
                autoHeight: false
            }
        };
        
        return configs[modalId] || {};
    }

    setupEventListeners() {
        // Настройка обработчиков для всех модальных окон
        this.modals.forEach((modal, id) => {
            // Клик по фону для закрытия
            modal.element.addEventListener('click', (e) => {
                if (e.target === modal.element && modal.config.closeOnBackdrop) {
                    this.closeModal(id);
                }
            });

            // Предотвращение закрытия при клике по содержимому
            const content = modal.element.querySelector('.modal-content');
            if (content) {
                content.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });
    }

    openModal(modalId, options = {}) {
        if (!this.modals.has(modalId)) {
            console.error(`Модальное окно ${modalId} не найдено`);
            return false;
        }

        // Закрываем текущее модальное окно
        if (this.currentModal) {
            this.closeModal(this.currentModal);
        }

        const modal = this.modals.get(modalId);
        modal.element.classList.add('active');
        modal.isOpen = true;
        this.currentModal = modalId;

        // Добавляем обработчик клавиатуры
        document.addEventListener('keydown', this.keyboardHandler);

        // Фокус на поле ввода если нужно
        if (modal.config.focusInput && options.focusInput !== false) {
            setTimeout(() => {
                const input = modal.element.querySelector('input[type="text"]');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        }

        // Анимация появления
        requestAnimationFrame(() => {
            modal.element.style.opacity = '1';
        });

        return true;
    }

    closeModal(modalId) {
        if (!modalId) {
            modalId = this.currentModal;
        }

        if (!modalId || !this.modals.has(modalId)) {
            return false;
        }

        const modal = this.modals.get(modalId);
        
        // Анимация исчезновения
        modal.element.style.opacity = '0';
        
        setTimeout(() => {
            modal.element.classList.remove('active');
            modal.isOpen = false;
            
            if (this.currentModal === modalId) {
                this.currentModal = null;
                document.removeEventListener('keydown', this.keyboardHandler);
            }
        }, 300);

        return true;
    }

    closeCurrentModal() {
        if (this.currentModal) {
            this.closeModal(this.currentModal);
        }
    }

    showQuestion(questionText, onAnswer) {
        const modal = this.modals.get('question-modal');
        if (!modal) return false;

        // Заполняем содержимое
        const questionElement = document.getElementById('question-text');
        const answerInput = document.getElementById('answer-input');
        const submitBtn = document.getElementById('submit-answer');
        const skipBtn = document.getElementById('skip-question');

        if (questionElement) questionElement.textContent = questionText;
        if (answerInput) answerInput.value = '';

        // Настройка обработчиков
        const handleAnswer = () => {
            const answer = answerInput ? answerInput.value.trim() : '';
            this.closeModal('question-modal');
            if (onAnswer) onAnswer(answer);
        };

        const handleSkip = () => {
            this.closeModal('question-modal');
            if (onAnswer) onAnswer('');
        };

        // Удаляем старые обработчики
        if (submitBtn) {
            submitBtn.replaceWith(submitBtn.cloneNode(true));
            document.getElementById('submit-answer').addEventListener('click', handleAnswer);
        }

        if (skipBtn) {
            skipBtn.replaceWith(skipBtn.cloneNode(true));
            document.getElementById('skip-question').addEventListener('click', handleSkip);
        }

        // Обработчик Enter в поле ввода
        if (answerInput) {
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleAnswer();
                }
            });
        }

        return this.openModal('question-modal');
    }

    showMessage(title, message, onClose) {
        const modal = this.modals.get('message-modal');
        if (!modal) return false;

        // Заполняем содержимое
        const titleElement = document.getElementById('message-title');
        const messageElement = document.getElementById('message-text');
        const closeBtn = document.getElementById('close-message');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;

        // Настройка обработчика закрытия
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            document.getElementById('close-message').addEventListener('click', () => {
                this.closeModal('message-modal');
                if (onClose) onClose();
            });
        }

        return this.openModal('message-modal', { focusInput: false });
    }

    showResults(htmlContent, onClose) {
        const modal = this.modals.get('results-modal');
        if (!modal) return false;

        // Заполняем содержимое
        const contentElement = document.getElementById('results-content');
        const closeBtn = document.getElementById('close-results');

        if (contentElement) contentElement.innerHTML = htmlContent;

        // Настройка обработчика закрытия
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            document.getElementById('close-results').addEventListener('click', () => {
                this.closeModal('results-modal');
                if (onClose) onClose();
            });
        }

        return this.openModal('results-modal', { focusInput: false });
    }

    handleKeyboard(e) {
        if (!this.currentModal) return;

        const modal = this.modals.get(this.currentModal);
        if (!modal) return;

        // Escape для закрытия
        if (e.key === 'Escape' && modal.config.closeOnEscape) {
            this.closeModal(this.currentModal);
            e.preventDefault();
        }

        // Enter для отправки ответа в модальном окне вопроса
        if (e.key === 'Enter' && this.currentModal === 'question-modal') {
            const submitBtn = document.getElementById('submit-answer');
            if (submitBtn) {
                submitBtn.click();
                e.preventDefault();
            }
        }
    }

    isModalOpen(modalId) {
        if (modalId) {
            const modal = this.modals.get(modalId);
            return modal ? modal.isOpen : false;
        }
        return this.currentModal !== null;
    }

    getCurrentModal() {
        return this.currentModal;
    }

    closeAllModals() {
        this.modals.forEach((modal, id) => {
            if (modal.isOpen) {
                this.closeModal(id);
            }
        });
    }
}

