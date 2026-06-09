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
const CLAN_AD_TEXT = "!Клан Eternia открыт! Бесплатный fly, 10Т, свой город и розыгрыши доната. Активный чат в ТГ. Вступай: /warp Eternia или /clan join Eternia";
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
        console.log("ЧАТ: " + text);

        // 1. ПРИВЕТСТВИЕ (для всех)
        if (lowerText.includes('вступил в клан') || lowerText.includes('присоединился к клану')) {
            const playerName = text.split(' ')[0];
            mcBot.chat(`/clan chat Добро пожаловать, ${playerName}! Вступай в наш ТГ и читай правила в /warp Eternia.`);
        }

        // ПРОВЕРКА АВТОРА
        const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));

        // 2. УПРАВЛЕНИЕ РЕКЛАМОЙ (ТОЛЬКО ДЛЯ АВТОРИЗОВАННЫХ)
        if (isAuthorized) {
            if (lowerText.includes('stopad')) {
                if (adInterval) {
                    clearInterval(adInterval);
                    adInterval = null;
                    mcBot.chat("/clan chat ⏹️ Реклама остановлена.");
                }
            } else if (lowerText.includes('startad')) {
                if (!adInterval) {
                    mcBot.chat(CLAN_AD_TEXT);
                    adInterval = setInterval(() => mcBot.chat(CLAN_AD_TEXT), 240000);
                    mcBot.chat("/clan chat ✅ Реклама запущена.");
                }
            } else if (lowerText.includes(' ad')) {
                mcBot.chat(CLAN_AD_TEXT);
            }
        }

        // 3. АВТО-КОМАНДЫ (FLY / MONEY) - ДЛЯ ВСЕХ ИГРОКОВ
        // Проверяем наличие ключевых слов в любом сообщении
        if (lowerText.includes('fly') || lowerText.includes('money')) {
            const cmdMatch = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
            // Важно: бот не реагирует на самого себя
            if (cmdMatch && cmdMatch[1] !== mcBot.username) {
                const targetName = cmdMatch[1];
                const action = cmdMatch[2].toLowerCase();

                if (action === 'fly') {
                    mcBot.chat(`/fly ${targetName}`);
                } else if (action === 'money') {
                    mcBot.chat(`/eco set ${targetName} ${MONEY_AMOUNT}`);
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
