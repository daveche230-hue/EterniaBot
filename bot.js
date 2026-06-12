const mineflayer = require('mineflayer');

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
let lastPlayer = null; // Кто последний запрашивал

function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => { mcBot.chat('/s1'); setTimeout(() => mcBot.chat('/c join Eternia'), 3000); }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        const lowerText = text.toLowerCase();
        console.log("ЧАТ: " + text);

        // 1. ПЕРЕХВАТ КУЛДАУНА
        // Если сервер пишет эту фразу, и мы знаем, кто просил - пишем в клан чат
        if (lowerText.includes('эта команда будет доступна через') && lastPlayer) {
            mcBot.chat(`/cc ${lastPlayer}, ${text.replace('[*] ', '')}`);
            lastPlayer = null; // Сбрасываем
        }

        // 2. ОБРАБОТКА КОМАНД
        const cmdMatch = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
        if (cmdMatch && cmdMatch[1] !== mcBot.username) {
            lastPlayer = cmdMatch[1]; // Запоминаем игрока
            
            if (cmdMatch[2].toLowerCase() === 'fly') {
                mcBot.chat(`/fly ${lastPlayer}`);
            } else {
                mcBot.chat(`/eco set ${lastPlayer} ${MONEY_AMOUNT}`);
            }
        }

        // 3. ПРИВЕТСТВИЕ И РЕКЛАМА (оставляем без изменений)
        if (lowerText.includes('вступил в клан') || lowerText.includes('joined the clan')) {
            const words = text.split(' ');
            const playerName = words[0]; 
            if (playerName !== mcBot.username) mcBot.chat(`/cc Добро пожаловать в Eternia, ${playerName}!`);
        }

        const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));
        if (isAuthorized) {
            if (lowerText.includes('stopad')) { clearInterval(adInterval); adInterval = null; mcBot.chat('/cc Реклама остановлена.'); }
            else if (lowerText.includes('startad')) { 
                if (!adInterval) { mcBot.chat(CLAN_AD_TEXT); adInterval = setInterval(() => mcBot.chat(CLAN_AD_TEXT), 185000); mcBot.chat('/cc Реклама запущена.'); }
            }
        }
    });

    mcBot.on('end', () => setTimeout(createMcBot, 60000));
}

createMcBot();
