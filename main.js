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
        
        // Настраиваем глобальные обработчики как fallback
        setupGlobalHandlers(game);
        
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

// Глобальные функции-обработчики как fallback
function setupGlobalHandlers(game) {
    window.gameActions = {
        addPlayer: () => {
            log('Добавление игрока через глобальный обработчик');
            const nameInput = document.getElementById('player-name');
            const name = nameInput?.value.trim();
            
            if (!name) {
                alert('Введите имя игрока!');
                return;
            }
            
            try {
                const player = game.addPlayer(name, false);
                if (player) {
                    nameInput.value = '';
                    log(`Игрок ${name} добавлен`);
                }
            } catch (error) {
                error('Ошибка добавления игрока:', error);
                alert('Ошибка добавления игрока');
            }
        },
        
        addBot: () => {
            log('Добавление бота через глобальный обработчик');
            const difficultySelect = document.getElementById('bot-difficulty');
            const botNameInput = document.getElementById('bot-name');
            
            const difficulty = difficultySelect?.value || 'medium';
            const name = botNameInput?.value.trim() || 'Бот';
            
            try {
                const player = game.addPlayer(name, true, difficulty);
                if (player) {
                    if (botNameInput) botNameInput.value = '';
                    log(`Бот ${name} добавлен с сложностью ${difficulty}`);
                }
            } catch (error) {
                error('Ошибка добавления бота:', error);
                alert('Ошибка добавления бота');
            }
        },
        
        startGame: () => {
            log('Начало игры через глобальный обработчик');
            
            if (game.gameState.players.length === 0) {
                alert('Добавьте игроков перед началом игры!');
                return;
            }
            
            const selectedThemes = [];
            const checkboxes = document.querySelectorAll('input[id^="theme-"]:checked');
            
            checkboxes.forEach(checkbox => {
                selectedThemes.push(checkbox.value);
            });
            
            if (selectedThemes.length === 0) {
                alert('Выберите хотя бы одну тему вопросов!');
                return;
            }
            
            try {
                game.updateThemes(selectedThemes);
                game.startGame();
                log('Игра началась');
            } catch (error) {
                error('Ошибка начала игры:', error);
                alert('Ошибка начала игры');
            }
        },
        
        resetGame: () => {
            log('Сброс игры через глобальный обработчик');
            if (confirm('Вы уверены, что хотите сбросить всё?')) {
                try {
                    game.resetGame();
                    log('Игра сброшена');
                } catch (error) {
                    error('Ошибка сброса игры:', error);
                    alert('Ошибка сброса игры');
                }
            }
        }
    };
    
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
                visible: btn?.style.display !== 'none'
            });
        });
        
        // Проверяем чекбоксы тем
        const themeCheckboxes = document.querySelectorAll('input[id^="theme-"]');
        console.log(`Найдено ${themeCheckboxes.length} чекбоксов тем:`);
        themeCheckboxes.forEach(cb => {
            console.log(`  ${cb.id}: ${cb.checked ? 'checked' : 'unchecked'} (value: ${cb.value})`);
        });
        
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
    
    log('Глобальные обработчики настроены');
}

// Запуск инициализации
log('Запуск системы инициализации...');
initializeGame();
