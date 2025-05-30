import { SCREENS } from '../core/Constants.js';

export class ScreenManager {
    constructor() {
        this.currentScreen = SCREENS.MENU;
        this.screenHistory = [SCREENS.MENU];
        this.screens = new Map();
        this.initialized = false;
    }

    initialize() {
        this.findScreenElements();
        this.setupTransitions();
        this.initialized = true;
        console.log('ScreenManager инициализирован');
    }

    findScreenElements() {
        // Находим все экраны по их ID
        Object.values(SCREENS).forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                this.screens.set(screenId, element);
            } else {
                console.warn(`Экран ${screenId} не найден в DOM`);
            }
        });
    }

    setupTransitions() {
        // Настройка CSS переходов для плавного переключения
        this.screens.forEach((element, screenId) => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = screenId === this.currentScreen ? '1' : '0';
            element.style.transform = screenId === this.currentScreen ? 'translateY(0)' : 'translateY(20px)';
        });
    }

    showScreen(screenId, addToHistory = true) {
        if (!this.screens.has(screenId)) {
            console.error(`Экран ${screenId} не найден`);
            return false;
        }

        if (screenId === this.currentScreen) {
            return true; // Уже показан
        }

        // Скрываем текущий экран
        const currentElement = this.screens.get(this.currentScreen);
        if (currentElement) {
            currentElement.classList.remove('active');
            currentElement.style.opacity = '0';
            currentElement.style.transform = 'translateY(-20px)';
        }

        // Показываем новый экран
        setTimeout(() => {
            const newElement = this.screens.get(screenId);
            if (newElement) {
                newElement.classList.add('active');
                newElement.style.opacity = '1';
                newElement.style.transform = 'translateY(0)';
            }

            // Обновляем историю
            if (addToHistory && screenId !== this.currentScreen) {
                this.screenHistory.push(screenId);
                if (this.screenHistory.length > 10) {
                    this.screenHistory.shift(); // Ограничиваем историю
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
            console.warn(`Экран ${screenId} уже существует`);
            return false;
        }

        this.screens.set(screenId, element);
        element.classList.add('screen');
        element.style.display = 'none';
        
        if (this.initialized) {
            this.setupTransitionForElement(element);
        }

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
        
        return true;
    }

    setupTransitionForElement(element) {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
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
    }

    // Утилитарные методы для быстрого доступа
    showMenu() {
        return this.showScreen(SCREENS.MENU);
    }

    showGame() {
        return this.showScreen(SCREENS.GAME);
    }

    showSettings() {
        return this.showScreen(SCREENS.SETTINGS);
    }

    showResults() {
        return this.showScreen(SCREENS.RESULTS);
    }
}

