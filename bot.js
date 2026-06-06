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
const CLAN_AD_TEXT = "!Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай и стартовый капитал. ТГ чат: @Bishnevskii";

let mcBot;
let adInterval = null;

// MINECRAFT
function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("🔥 Бот на сервере. Ожидание...");
        
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 12000);

        // Запуск рекламы раз в 4 минуты (240000 мс)
        if (adInterval) clearInterval(adInterval);
        adInterval = setInterval(() => { 
            if (mcBot) mcBot.chat(CLAN_AD_TEXT); 
        }, 240000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        process.stdout.write("ЧАТ: " + text + "\n");

        if (text.toLowerCase().includes('fly') || text.toLowerCase().includes('money')) {
            const match = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
            if (match && match[1] !== mcBot.username) {
                if (match[2].toLowerCase() === 'fly') mcBot.chat(`/fly ${match[1]}`);
                else mcBot.chat(`/eco set ${match[1]} ${MONEY_AMOUNT}`);
            }
        }
    });

    mcBot.on('end', () => {
        clearInterval(adInterval);
        setTimeout(createMcBot, 60000);
    });
    
    mcBot.on('error', (err) => console.log("Ошибка:", err.message));
}

createMcBot();
