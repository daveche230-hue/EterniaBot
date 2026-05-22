const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// Твой самый свежий токен из BotFather
const TG_TOKEN = '8251508330:AAHz3Ctq3jxpn74cBLAIb6vVRv00to5E_gk'; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    viewDistance: 'tiny',
    physicsEnabled: false // Отключаем физику для стабильности на хостинге
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

    // Запуск бота
    mcBot = mineflayer.createBot(MC_SETTINGS);

    // Оптимизация памяти (выгружаем чанки, чтобы BotiHost не ругался на лимиты)
    mcBot.on('chunkColumnLoad', (point) => {
        if (mcBot && mcBot.world && typeof mcBot.world.columnAt === 'function') {
            setTimeout(() => {
                if (mcBot && mcBot.world && mcBot.world.unloadChunk) {
                    mcBot.world.unloadChunk(point.x, point.z);
                }
            }, 1000);
        }
    });

    mcBot.once('spawn', () => {
        console.log("Бот зашел на спавн BotiHost! Начинаем авторизацию...");
        
        // Авторизация паролем 007007007 через 6 секунд
        setTimeout(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/login 007007007');
                console.log("Команда /login отправлена");
            }
        }, 6000);

        // Переход на анархию s1 через 12 секунд
        setTimeout(() => { 
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/s1'); 
                console.log("Команда /s1 отправлена");
                
                // Вход в клан-чат через 4 секунды после перехода
                setTimeout(() => {
                    if (mcBot && typeof mcBot.chat === 'function') {
                        mcBot.chat('/c join Eternia');
                        isReady = true; 
                        console.log("Бот успешно зашел в клан чат!");
                    }
                }, 4000);
            }
        }, 12000);

        // Анти-AFK (взмах рукой раз в 40 секунд)
        afkInterval = setInterval(() => {
            if (mcBot && mcBot.entity) {
                mcBot.swingHand();
            }
        }, 40000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        if (!isReady || typeof mcBot.chat !== 'function') return;

        // Приветствие новых участников
        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды fly , money`);
        }
        
        // Обработка триггеров в клан-чате
        if (text.includes(' fly')) mcBot.chat('/fly');
        if (text.includes(' money')) mcBot.chat('/eco set 10000');
    });

    mcBot.on('kicked', (reason) => console.log("(!) Кик с сервера. Причина:", reason.toString()));
    mcBot.on('error', (err) => console.error("(!) Ошибка сети:", err.message));

    mcBot.on('end', (reason) => {
        console.log("Бот отключился. Причина:", reason);
        isReady = false;
        if (afkInterval) clearInterval(afkInterval);
        
        // Задержка перед перезаходом в 45 секунд (оптимально для BotiHost)
        console.log("Ожидаем 45 секунд перед перезаходом...");
        setTimeout(createMcBot, 45000); 
    });
}

// Автоматическая реклама клана раз в 15 минут
setInterval(() => {
    if (isReady && mcBot && typeof mcBot.chat === 'function') {
        mcBot.chat("Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.");
    }
}, 900000); 

// Запуск игрового бота
createMcBot();

// Запуск Телеграма с авто-сбросом старых зависших обновлений
tgBot.launch({ dropPendingUpdates: true }).catch(err => console.error("Ошибка TG:", err));
