const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE'; 
const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    hideErrors: false // Поставим false, чтобы видеть в консоли, почему именно он выходит
};

const tgBot = new Telegraf(TG_TOKEN);
let mcBot = null;

function createMcBot() {
    if (mcBot) {
        try { mcBot.quit(); } catch (e) {}
        mcBot.removeAllListeners();
    }

    mcBot = mineflayer.createBot(MC_SETTINGS);

    // Ждем полной прогрузки мира перед выполнением команд
    mcBot.once('spawn', () => {
        console.log("Бот вошел в мир, жду 10 секунд перед авторизацией...");
        setTimeout(() => {
            mcBot.chat('/login 12345678');
            setTimeout(() => { 
                mcBot.chat('/s1'); 
                setTimeout(() => mcBot.chat('/c join Eternia'), 3000); 
            }, 5000);
        }, 10000); 
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды fly , money`);
        }
        if (text.includes(' fly')) mcBot.chat('/fly');
        if (text.includes(' money')) mcBot.chat('/eco set 10000');
    });

    // Увеличили паузу до 3 минут, чтобы сервер не банил IP за частые попытки
    mcBot.on('end', (reason) => {
        console.log("Бот вышел! Причина:", reason);
        setTimeout(createMcBot, 180000);
    });

    mcBot.on('error', (err) => console.log("Ошибка MC:", err));
}

setInterval(() => {
    if (mcBot && mcBot.player) {
        mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
    }
}, 900000);

createMcBot();
tgBot.launch();
