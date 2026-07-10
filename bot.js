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
// ВАШ НОВЫЙ ТЕКСТ РЕКЛАМЫ
const CLAN_AD_TEXT = "!&5&lСейчас проходит набор в клан Eternia &f&lв нем вы получите 10Т,флай,крутых тимейтов, красивый кх,доступ в билд зону,лучший пвп кит,розыгрыши доната. &d&l&nЧтобы вступить пиши /warp Et или /c join Eternia ждём именно тебя.";
const ALLOWED_USERS = ['Dave_che', 'vexrezer','TyanochaHvH'];

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
        console.log("ЧАТ: " + text); // Логирование чата возвращено
        
        const lowerText = text.toLowerCase();
        const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));

        // 1. ПРИВЕТСТВИЕ НОВИЧКОВ
        // Добавил проверку на несколько частых вариантов сообщений серверов
        const joinPhrases = ['вступил в клан', 'joined the clan', 'присоединился к клану', 'has joined the clan'];
        
        if (joinPhrases.some(phrase => lowerText.includes(phrase))) {
            // Регулярное выражение для извлечения первого слова (никнейма)
            // Оно берет всё до пробела
            const playerName = text.split(' ')[0].replace(/[^a-zA-Z0-9_]/g, ''); 
            
            if (playerName && playerName !== mcBot.username) {
                // Добавим небольшую задержку, чтобы чат не перегружался
                setTimeout(() => {
                    mcBot.chat(`/cc Добро пожаловать в Eternia, ${playerName}!`);
                }, 1500);
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
                // Команда info
                mcBot.chat(adInterval ? '/cc Реклама включена.' : '/cc Реклама выключена.');
            } else if (lowerText.includes('ad')) {
                mcBot.chat(CLAN_AD_TEXT);
                mcBot.chat('/cc Реклама отправлена разово.');
            }
        }

        // 3. АВТО-КОМАНДЫ FLY/MONEY
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
