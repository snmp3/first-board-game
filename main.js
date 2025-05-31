import { Game } from './core/Game.js';

// Система отладки
const DEBUG = true;

function log(...args) {
    if (DEBUG) {
        console.log('[Game Init]', ...args);
    }
}

function error(...args) {
    console.error('[Game Error]', ...args);
}

// Основная функция инициализации
async function initializeGame() {
    try {
        log('🚀 Начинаем инициализацию игры...');
        
        // Показываем индикатор загрузки
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.add('active');
        }
        
        // Создаем и инициализируем игру
        log('Создаем экземпляр игры...');
        const game = new Game();
        
        log('Инициализируем игру...');
        await game.initialize();
        
        // Скрываем индикатор загрузки
        if (loadingElement) {
            loadingElement.classList.remove('active');
        }
        
        // Глобальный доступ для отладки
        window.game = game;
        
        log('✅ Игра успешно инициализирована');
        log('Для отладки используйте: window.debugGame()');
        
        // Проверяем работу кнопок через 1 секунду
        setTimeout(() => {
            log('Проверяем состояние системы...');
            window.debugGame?.();
        }, 1000);
        
    } catch (error) {
        error('❌ Критическая ошибка инициализации:', error);
        
        // Скрываем индикатор загрузки
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.remove('active');
        }
        
        // Показываем ошибку
        const errorElement = document.getElementById('error-display');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.innerHTML = `
                <h3>Ошибка загрузки игры</h3>
                <p><strong>Ошибка:</strong> ${error.message}</p>
                <p>Проверьте консоль браузера (F12) для получения подробной информации.</p>
                <button onclick="location.reload()" class="btn">Перезагрузить страницу</button>
            `;
        }
    }
}

// ТОЛЬКО отладочные функции
function setupDebugHandlers(game) {
    // Отладочные функции
    window.debugGame = () => {
        console.log('=== СОСТОЯНИЕ ИГРЫ ===');
        console.log('Игроки:', game.gameState.players);
        console.log('Текущий экран:', game.screenManager.getCurrentScreen());
        console.log('EventHandler инициализирован:', game.eventHandler.initialized);
        console.log('ScreenManager инициализирован:', game.screenManager.initialized);
        console.log('Загружены ли вопросы:', game.questionLoader.loaded);
        console.log('Доступные предметы:', game.availableSubjects);
        console.log('Выбранные темы:', [...game.selectedThemes]);
        console.log('ModalManager состояние:', game.modalManager.getDebugInfo());
        
        return game.getDebugInfo();
    };
    
    // НОВАЯ функция экстренного исправления зависших модальных окон
    window.fixModals = () => {
        log('🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ МОДАЛЬНЫХ ОКОН');
        
        if (window.game && window.game.emergencyFixModals) {
            window.game.emergencyFixModals();
            log('✅ Попытка исправления завершена');
        } else if (window.game && window.game.modalManager) {
            window.game.modalManager.emergencyReset();
            log('✅ ModalManager сброшен');
        } else {
            log('❌ Функция экстренного исправления недоступна');
        }
        
        return window.game?.modalManager?.getDebugInfo();
    };
    
    // Функция тестирования модального окна вопроса
    window.testQuestionModal = () => {
        log('🧪 ТЕСТ МОДАЛЬНОГО ОКНА ВОПРОСА');
        
        if (!window.game || !window.game.modalManager) {
            log('❌ ModalManager недоступен');
            return false;
        }
        
        try {
            window.game.modalManager.showQuestion(
                'Тестовый вопрос: сколько будет 2+2?',
                (answer) => {
                    log(`✅ Получен ответ: "${answer}"`);
                    alert(`Вы ответили: "${answer}"`);
                }
            );
            
            log('✅ Тестовое модальное окно показано');
            return true;
        } catch (error) {
            log('❌ Ошибка показа тестового модального окна:', error);
            return false;
        }
    };
    
    // Функция проверки кнопок в модальном окне
    window.checkModalButtons = () => {
        log('🔍 ПРОВЕРКА КНОПОК МОДАЛЬНОГО ОКНА');
        
        const elements = {
            submitButton: document.getElementById('submit-answer'),
            skipButton: document.getElementById('skip-question'),
            answerInput: document.getElementById('answer-input'),
            questionModal: document.getElementById('question-modal')
        };
        
        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                log(`✅ ${name}:`, {
                    exists: true,
                    disabled: element.disabled,
                    visible: element.style.display !== 'none',
                    hasListeners: !!element.onclick || element.addEventListener.length > 0
                });
            } else {
                log(`❌ ${name}: не найден`);
            }
        });
        
        return elements;
    };
    
    log('Отладочные функции настроены');
    log('Доступные команды:');
    log('- window.debugGame() - общая отладка');
    log('- window.fixModals() - исправление модальных окон');
    log('- window.testQuestionModal() - тест модального окна вопроса');
    log('- window.checkModalButtons() - проверка кнопок модального окна');
}

// Запуск инициализации
log('Запуск системы инициализации...');
initializeGame().then(() => {
    if (window.game) {
        setupDebugHandlers(window.game);
    }
});
