const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// Сюда вставь новый токен после сброса в @BotFather для безопасности
const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE'; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    // Отключаем лишние функции Mineflayer для жесткой экономии ОЗУ
    viewDistance: 'tiny', 
    physicsEnabled: false,
    plugins: {
        conversions: false,
        inventory: false,
        physics: false,
        vibration: false
    }
};

const tgBot = new Telegraf(TG_TOKEN);
let mcBot = null;
let afkInterval = null; 

function createMcBot() {
    if (mcBot) {
        mcBot.removeAllListeners();
        if (afkInterval) clearInterval(afkInterval);
        try { mcBot.quit(); } catch (e) {}
    }

    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("Бот успешно вошел на сервер!");
        
        // Авторизация и переход на нужный режим
        setTimeout(() => mcBot.chat('/login 12345678'), 8000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000); 
        }, 12000);

        // Анти-AFK: просто машем рукой раз в 40 секунд, чтобы не кикнуло за бездействие
        afkInterval = setInterval(() => {
            if (mcBot && mcBot.entity) {
                mcBot.swingHand();
            }
        }, 40000);
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

    // Логируем причины кика и ошибки сети в консоль хостинга
    mcBot.on('kicked', (reason) => {
        console.log("(!) Бота кикнули. Причина:", reason);
    });

    mcBot.on('error', (err) => {
        console.error("(!) Ошибка сети:", err.message);
    });

    mcBot.on('end', (reason) => {
        console.log("Бот отсоединился от сервера. Причина:", reason);
        if (afkInterval) clearInterval(afkInterval);
        
        console.log("Быстрый перезапуск через 15 секунд...");
        setTimeout(createMcBot, 15000); 
    });
}

// Реклама раз в 15 минут
setInterval(() => {
    if (mcBot && mcBot.player) {
        mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
    }
}, 900000); 

createMcBot();

// Запускаем ТГ бота
tgBot.launch().catch(err => console.error("Ошибка запуска Telegram-бота:", err));
