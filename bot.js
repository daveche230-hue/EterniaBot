const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// Твой актуальный рабочий токен из BotFather
const TG_TOKEN = '8251508330:AAHz3Ctq3jxpn74cBLAIb6vVRv00to5E_gk'; 

const MC_SETTINGS = {
    host: 'eu.mineblaze.net', // Используем европейское зеркало для обхода блокировок хостинга
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    hideErrors: true,          // Скрываем внутренние системные ошибки парсинга
    storageProvider: null,     // Отключаем лишнее кэширование данных мира
    viewDistance: 'tiny',      // Минимальная дистанция прогрузки пакетов
    physicsEnabled: false      // Отключаем физику движения для стабильности
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

    // Принудительно заставляем бота забывать чанки сразу при получении,
    // чтобы библиотека не пыталась их прочитать и не крашилась
    mcBot.on('chunkColumnLoad', (point) => {
        if (mcBot && mcBot.world && mcBot.world.unloadChunk) {
            mcBot.world.unloadChunk(point.x, point.z);
        }
    });

    mcBot.once('spawn', () => {
        console.log("🔥 Бот успешно прорвался на спавн! Начинаем авторизацию...");
        
        // Авторизация паролем через 6 секунд
        setTimeout(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/login 007007007');
                console.log("Отправлена команда /login");
            }
        }, 6000);

        // Переход на анархию s1 через 12 секунд
        setTimeout(() => { 
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/s1'); 
                console.log("Отправлена команда /s1");
                
                // Вход в клан-чат через 4 секунды после прыжка
                setTimeout(() => {
                    if (mcBot && typeof mcBot.chat === 'function') {
                        mcBot.chat('/c join Eternia');
                        isReady = true; 
                        console.log("Бот полностью готов и зашел в клан чат!");
                    }
                }, 4000);
            }
        }, 12000);

        // Анти-AFK триггер без перемещения
        afkInterval = setInterval(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/afk_check_stay'); 
            }
        }, 40000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        if (!isReady || typeof mcBot.chat !== 'function') return;

        // Автоприветствие новых игроков в клане
        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды fly , money`);
        }
        
        // Обработка триггеров клан-чата
        if (text.includes(' fly')) mcBot.chat('/fly');
        if (text.includes(' money')) mcBot.chat('/eco set 10000');
    });

    mcBot.on('kicked', (reason) => console.log("(!) Кик с сервера. Причина:", reason.toString()));
    
    mcBot.on('error', (err) => {
        // Игнорируем краши структуры блоков, чтобы они не вешали скрипт
        if (err.message.includes('bounds of the managed data') || err.message.includes('Chunk')) return;
        console.error("(!) Ошибка сети:", err.message);
    });

    mcBot.on('end', (reason) => {
        console.log("Бот отключился от сервера. Причина:", reason);
        isReady = false;
        if (afkInterval) clearInterval(afkInterval);
        
        console.log("Ожидаем 45 секунд перед перезаходом...");
        setTimeout(createMcBot, 45000); 
    });
}

// Рекламное сообщение раз в 15 минут
setInterval(() => {
    if (isReady && mcBot && typeof mcBot.chat === 'function') {
        mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
    }
}, 900000); 

createMcBot();

// Авто-сброс очереди ТГ для предотвращения ошибки Conflict 409
tgBot.launch({ dropPendingUpdates: true }).catch(err => console.error("Ошибка TG:", err));
