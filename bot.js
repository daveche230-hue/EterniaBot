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
// Текст точно как на вашем скриншоте
const CLAN_AD_TEXT = "~~Eternia <- ангел -> Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай и стартовый капитал. ТГ чат: @Bishnevskii";
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

        // Регулярное выражение для захвата имени отправителя и сообщения
        // Ожидает формат: <Имя> сообщение
        const match = text.match(/<([^>]+)> (.+)/);
        
        if (match) {
            const sender = match[1];
            const msg = match[2].trim().toLowerCase();

            if (ALLOWED_USERS.includes(sender)) {
                if (msg === 'ad') {
                    mcBot.chat(CLAN_AD_TEXT);
                } else if (msg === 'startad') {
                    if (!adInterval) {
                        mcBot.chat(CLAN_AD_TEXT);
                        adInterval = setInterval(() => mcBot.chat(CLAN_AD_TEXT), 240000);
                    }
                } else if (msg === 'stopad') {
                    clearInterval(adInterval);
                    adInterval = null;
                }
            }
        }

        // Авто-команды fly/money
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
        clearInterval(adInterval);
        adInterval = null;
        setTimeout(createMcBot, 60000);
    });

    mcBot.on('error', (err) => console.log("Ошибка:", err.message));
}

createMcBot();
