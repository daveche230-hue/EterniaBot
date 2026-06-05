const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// --- НАСТРОЙКИ ---
const TG_TOKEN = '8251508330:AAEq8oIkn8mtH6YrI5KS1uZLr876hyXe4eE';
const ALLOWED_IDS = [7549659947, 8229657533, 1930216279];
const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    hideErrors: true,
    physicsEnabled: false
};
const MC_PASSWORD = '12345678';
const MONEY_AMOUNT = '10000000000000';
const CLAN_AD_TEXT = "!Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай и стартовый капитал. ТГ чат: @Bishnevskii";

const tgBot = new Telegraf(TG_TOKEN);
let mcBot;
let adInterval = null;

// --- ТЕЛЕГРАМ ---
tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    
    const msg = ctx.message.text;
    console.log(`[TG] Получено: ${msg}`);

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("⚠️ Реклама уже запущена!");
        adInterval = setInterval(() => {
            if (mcBot && mcBot.entity) mcBot.chat(CLAN_AD_TEXT);
        }, 180000);
        return ctx.reply("✅ Реклама запущена.");
    } 
    
    if (msg === '/stopad') {
        clearInterval(adInterval);
        adInterval = null;
        return ctx.reply("⏹️ Реклама остановлена.");
    }

    // Отправка сообщений в игру
    if (mcBot && mcBot.entity) {
        const command = (msg.startsWith('/') || msg.startsWith('!')) ? msg : '!' + msg;
        mcBot.chat(command);
        ctx.reply(`💬 Отправлено в чат: ${command}`);
    } else {
        ctx.reply("❌ Бот не в игре. Подождите переподключения.");
    }
});

// --- MINECRAFT ---
function createMcBot() {
    console.log("🔄 Попытка подключения к серверу...");
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("🔥 Бот заспавнился. Авторизация...");
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 5000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 10000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        console.log("ЧАТ ИГРЫ: " + text);

        // Уведомление админам о проверках
        if (text.toLowerCase().includes('http') || text.toLowerCase().includes('проверку')) {
            ALLOWED_IDS.forEach(id => tgBot.telegram.sendMessage(id, `⚠ **Внимание, проверка:** ${text}`).catch(() => {}));
        }

        // Авто-ответы на fly/money
        const match = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
        if (match && match[1] !== mcBot.username) {
            if (match[2].toLowerCase() === 'fly') mcBot.chat(`/fly ${match[1]}`);
            else mcBot.chat(`/eco set ${match[1]} ${MONEY_AMOUNT}`);
        }
    });

    mcBot.on('end', (reason) => {
        console.log(`❌ Бот отключился: ${reason}. Переподключение через 60 сек.`);
        setTimeout(createMcBot, 60000);
    });

    mcBot.on('error', (err) => {
        console.log("❌ Ошибка бота:", err.message);
    });
}

createMcBot();
tgBot.launch().then(() => console.log("🚀 Telegram бот запущен")).catch(console.error);
