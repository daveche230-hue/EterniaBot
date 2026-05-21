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

    // Логирование событий для отладки
    mcBot.on('spawn', () => {
        console.log("Бот заспавнился. Авторизация через 8 секунд...");
        setTimeout(() => mcBot.chat('/login 12345678'), 8000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000); 
        }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        // Убираем лишние пробелы и выводим в консоль для контроля
        console.log("ЧАТ:", text); 
        
        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды !fly , !money`);
        }

        if (text.includes('!fly')) mcBot.chat('/fly');
        if (text.includes('!money')) mcBot.chat('/eco set 10000');
    });

    // Увеличен интервал реконнекта до 2 минут, чтобы не улететь в бан по IP
    mcBot.on('end', (reason) => {
        console.log("Бот отключен! Причина:", reason);
        console.log("Реконнект через 2 минуты...");
        setTimeout(createMcBot, 120000);
    });

    mcBot.on('error', (err) => console.log("Ошибка MC:", err.message));
}

// РЕКЛАМА
function startAutoAd() {
    setInterval(() => {
        if (mcBot && mcBot.player) {
            mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай !fly и стартовый капитал в размере 10Т !money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
        }
    }, 900000); // 15 минут
}

createMcBot();
startAutoAd();
tgBot.launch().then(() => console.log("Telegram бот запущен!"));
