const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');
const http = require('http');

const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE'; 
// Сюда можно вписать твой Chat ID в телеграме (например, 123456789), чтобы бот писал тебе в ЛС о своем статусе
const MY_TG_CHAT_ID = ''; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    viewDistance: 'tiny',
    physicsEnabled: false
};

// ВЕБ-СЕРВЕР ДЛЯ RENDER
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eternia Bot is Alive\n');
}).listen(PORT, () => {
    console.log(`Сервер-заглушка запущен на порту ${PORT}`);
});

const tgBot = new Telegraf(TG_TOKEN);
let mcBot = null;
let afkInterval = null; 
let isReady = false; 

function sendTgAlert(message) {
    if (MY_TG_CHAT_ID) {
        tgBot.telegram.sendMessage(MY_TG_CHAT_ID, message).catch(e => console.error("Ошибка отправки в ТГ:", e.message));
    }
}

function createMcBot() {
    isReady = false;
    if (mcBot) {
        mcBot.removeAllListeners();
        if (afkInterval) clearInterval(afkInterval);
        try { mcBot.quit(); } catch (e) {}
    }

    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("Бот появился на спавне. Начинаем попытки авторизации...");
        sendTgAlert("🤖 Бот зашел на сервер, начинает авторизацию...");
        
        // Спамим логин каждые 5 секунд, пока бот не перейдет на анархию
        let loginAttempts = 0;
        const loginInterval = setInterval(() => {
            if (isReady || !mcBot || typeof mcBot.chat !== 'function') {
                clearInterval(loginInterval);
                return;
            }
            loginAttempts++;
            console.log(`Попытка авторизации #${loginAttempts}`);
            mcBot.chat('/login 007007007');
            
            // Через 3 секунды после логина пробуем прыгнуть на s1
            setTimeout(() => {
                if (mcBot && typeof mcBot.chat === 'function' && !isReady) {
                    mcBot.chat('/s1');
                }
            }, 3000);
        }, 6000);

        // Общая задержка для окончательного входа в клан
        setTimeout(() => {
            clearInterval(loginInterval);
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/c join Eternia');
                isReady = true;
                console.log("Бот готов к работе в клан-чате!");
                sendTgAlert("✅ Бот успешно зашел на s1 и подключился к клану Eternia!");
            }
        }, 20000);

        // Анти-AFK
        afkInterval = setInterval(() => {
            if (mcBot && mcBot.entity) {
                mcBot.swingHand();
            }
        }, 40000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        
        // Если просит авторизоваться, а мы думали что зашли — сбрасываем статус
        if (text.includes('/login') || text.includes('/регистрироваться')) {
            isReady = false;
        }

        if (!isReady || typeof mcBot.chat !== 'function') return;

        if (text.includes('присоединился к клану')) {
            const member = text.split(' ')[0];
            mcBot.chat(`Добро пожаловать, ${member}! Вступай в наш тг чатик, пиши ему @Bishnevskii, а так же доступные команды fly , money`);
        }
        if (text.includes(' fly')) mcBot.chat('/fly');
        if (text.includes(' money')) mcBot.chat('/eco set 10000');
    });

    mcBot.on('kicked', (reason) => {
        const errorText = reason.toString();
        console.log("(!) Кик с сервера. Причина:", errorText);
        sendTgAlert(`❌ Бота кикнули! Причина: ${errorText}`);
    });

    mcBot.on('error', (err) => {
        console.error("(!) Ошибка сети:", err.message);
    });

    mcBot.on('end', (reason) => {
        console.log("Бот отсоединился. Причина:", reason);
        isReady = false;
        if (afkInterval) clearInterval(afkInterval);
        
        // Если кикнул прокси или висит сессия — увеличиваем задержку до 45 секунд
        console.log("Ожидаем 45 секунд перед автоматическим перезаходом...");
        setTimeout(createMcBot, 45000); 
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
