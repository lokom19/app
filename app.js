console.log("Начало выполнения скрипта app.js");

const socket = io();
let telegramUserId = null;
let userName = "Неизвестный игрок"; 

document.addEventListener('DOMContentLoaded', function() {
    console.log("Событие DOMContentLoaded произошло");
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            const telegram = window.Telegram.WebApp;
            console.log("WebApp доступен:", telegram);
            if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
                const user = telegram.initDataUnsafe.user;
                telegramUserId = user.id;
                userName = user.first_name;
                console.log("Имя пользователя:", userName);
            } else {
                console.warn("Пользовательские данные не найдены в initDataUnsafe");
                alert("Пользовательские данные не найдены.");
            }
        } else {
            console.warn("WebApp не доступен");
            alert("WebApp не доступен.");
        }
        socket.emit('setTelegramUser', { telegramUserId, userName });
        updateUserInfo(userName);
    } catch (error) {
        console.error("Ошибка при инициализации:", error.message);
        alert(`Ошибка при инициализации: ${error.message}`);
    }
});

function updateUserInfo(name) {
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        userInfoElement.textContent = `Добро пожаловать, ${name}!`;
    } else {
        console.error("Элемент userInfo не найден");
        alert("Элемент userInfo не найден");
    }
}

// Отправка попытки угадать число
function submitGuess() {
    const guess = document.getElementById('guessNumber').value;
    socket.emit('submitGuess', { guess, telegramUserId });
}

// Получение результатов попытки
socket.on('result', (data) => {
    document.getElementById('result').textContent = data.message;
    socket.emit('requestGameState', { telegramUserId });
});

// Обработка завершения игры
socket.on('gameEnded', (data) => {
    document.getElementById('result').textContent = data.message;
    window.location.href = `winner.html?winnermessage=${encodeURIComponent(data.message)}`;
});

// Получение состояния игры
socket.on('gameState', (data) => {
    document.getElementById('stars').textContent = data.stars;
    document.getElementById('bank').textContent = data.bank;
    if (data.gameEnded) {
        document.getElementById('result').textContent = `Игра завершена, правильное число: ${data.targetNumber}`;
    }
});

console.log("Завершение выполнения скрипта app.js");
