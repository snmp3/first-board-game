export class UIRenderer {
    constructor() {
        this.templates = new Map();
        this.components = new Map();
        this.initialized = false;
    }

    initialize() {
        this.setupTemplates();
        this.initialized = true;
        console.log('UIRenderer инициализирован');
    }

    setupTemplates() {
        // Шаблон элемента игрока
        this.templates.set('player-item', (player) => `
            <div class="player-item" style="border-left: 4px solid ${player.color}">
                <div class="player-info">
                    <span class="player-name">${player.name} ${player.isBot ? '(Бот)' : ''}</span>
                    <span class="player-position">Позиция: ${player.position + 1}/120</span>
                </div>
                <div class="player-stats">
                    <small>Точность: ${player.accuracy || 0}%</small>
                </div>
            </div>
        `);

        // Шаблон статистики игрока
        this.templates.set('player-stat', (player) => `
            <div class="player-stat" style="border-left: 4px solid ${player.color}">
                <h4>${player.name}</h4>
                <div class="stat-line">Позиция: ${player.position + 1}/120</div>
                <div class="stat-line">Вопросов: ${player.questionsAnswered}</div>
                <div class="stat-line">Правильных: ${player.correctAnswers}</div>
                <div class="stat-line">Точность: ${player.accuracy}%</div>
            </div>
        `);

        // Шаблон результатов игры
        this.templates.set('game-results', (winner, players) => `
            <div class="game-results">
                <h2>🎉 Победитель: ${winner.name}!</h2>
                <div class="results-stats">
                    ${players.map(player => this.templates.get('player-stat')(player)).join('')}
                </div>
            </div>
        `);
    }

    renderPlayersList(players, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        if (players.length === 0) {
            container.innerHTML = '<p class="no-players">Игроки не добавлены</p>';
            return true;
        }

        const playersHTML = players.map(player => 
            this.templates.get('player-item')(player)
        ).join('');

        container.innerHTML = playersHTML;
        return true;
    }

    renderCurrentPlayer(player, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !player) return false;

        container.textContent = `Ход: ${player.name}`;
        container.style.color = player.color;
        container.style.fontWeight = 'bold';

        // Добавляем анимацию
        container.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);

        return true;
    }

    renderDiceResult(value, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        container.textContent = value !== null ? value.toString() : '-';
        
        if (value !== null) {
            container.style.animation = 'dice-roll 0.5s ease-out';
            setTimeout(() => {
                container.style.animation = '';
            }, 500);
        }

        return true;
    }

    renderGameResults(winner, players, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        const resultsHTML = this.templates.get('game-results')(winner, players);
        container.innerHTML = resultsHTML;

        return true;
    }

    updatePlayerPosition(player, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        const playerElement = container.querySelector(`[data-player-id="${player.id}"]`);
        if (playerElement) {
            const positionElement = playerElement.querySelector('.player-position');
            if (positionElement) {
                positionElement.textContent = `Позиция: ${player.position + 1}/120`;
                
                // Анимация обновления
                positionElement.style.animation = 'highlight 0.3s ease-in-out';
                setTimeout(() => {
                    positionElement.style.animation = '';
                }, 300);
            }
        }

        return true;
    }

    showLoadingIndicator(containerId, message = 'Загрузка...') {
        const container = document.getElementById(containerId);
        if (!container) return false;

        container.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <span>${message}</span>
            </div>
        `;

        return true;
    }

    hideLoadingIndicator(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        const loader = container.querySelector('.loading-indicator');
        if (loader) {
            loader.remove();
        }

        return true;
    }

    showMessage(message, type = 'info', duration = 3000) {
        const messageElement = document.createElement('div');
        messageElement.className = `toast-message toast-${type}`;
        messageElement.textContent = message;

        // Стили для toast сообщения
        Object.assign(messageElement.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Цвета для разных типов
        const colors = {
            info: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c'
        };

        messageElement.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(messageElement);

        // Автоматическое удаление
        setTimeout(() => {
            messageElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, duration);

        return messageElement;
    }

    createProgressBar(containerId, value = 0, max = 100) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const progressHTML = `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(value / max) * 100}%"></div>
                </div>
                <span class="progress-text">${value}/${max}</span>
            </div>
        `;

        container.innerHTML = progressHTML;
        return container.querySelector('.progress-fill');
    }

    updateProgressBar(containerId, value, max = 100) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        const progressFill = container.querySelector('.progress-fill');
        const progressText = container.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = `${(value / max) * 100}%`;
        }

        if (progressText) {
            progressText.textContent = `${value}/${max}`;
        }

        return true;
    }

    addCustomComponent(name, template) {
        this.templates.set(name, template);
    }

    renderCustomComponent(name, data, containerId) {
        const container = document.getElementById(containerId);
        const template = this.templates.get(name);

        if (!container || !template) return false;

        container.innerHTML = template(data);
        return true;
    }

    clearContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        container.innerHTML = '';
        return true;
    }

    addClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
            return true;
        }
        return false;
    }

    removeClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
            return true;
        }
        return false;
    }

    toggleClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle(className);
            return true;
        }
        return false;
    }
}

