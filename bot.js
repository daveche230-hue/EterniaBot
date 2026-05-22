const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');
const http = require('http');

const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE'; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    // --- ПРАВИЛЬНОЕ ОТКЛЮЧЕНИЕ ПРОГРУЗКИ ДЛЯ ЭКОНОМИИ ПАМЯТИ ---
    viewDistance: 'tiny',
    loadInternalPlugins: false, // Отключаем физику, инвентарь и окна напрочь
    physicsEnabled: false
};

// Веб-заглушка для Render
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eternia Bot is Alive\n');
}).listen(PORT, () => {
    console.log(`Заглушка запущена на порту ${PORT}`);
});

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

    // Создаем ультра-легкого бота
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("Бот успешно прорвался на сервер! Авторизуемся...");
        
        // Авторизация через 5 секунд
        setTimeout(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/login 007007007');
                console.log("Отправлена команда /login");
            }
        }, 5000);

        // Прыжок на s1 через 10 секунд
        setTimeout(() => { 
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/s1'); 
                console.log("Отправлена команда /s1");
                
                // Вход в клан через 3 секунды после прыжка
                setTimeout(() => {
                    if (mcBot && typeof mcBot.chat === 'function') {
                        mcBot.chat('/c join Eternia');
                        isReady = true; 
                        console.log("Бот полностью готов и зашел в клан!");
                    }
                }, 3000);
            }
        }, 10000);

        // Облегченный анти-AFK (просто пишем пустую команду в консоль сервера раз в 40 сек, чтобы не кикало)
        afkInterval = setInterval(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/afk_check_stay'); 
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

    mcBot.on('kicked', (reason) => console.log("(!) Кик. Причина:", reason.toString()));
    mcBot.on('error', (err) => console.error("(!) Ошибка сети:", err.message));

    mcBot.on('end', (reason) => {
        console.log("Бот отключился. Причина:", reason);
        isReady = false;
        if (afkInterval) clearInterval(afkInterval);
        
        console.log("Ждем 60 секунд перед чистым перезаходом...");
        setTimeout(createMcBot, 60000); 
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
