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
const CLAN_AD_TEXT = "!&5&lСейчас проходит набор в клан Eternia &f&lв нем вы получите 10Т,флай,крутых тимейтов, красивый кх,доступ в билд зону,лучший пвп кит,розыгрыши доната. &d&l&nЧтобы вступить пиши /warp Et или /c join Eternia ждём именно тебя.";
const ALLOWED_USERS = ['Dave_che', 'vexrezer'];

let mcBot;
let adInterval = null;
let lastRequestedCommand = { player: null, cmd: null };

function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("Бот на сервере.");
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        console.log("ЧАТ: " + text);
        
        const lowerText = text.toLowerCase();
        const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));

        // 1. ПРИВЕТСТВИЕ НОВИЧКОВ
        if (lowerText.includes('вступил в клан') || lowerText.includes('joined the clan')) {
            const words = text.split(' ');
            const playerName = words[0]; 
            if (playerName !== mcBot.username) {
                mcBot.chat(`/cc Добро пожаловать в Eternia, ${playerName}!`);
            }
        }

        // 2. УПРАВЛЕНИЕ РЕКЛАМОЙ И INFO
        if (isAuthorized) {
            if (lowerText.includes('stopad')) {
                if (adInterval) {
                    clearInterval(adInterval);
                    adInterval = null;
                    mcBot.chat('/cc Реклама остановлена.');
                }
            } else if (lowerText.includes('startad')) {
                if (!adInterval) {
                    mcBot.chat(CLAN_AD_TEXT);
                    adInterval = setInterval(() => mcBot.chat(CLAN_AD_TEXT), 185000);
                    mcBot.chat('/cc Реклама запущена (раз в 3 минуты).');
                }
            } else if (lowerText.includes('info')) {
                mcBot.chat(adInterval ? '/cc Реклама включена.' : '/cc Реклама выключена.');
            } else if (lowerText.includes('ad')) {
                mcBot.chat(CLAN_AD_TEXT);
                mcBot.chat('/cc Реклама отправлена разово.');
            }
        }

        // 3. АВТО-КОМАНДЫ FLY/MONEY И ПЕРЕХВАТ КУЛДАУНА
        // Перехват сообщения из логов: "[*] Эта команда будет доступна через 58 сек."
        if (lastRequestedCommand.player && lowerText.includes('доступна через')) {
            mcBot.chat(`/cc ${lastRequestedCommand.player}, ${text.replace('[*] ', '')}`);
            lastRequestedCommand = { player: null, cmd: null }; // Сброс после оповещения
        }

        const cmdMatch = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
        if (cmdMatch && cmdMatch[1] !== mcBot.username) {
            const playerName = cmdMatch[1];
            const cmdType = cmdMatch[2].toLowerCase();
            
            lastRequestedCommand = { player: playerName, cmd: cmdType };

            if (cmdType === 'fly') {
                mcBot.chat(`/fly ${playerName}`);
            } else if (cmdType === 'money') {
                mcBot.chat(`/eco set ${playerName} ${MONEY_AMOUNT}`);
            }
        }
    });

    mcBot.on('end', () => {
        clearInterval(adInterval);
        setTimeout(createMcBot, 60000);
    });
}

createMcBot();
