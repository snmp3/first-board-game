import { SCREENS } from '../core/Constants.js';

export class ScreenManager {
    constructor() {
        this.currentScreen = SCREENS.MENU;
        this.screenHistory = [SCREENS.MENU];
        this.screens = new Map();
        this.initialized = false;
        this.debug = true;
    }

    log(...args) {
        if (this.debug) {
            console.log('[ScreenManager]', ...args);
        }
    }

    error(...args) {
        console.error('[ScreenManager]', ...args);
    }

    initialize() {
        this.log('Инициализация ScreenManager...');
        
        // Ждем полной загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeScreens();
            });
        } else {
            this.initializeScreens();
        }
    }

    initializeScreens() {
        this.findScreenElements();
        this.setupTransitions();
        this.initialized = true;
        this.log('✅ ScreenManager инициализирован');
        
        // Показываем главное меню
        this.showScreen(SCREENS.MENU, false);
    }

    findScreenElements() {
        this.log('Поиск элементов экранов...');
        
        // Список всех ожидаемых экранов
        const expectedScreens = Object.values(SCREENS);
        this.log('Ожидаемые экраны:', expectedScreens);
        
        // Поиск каждого экрана
        expectedScreens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                this.screens.set(screenId, element);
                this.log(`✅ Экран найден: ${screenId}`);
            } else {
                this.error(`❌ Экран не найден: ${screenId}`);
            }
        });

        // Дополнительная проверка всех элементов с классом 'screen'
        const allScreenElements = document.querySelectorAll('.screen');
        this.log(`Найдено элементов с классом 'screen': ${allScreenElements.length}`);
        
        allScreenElements.forEach(element => {
            if (element.id) {
                this.log(`Найден экран в DOM: ${element.id}`);
                if (!this.screens.has(element.id)) {
                    this.screens.set(element.id, element);
                    this.log(`Добавлен неожиданный экран: ${element.id}`);
                }
            } else {
                this.log('Найден экран без ID:', element);
            }
        });

        // Проверяем что нашли хотя бы главное меню
        if (!this.screens.has(SCREENS.MENU)) {
            this.error('❌ Критическая ошибка: главное меню не найдено!');
            this.createFallbackScreen();
        }
    }

    createFallbackScreen() {
        this.log('Создание резервного экрана...');
        
        // Ищем любой элемент с классом screen
        let menuElement = document.querySelector('.screen');
        
        if (!menuElement) {
            // Создаем элемент если его вообще нет
            menuElement = document.createElement('div');
            menuElement.id = SCREENS.MENU;
            menuElement.className = 'screen active';
            menuElement.innerHTML = `
                <h1>Игра загружается...</h1>
                <p>Если вы видите это сообщение, возможно есть проблема с загрузкой интерфейса.</p>
            `;
            document.body.appendChild(menuElement);
            this.log('Создан новый элемент меню');
        } else {
            // Используем первый найденный экран как главное меню
            menuElement.id = SCREENS.MENU;
            this.log('Переназначен существующий экран как главное меню');
        }
        
        this.screens.set(SCREENS.MENU, menuElement);
    }

    setupTransitions() {
        this.log('Настройка переходов...');
        
        this.screens.forEach((element, screenId) => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            if (screenId === this.currentScreen) {
                element.classList.add('active');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.display = 'block';
            } else {
                element.classList.remove('active');
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.display = 'none';
            }
        });
    }

    showScreen(screenId, addToHistory = true) {
        this.log(`Попытка показать экран: ${screenId}`);
        
        if (!this.screens.has(screenId)) {
            this.error(`Экран ${screenId} не найден. Доступные экраны:`, Array.from(this.screens.keys()));
            
            // Попытка найти экран еще раз
            const element = document.getElementById(screenId);
            if (element) {
                this.log(`Экран ${screenId} найден при повторном поиске`);
                this.screens.set(screenId, element);
            } else {
                this.error(`Экран ${screenId} действительно отсутствует в DOM`);
                return false;
            }
        }

        if (screenId === this.currentScreen) {
            this.log(`Экран ${screenId} уже активен`);
            return true;
        }

        // Скрываем текущий экран
        const currentElement = this.screens.get(this.currentScreen);
        if (currentElement) {
            currentElement.classList.remove('active');
            currentElement.style.opacity = '0';
            currentElement.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                currentElement.style.display = 'none';
            }, 300);
        }

        // Показываем новый экран
        setTimeout(() => {
            const newElement = this.screens.get(screenId);
            if (newElement) {
                newElement.style.display = 'block';
                newElement.classList.add('active');
                
                // Принудительный reflow для плавной анимации
                newElement.offsetHeight;
                
                newElement.style.opacity = '1';
                newElement.style.transform = 'translateY(0)';
                
                this.log(`✅ Экран ${screenId} показан`);
            }

            // Обновляем историю
            if (addToHistory && screenId !== this.currentScreen) {
                this.screenHistory.push(screenId);
                if (this.screenHistory.length > 10) {
                    this.screenHistory.shift();
                }
            }

            const previousScreen = this.currentScreen;
            this.currentScreen = screenId;

            // Запускаем событие смены экрана
            this.dispatchScreenChange(previousScreen, screenId);
        }, 150);

        return true;
    }

    hideCurrentScreen() {
        const currentElement = this.screens.get(this.currentScreen);
        if (currentElement) {
            currentElement.classList.remove('active');
            currentElement.style.opacity = '0';
            currentElement.style.transform = 'translateY(20px)';
            setTimeout(() => {
                currentElement.style.display = 'none';
            }, 300);
        }
    }

    goBack() {
        if (this.screenHistory.length > 1) {
            this.screenHistory.pop(); // Удаляем текущий экран
            const previousScreen = this.screenHistory[this.screenHistory.length - 1];
            this.showScreen(previousScreen, false);
            return true;
        }
        return false;
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    getScreenHistory() {
        return [...this.screenHistory];
    }

    isScreenVisible(screenId) {
        return this.currentScreen === screenId;
    }

    addScreen(screenId, element) {
        if (this.screens.has(screenId)) {
            this.log(`Экран ${screenId} уже существует, обновляем`);
        }

        this.screens.set(screenId, element);
        element.classList.add('screen');
        element.style.display = 'none';
        
        if (this.initialized) {
            this.setupTransitionForElement(element);
        }

        this.log(`Экран ${screenId} добавлен`);
        return true;
    }

    removeScreen(screenId) {
        if (!this.screens.has(screenId)) {
            return false;
        }

        if (this.currentScreen === screenId) {
            this.goBack() || this.showScreen(SCREENS.MENU);
        }

        this.screens.delete(screenId);
        
        // Удаляем из истории
        this.screenHistory = this.screenHistory.filter(id => id !== screenId);
        
        this.log(`Экран ${screenId} удален`);
        return true;
    }

    setupTransitionForElement(element) {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.display = 'none';
    }

    dispatchScreenChange(from, to) {
        const event = new CustomEvent('screenChange', {
            detail: {
                from,
                to,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        this.log(`Событие смены экрана: ${from} → ${to}`);
    }

    onScreenChange(callback) {
        document.addEventListener('screenChange', callback);
    }

    offScreenChange(callback) {
        document.removeEventListener('screenChange', callback);
    }

    reset() {
        this.currentScreen = SCREENS.MENU;
        this.screenHistory = [SCREENS.MENU];
        this.showScreen(SCREENS.MENU, false);
        this.log('ScreenManager сброшен');
    }

    // Утилитарные методы для быстрого доступа
    showMenu() {
        return this.showScreen(SCREENS.MENU);
    }

    showGame() {
        return this.showScreen(SCREENS.GAME);
    }

    // Отладочные методы
    debugInfo() {
        this.log('=== DEBUG INFO ===');
        this.log('Текущий экран:', this.currentScreen);
        this.log('История экранов:', this.screenHistory);
        this.log('Найденные экраны:', Array.from(this.screens.keys()));
        this.log('Инициализирован:', this.initialized);
        
        // Проверяем DOM
        this.log('Элементы с классом screen в DOM:');
        document.querySelectorAll('.screen').forEach(el => {
            this.log(`  - ${el.id || 'без ID'}: ${el.classList.contains('active') ? 'активен' : 'неактивен'}`);
        });
        
        return this.screens;
    }
}
