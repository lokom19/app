console.log("Начало выполнения скрипта app.js");

class TelegramGameApp {
    constructor() {
        this.socket = io();
        this.telegram = null;
        this.userName = "Неизвестный игрок";
        this.telegramUserId = null;
        this.targetNumber = Math.floor(Math.random() * 1000000) + 1;
        this.stars = 5;
        this.bank = 0;
        this.gameEnded = false;

        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    }

    async init() {
        await this.checkTelegramWebApp();  // Асинхронная проверка Telegram WebApp
        this.initializeUI();
        this.registerSocketEvents();
    }

    async checkTelegramWebApp() {
        try {
            // Ждем, пока window.Telegram не станет доступен
            await this.waitForTelegram();
            
            if (window.Telegram && window.Telegram.WebApp) {
                console.log("Telegram WebApp найден");
                this.telegram = window.Telegram.WebApp;
                const user = this.telegram.initDataUnsafe?.user;

                if (user) {
                    this.telegramUserId = user.id;
                    this.userName = user.first_name;
                    console.log(`Имя пользователя: ${this.userName}`);
                    this.saveUserDataToFile(user);
                } else {
                    console.log("Пользовательские данные не найдены в Telegram.initDataUnsafe");
                }
            } else {
                console.log("Telegram WebApp не найден. Пожалуйста, откройте приложение через Telegram.");
            }

            // Отправляем данные на сервер
            this.socket.emit('setTelegramUser', { telegramUserId: this.telegramUserId, userName: this.userName });
            console.log("Отправлены данные на сервер:", { telegramUserId: this.telegramUserId, userName: this.userName });
        } catch (error) {
            console.error("Ошибка при проверке Telegram WebApp:", error);
        }
    }

    async waitForTelegram() {
        // Ждем до 5 секунд, пока window.Telegram не станет доступен
        const maxAttempts = 10;
        let attempts = 0;

        while (!window.Telegram && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        if (!window.Telegram) {
            throw new Error("Telegram WebApp не инициализировался.");
        }
    }

    initializeUI() {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `Добро пожаловать, ${this.userName}!`;
            console.log("Элемент userInfo обновлен.");
        } else {
            console.log("Элемент с id 'userInfo' не найден.");
        }

        document.getElementById('stars').textContent = this.stars;
        document.getElementById('bank').textContent = this.bank;
    }

    saveUserDataToFile(user) {
        const userNameForFile = user ? user.first_name : "Неизвестный игрок";
        const userData = `User Info: ${JSON.stringify(user)}\nTarget Number: ${this.targetNumber}`;
        const blob = new Blob([userData], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${userNameForFile}_info.txt`;
        link.click();
    }

    submitGuess() {
        const guess = parseInt(document.getElementById('guessNumber').value);
        if (this.gameEnded) {
            document.getElementById('result').textContent = 'Игра окончена. Число уже угадано!';
            return;
        }

        if (isNaN(guess) || guess < 1 || guess > 1000000) {
            document.getElementById('result').textContent = 'Пожалуйста, введите корректное число от 1 до 1,000,000.';
            return;
        }

        if (this.stars <= 0) {
            document.getElementById('result').textContent = 'У вас недостаточно звёзд!';
            return;
        }

        this.stars--;
        this.bank++;

        this.socket.emit('submitGuess', { guess, telegramUserId: this.telegramUserId });
    }

    registerSocketEvents() {
        this.socket.on('result', (data) => {
            document.getElementById('result').textContent = data.message;
            this.socket.emit('requestGameState', { telegramUserId: this.telegramUserId });
        });

        this.socket.on('gameEnded', (data) => {
            document.getElementById('result').textContent = data.message;
            window.location.href = `winner.html?winnermessage=${encodeURIComponent(data.message)}`;
        });

        this.socket.on('gameState', (data) => {
            document.getElementById('stars').textContent = data.stars;
            document.getElementById('bank').textContent = data.bank;
            if (data.gameEnded) {
                document.getElementById('result').textContent = `Игра завершена, правильное число: ${data.targetNumber}`;
                this.gameEnded = true;
            }
        });
    }
}

// Инициализация приложения
const app = new TelegramGameApp();

// Кнопка для отправки числа
document.getElementById('submitButton').addEventListener('click', () => app.submitGuess());
