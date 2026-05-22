const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');
const http = require('http'); // Модуль для веб-заглушки Render

const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE'; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    viewDistance: 'tiny', // Минимальная дистанция прогрузки для экономии ОЗУ
    physicsEnabled: false  // Отключаем физику, чтобы снизить нагрузку на хостинг
};

// --- ВЕБ-СЕРВЕР ДЛЯ RENDER (ОБЯЗАТЕЛЬНО) ---
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eternia Bot is Alive\n');
}).listen(PORT, () => {
    console.log(`Сервер-заглушка успешно запущен на порту ${PORT}`);
});
// --------------------------------------------

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
        console.log("Бот вошел на сервер! Ожидаем авторизации...");
        
        // Авторизация с твоим АКТУАЛЬНЫМ паролем через 8 секунд
        setTimeout(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/login 007007007');
            }
        }, 8000);

        // Переход на s1 анархию и вход в клан через 12 секунд
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

        // Анти-AFK (махи рукой раз в 40 секунд)
        afkInterval = setInterval(() => {
            if (mcBot && mcBot.entity) {
                mcBot.swingHand();
            }
        }, 40000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        if (!isReady || typeof mcBot.chat !== 'function') return;

        // Приветствие новых участников клана
        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды fly , money`);
        }
        // Реагирование на команды в клан-чате
        if (text.includes(' fly')) mcBot.chat('/fly');
        if (text.includes(' money')) mcBot.chat('/eco set 10000');
    });

    mcBot.on('kicked', (reason) => console.log("(!) Кик с сервера. Причина:", reason));
    mcBot.on('error', (err) => console.error("(!) Ошибка сети:", err.message));

    mcBot.on('end', (reason) => {
        console.log("Бот отсоединился. Причина:", reason);
        isReady = false;
        if (afkInterval) clearInterval(afkInterval);
        
        // Задержка перед перезаходом, чтобы сессия на сервере успела закрыться
        console.log("Ожидаем 35 секунд перед автоматическим перезаходом...");
        setTimeout(createMcBot, 35000); 
    });
}

// Автоматическая реклама клана раз в 15 минут
setInterval(() => {
    if (isReady && mcBot && typeof mcBot.chat === 'function') {
        mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
    }
}, 900000); 

createMcBot();
tgBot.launch().catch(err => console.error("Ошибка TG:", err));
