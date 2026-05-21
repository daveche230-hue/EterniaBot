const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE'; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1'
};

const tgBot = new Telegraf(TG_TOKEN);
let mcBot = null;

function createMcBot() {
    if (mcBot) {
        mcBot.removeAllListeners();
        try { mcBot.quit(); } catch (e) {}
    }

    mcBot = mineflayer.createBot(MC_SETTINGS);

    // ЭТА ЧАСТЬ НЕ ИЗМЕНЕНА (ВХОД)
    mcBot.once('spawn', () => {
        setTimeout(() => mcBot.chat('/login 12345678'), 5000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000); 
        }, 8000);
    });

    // ПРИВЕТСТВИЕ И КОМАНДЫ
    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды fly , money`);
        }
        if (text.includes(' fly')) mcBot.chat('/fly');
        if (text.includes(' money')) mcBot.chat('/eco set 10000');
    });

    mcBot.on('end', () => setTimeout(createMcBot, 60000));
}

// РЕКЛАМА
setInterval(() => {
    if (mcBot && mcBot.player) {
        mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
    }
}, 600000); 

createMcBot();
tgBot.launch();
