const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');
const http = require('http');

const TG_TOKEN = '8251508330:AAHz3Ctq3jxpn74cBLAIb6vVRv00to5E_gk'; 

// Список бесплатных рабочих SOCKS5 прокси для обхода блокировки хостинга
const PROXY_LIST = [
    'socks5://184.174.63.146:4145',
    'socks5://98.185.94.130:4145',
    'socks5://72.210.252.134:4145',
    'socks5://69.61.200.104:4145'
];
let currentProxyIndex = 0;

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    viewDistance: 'tiny',
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

    // Подменяем прокси для обхода бана IP
    const proxyUrl = PROXY_LIST[currentProxyIndex];
    console.log(`🤖 Пробуем подключение через прокси: ${proxyUrl}`);
    const agent = new SocksProxyAgent(proxyUrl);
    
    const settingsWithProxy = {
        ...MC_SETTINGS,
        agent: agent
    };

    mcBot = mineflayer.createBot(settingsWithProxy);

    // Разгрузка памяти
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
        console.log("🔥 Бот успешно зашел на сервер через прокси! Авторизуемся...");
        
        setTimeout(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/login 007007007');
                console.log("Отправлена команда /login");
            }
        }, 6000);

        setTimeout(() => { 
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/s1'); 
                console.log("Отправлена команда /s1");
                
                setTimeout(() => {
                    if (mcBot && typeof mcBot.chat === 'function') {
                        mcBot.chat('/c join Eternia');
                        isReady = true; 
                        console.log("Бот полностью готов и зашел в клан чат!");
                    }
                }, 4000);
            }
        }, 12000);

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

    mcBot.on('kicked', (reason) => console.log("(!) Кик. Причина:", reason.toString()));
    mcBot.on('error', (err) => console.error("(!) Ошибка сети/прокси:", err.message));

    mcBot.on('end', (reason) => {
        console.log("Бот отключился. Меняем прокси...");
        isReady = false;
        if (afkInterval) clearInterval(afkInterval);
        
        // Меняем прокси на следующий из списка при неудаче
        currentProxyIndex = (currentProxyIndex + 1) % PROXY_LIST.length;
        
        console.log("Ждем 45 секунд перед перезаходом с новым IP...");
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
tgBot.launch({ dropPendingUpdates: true }).catch(err => console.error("Ошибка TG:", err));
