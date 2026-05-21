const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE'; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    viewDistance: 'tiny', // Жесткая экономия ОЗУ
    physicsEnabled: false  // Отключаем физику, чтобы хостинг не падал
};

const tgBot = new Telegraf(TG_TOKEN);
let mcBot = null;
let afkInterval = null; 
let isReady = false; 

function createMcBot() {
    isReady = false;
    if (mcBot) {
        mcBot.removeAllListeners();
        if (afkInterval) clearInterval(afkInterval);
        try { mcBot.quit(); } catch (e) {}
    }

    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("Бот зашел на сервер. Ожидаем авторизации...");
        
        // Авторизация с твоим НОВЫМ паролем через 8 секунд
        setTimeout(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/login 1234567');
            }
        }, 8000);

        // Переход на анархию s1 и в клан через 12 секунд
        setTimeout(() => { 
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/s1'); 
                setTimeout(() => {
                    if (mcBot && typeof mcBot.chat === 'function') {
                        mcBot.chat('/c join Eternia');
                        isReady = true; 
                    }
                }, 3000);
            }
        }, 12000);

        // Анти-AFK
        afkInterval = setInterval(() => {
            if (mcBot && mcBot.entity) {
                mcBot.swingHand();
            }
        }, 40000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        if (!isReady || typeof mcBot.chat !== 'function') return;

        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды fly , money`);
        }
        if (text.includes(' fly')) mcBot.chat('/fly');
        if (text.includes(' money')) mcBot.chat('/eco set 10000');
    });

    mcBot.on('kicked', (reason) => console.log("(!) Кик с сервера. Причина:", reason));
    mcBot.on('error', (err) => console.error("(!) Ошибка сети:", err.message));

    mcBot.on('end', (reason) => {
        console.log("Бот отсоединился. Причина:", reason);
        isReady = false;
        if (afkInterval) clearInterval(afkInterval);
        
        // Пауза 35 секунд, чтобы старая сессия точно закрылась на сервере
        console.log("Ожидаем 35 секунд перед перезаходом...");
        setTimeout(createMcBot, 35000); 
    });
}

// Реклама раз в 15 минут
setInterval(() => {
    if (isReady && mcBot && typeof mcBot.chat === 'function') {
        mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
    }
}, 900000); 

createMcBot();
tgBot.launch().catch(err => console.error("Ошибка TG:", err));
