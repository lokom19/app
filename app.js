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
            console.log("Telegram WebApp найден");
            if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
                user = telegram.initDataUnsafe.user;
                console.log("Данные пользователя получены от Telegram:", user);
            } else {
                console.log("Пользовательские данные не найдены в Telegram.initDataUnsafe");
            }
        } else {
            console.log("Telegram WebApp не найден");
        }

        if (user) {
            telegramUserId = user.id;
            userName = user.first_name;
            saveUserDataToFile(user);
            console.log("Имя пользователя установлено:", userName);
        } else {
            console.log("Telegram не доступен, используем имя по умолчанию.");
        }

        // Отправляем данные о пользователе на сервер
        socket.emit('setTelegramUser', { telegramUserId, userName });
        console.log("Отправлены данные на сервер: ", { telegramUserId, userName });

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

// Отправка попытки угадать число
function submitGuess() {
    const guess = document.getElementById('guessNumber').value;
    socket.emit('submitGuess', { guess, telegramUserId });
}

// Получение результатов попытки
socket.on('result', (data) => {
    document.getElementById('result').textContent = data.message;
    // Запрашиваем текущее состояние после каждой попытки
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

console.log("Завершение выполнения скрипта app.js");  // Отладочное сообщение
