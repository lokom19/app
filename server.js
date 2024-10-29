const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let targetNumber = Math.floor(Math.random() * 1000000) + 1;
let bank = 0;
let gameEnded = false;

function loadUserData() {
    if (fs.existsSync('users.json')) {
        const data = fs.readFileSync('users.json');
        return JSON.parse(data);
    } else {
        return {};
    }
}

function saveUserData(users) {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

let users = loadUserData();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.static('.'));

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    
    socket.on('setTelegramUser', (data) => {
        console.log('Получен запрос от пользователя:', data);
        const telegramUserId = data.telegramUserId;
        const userName = data.userName || "Неизвестный пользователь";

        if (telegramUserId) {
            if (!users[telegramUserId]) {
                users[telegramUserId] = { stars: 5, userName: userName };
                saveUserData(users);
            }
            socket.emit('gameState', { targetNumber, bank, stars: users[telegramUserId].stars, gameEnded });
        } else {
            socket.emit('result', { message: 'Ошибка: данные пользователя не получены.' });
            console.log("Ошибка: TelegramUserId не указан.");
        }
    });

    socket.on('submitGuess', (data) => {
        const telegramUserId = data.telegramUserId;

        if (!telegramUserId || !users[telegramUserId]) {
            socket.emit('result', { message: 'Ошибка: пользователь не найден. Попробуйте заново.' });
            return;
        }

        let guess = parseInt(data.guess);
        let user = users[telegramUserId];

        if (gameEnded) {
            socket.emit('result', { message: 'Игра окончена. Число уже угадано!' });
            return;
        }

        if (isNaN(guess) || guess < 1 || guess > 1000000) {
            socket.emit('result', { message: 'Введите число от 1 до 1,000,000.' });
            return;
        }

        if (user.stars <= 0) {
            socket.emit('result', { message: 'У вас недостаточно звёзд!' });
            return;
        }

        user.stars--;
        bank++;
        saveUserData(users);

        if (guess === targetNumber) {
            gameEnded = true;
            io.emit('gameEnded', {
                message: `Поздравляем, ${user.userName}! Вы угадали число ${targetNumber} и выиграли ${bank} звёзд!`,
                winner: user.userName,
                targetNumber,
                bank
            });
        } else if (guess < targetNumber) {
            socket.emit('result', { message: 'Ваше число меньше загаданного.' });
        } else {
            socket.emit('result', { message: 'Ваше число больше загаданного.' });
        }
    });

    socket.on('requestGameState', (data) => {
        const telegramUserId = data.telegramUserId;
        if (telegramUserId && users[telegramUserId]) {
            socket.emit('gameState', { targetNumber, bank, stars: users[telegramUserId].stars, gameEnded });
        } else {
            socket.emit('result', { message: 'Ошибка: пользователь не найден.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        saveUserData(users);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
