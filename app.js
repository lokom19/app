console.log("Начало выполнения скрипта app.js");  // Отладочное сообщение

const socket = io();
let telegramUserId = null;
let userName = "Неизвестный игрок";  // По умолчанию будет "Неизвестный игрок"

document.addEventListener('DOMContentLoaded', function() {
    console.log("Событие DOMContentLoaded произошло");

    try {
        let user;
        if (window.Telegram && window.Telegram.WebApp) {
            const telegram = window.Telegram.WebApp;
            if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
                user = telegram.initDataUnsafe.user;
            }
        }

        if (user) {
            telegramUserId = user.id;
            userName = user.first_name;
            saveUserDataToFile(user);
            console.log("Имя пользователя:", userName);
        } else {
            console.log("Telegram не доступен, используем имя по умолчанию.");
        }

        // Устанавливаем количество звезд по умолчанию
        const stars = user ? 10 : 100;

        // Отправляем данные о пользователе на сервер
        socket.emit('setTelegramUser', { telegramUserId, userName });

        // Обновляем элемент userInfo
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `Добро пожаловать, ${userName}!`;
            console.log("Элемент userInfo обновлен.");
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

function saveUserDataToFile(user) {
    const userNameForFile = user ? user.first_name : "Неизвестный игрок";
    const userData = `User Info: ${JSON.stringify(user)}\nTarget Number: ${targetNumber}`;
    const blob = new Blob([userData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${userNameForFile}_info.txt`;
    link.click();
}

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

console.log("Завершение выполнения скрипта app.js");  // Отладочное сообщение
