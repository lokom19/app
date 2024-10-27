console.log("Начало выполнения скрипта app.js");

const socket = io();
let telegramUserId = null;
let userName = "Неизвестный игрок";

document.addEventListener('DOMContentLoaded', function() {
    console.log("Событие DOMContentLoaded произошло");

    try {
        const telegram = window.Telegram.WebApp;
        if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
            const user = telegram.initDataUnsafe.user;
            telegramUserId = user.id;
            userName = user.first_name;
            console.log("Имя пользователя из Telegram:", userName);
        } else {
            console.log("Не удалось получить данные о пользователе из Telegram.");
        }

        socket.emit('setTelegramUser', { telegramUserId, userName });

        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `Добро пожаловать, ${userName}!`;
            console.log("Элемент userInfo обновлен:", userName);
        } else {
            console.error("Элемент с id 'userInfo' не найден.");
        }
    } catch (error) {
        console.error("Ошибка при инициализации:", error.message);
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `Добро пожаловать, ${userName}!`;
        }
    }
});

function submitGuess() {
    const guess = document.getElementById('guessNumber').value;
    socket.emit('submitGuess', { guess, telegramUserId });
}

socket.on('result', (data) => {
    document.getElementById('result').textContent = data.message;
    socket.emit('requestGameState', { telegramUserId });
});

socket.on('gameEnded', (data) => {
    document.getElementById('result').textContent = data.message;
    window.location.href = `winner.html?winnermessage=${encodeURIComponent(data.message)}`;
});

socket.on('gameState', (data) => {
    document.getElementById('stars').textContent = data.stars;
    document.getElementById('bank').textContent = data.bank;
    if (data.gameEnded) {
        document.getElementById('result').textContent = `Игра завершена, правильное число: ${data.targetNumber}`;
    }
});

console.log("Завершение выполнения скрипта app.js");
