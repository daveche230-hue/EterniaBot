const mineflayer = require('mineflayer');

// НАСТРОЙКИ
const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    hideErrors: true,
    physicsEnabled: false
};
const MC_PASSWORD = '12345678';
const MONEY_AMOUNT = '10000000000000';
const CLAN_AD_TEXT = "Набор в клан Eternia! Fly, 10Т, город, розыгрыши. Активный чат в ТГ. Вступай: /warp Eternia или /clan join Eternia";
const ALLOWED_USERS = ['Dave_che', 'vexrezer'];

let mcBot;
let adInterval = null;

function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("🔥 Бот на сервере.");
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        const lowerText = text.toLowerCase();
        
        // 1. ПРОВЕРКА АВТОРИЗАЦИИ (Ваш ник или друга)
        const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));

        if (isAuthorized) {
            // ПРИВЕТСТВИЕ НОВИЧКОВ
            if (lowerText.includes('вступил в клан') || lowerText.includes('joined the clan')) {
                const words = text.split(' ');
                const playerName = words[0]; 
                if (playerName !== mcBot.username) {
                    mcBot.chat(`/cc Добро пожаловать в Eternia, ${playerName}!`);
                }
            }

            // УПРАВЛЕНИЕ РЕКЛАМОЙ (Строгие проверки)
            if (lowerText.includes('stopad')) {
                if (adInterval) {
                    clearInterval(adInterval);
                    adInterval = null;
                    mcBot.chat('/cc Реклама остановлена.');
                } else {
                    mcBot.chat('/cc Реклама и так не запущена.');
                }
            } else if (lowerText.includes('startad')) {
                if (!adInterval) {
                    mcBot.chat(CLAN_AD_TEXT);
                    adInterval = setInterval(() => mcBot.chat(CLAN_AD_TEXT), 185000);
                    mcBot.chat('/cc Реклама запущена (раз в 3 минуты).');
                } else {
                    mcBot.chat('/cc Реклама уже запущена!');
                }
            } else if (lowerText.includes('ad')) {
                // Выполнится, только если это не startad/stopad
                mcBot.chat(CLAN_AD_TEXT);
                mcBot.chat('/cc Реклама отправлена разово.');
            }
        }

        // АВТО-КОМАНДЫ FLY/MONEY
        if (lowerText.includes('fly') || lowerText.includes('money')) {
            const cmdMatch = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
            if (cmdMatch && cmdMatch[1] !== mcBot.username) {
                if (cmdMatch[2].toLowerCase() === 'fly') {
                    mcBot.chat(`/fly ${cmdMatch[1]}`);
                } else {
                    mcBot.chat(`/eco set ${cmdMatch[1]} ${MONEY_AMOUNT}`);
                }
            }
        }
    });

    mcBot.on('end', () => {
        clearInterval(adInterval);
        setTimeout(createMcBot, 60000);
    });
}

createMcBot();
