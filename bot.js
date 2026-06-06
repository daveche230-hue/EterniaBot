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
const CLAN_AD_TEXT = "Набор в Eternia открыт! Бесплатный fly, 10Т, свой город, розыгрыши и активный чат в ТГ. Вступай: /warp Eternia или /clan join Eternia";
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
        console.log("ЧАТ: " + text);

        // УПРАВЛЕНИЕ РЕКЛАМОЙ ЧЕРЕЗ КЛАН-ЧАТ
        if (text.includes('КЛАН:')) {
            const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));
            if (isAuthorized) {
                const lowerText = text.toLowerCase();
                if (lowerText.includes('stopad')) {
                    if (adInterval) {
                        clearInterval(adInterval);
                        adInterval = null;
                        console.log("⏹️ Реклама остановлена.");
                    }
                } else if (lowerText.includes('startad')) {
                    if (!adInterval) {
                        mcBot.chat(CLAN_AD_TEXT);
                        adInterval = setInterval(() => mcBot.chat(CLAN_AD_TEXT), 240000);
                        console.log("✅ Реклама запущена.");
                    }
                } else if (lowerText.includes('ad')) {
                    mcBot.chat(CLAN_AD_TEXT);
                    console.log("💬 Реклама отправлена разово.");
                }
            }
        }

        // АВТО-КОМАНДЫ FLY/MONEY
        if (text.toLowerCase().includes('fly') || text.toLowerCase().includes('money')) {
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
        console.log("Бот отключен. Переподключение через 60 секунд...");
        clearInterval(adInterval);
        adInterval = null;
        setTimeout(createMcBot, 60000);
    });

    mcBot.on('error', (err) => console.log("Ошибка:", err.message));
}

createMcBot();
