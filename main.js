import { Game } from './core/Game.js';

// Инициализация игры после загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const game = new Game();
        await game.initialize();
        
        // Глобальный доступ для отладки
        window.game = game;
        
        console.log('Игра успешно инициализирована');
    } catch (error) {
        console.error('Ошибка инициализации игры:', error);
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h2>Ошибка загрузки игры</h2>
                <p>Проверьте консоль браузера для получения подробной информации.</p>
            </div>
        `;
    }
});

