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
        
        // НЕ настраиваем дублирующие глобальные обработчики
        // Оставляем только отладочные функции
        setupDebugHandlers(game);
        
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
            
            // ДОПОЛНИТЕЛЬНАЯ ОТЛАДКА: проверяем интерфейс тем
            if (window.game && window.game.debugThemesInterface) {
                log('🔍 Отладка интерфейса тем:');
                const themesDebug = window.game.debugThemesInterface();
                log('Результат отладки тем:', themesDebug);
            }
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

// ТОЛЬКО отладочные функции, БЕЗ дублирующих обработчиков игровых событий
function setupDebugHandlers(game) {
    // Отладочные функции
    window.debugGame = () => {
        console.log('=== СОСТОЯНИЕ ИГРЫ ===');
        console.log('Игроки:', game.gameState.players);
        console.log('Текущий экран:', game.screenManager.getCurrentScreen());
        console.log('Доступные экраны:', Array.from(game.screenManager.screens.keys()));
        console.log('EventHandler инициализирован:', game.eventHandler.initialized);
        console.log('ScreenManager инициализирован:', game.screenManager.initialized);
        console.log('Загружены ли вопросы:', game.questionLoader.loaded);
        console.log('Доступные предметы:', game.availableSubjects);
        console.log('Выбранные темы:', [...game.selectedThemes]);
        
        // Проверяем кнопки
        const buttons = ['add-player', 'add-bot', 'start-game', 'reset-game'];
        console.log('Состояние кнопок:');
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            console.log(`  ${id}:`, {
                exists: !!btn,
                disabled: btn?.disabled,
                visible: btn?.style.display !== 'none',
                hasOnClick: !!btn?.onclick,
                eventListeners: btn?._eventListeners || 'неизвестно'
            });
        });
        
        // Проверяем чекбоксы тем
        const themeCheckboxes = document.querySelectorAll('input[id^="theme-"]');
        console.log(`Найдено ${themeCheckboxes.length} чекбоксов тем:`);
        themeCheckboxes.forEach(cb => {
            console.log(`  ${cb.id}: ${cb.checked ? 'checked' : 'unchecked'} (value: ${cb.value})`);
        });
        
        // Проверяем input поля
        const nameInput = document.getElementById('player-name');
        const botNameInput = document.getElementById('bot-name');
        console.log('Состояние полей ввода:');
        console.log(`  player-name: "${nameInput?.value}" (длина: ${nameInput?.value?.length || 0})`);
        console.log(`  bot-name: "${botNameInput?.value}" (длина: ${botNameInput?.value?.length || 0})`);
        
        return game.getDebugInfo();
    };
    
    // Функция для принудительного пересоздания интерфейса тем
    window.recreateThemesInterface = async () => {
        log('Принудительное пересоздание интерфейса тем...');
        try {
            await game.createSubjectsInterface();
            log('Интерфейс тем пересоздан');
            
            // Обновляем обработчики событий
            game.eventHandler.setupThemeCheckboxes();
            log('Обработчики чекбоксов обновлены');
            
            return true;
        } catch (error) {
            error('Ошибка пересоздания интерфейса тем:', error);
            return false;
        }
    };
    
    // Функция для принудительной разблокировки кнопок
    window.forceUnlockButtons = () => {
        const buttonIds = ['add-player', 'add-bot', 'reset-game'];
        
        buttonIds.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.disabled = false;
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
                log(`Кнопка ${id} принудительно разблокирована`);
            }
        });
    };
    
    // Функция для тестирования добавления игроков
    window.testAddPlayer = (name = 'Тестовый игрок') => {
        log(`Тестовое добавление игрока: ${name}`);
        try {
            const player = game.addPlayer(name, false);
            log('Результат:', player);
            return player;
        } catch (error) {
            error('Ошибка тестового добавления:', error);
            return null;
        }
    };
    
    window.testAddBot = (name = 'Тестовый бот', difficulty = 'medium') => {
        log(`Тестовое добавление бота: ${name} (${difficulty})`);
        try {
            const bot = game.addPlayer(name, true, difficulty);
            log('Результат:', bot);
            return bot;
        } catch (error) {
            error('Ошибка тестового добавления бота:', error);
            return null;
        }
    };
    
    log('Отладочные функции настроены (БЕЗ дублирующих обработчиков игровых событий)');
}

// Запуск инициализации
log('Запуск системы инициализации...');
initializeGame();
