const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// Твой токен со скриншота BotFather
const TG_TOKEN = '8251508330:AAF7uoxAZfU-QOqdWgqDCMRwaSFygMov1Ys';
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
const CLAN_AD_TEXT = "!Набор в клан Eternia открыт. Мы предлагаем бесплатный флай и деньги. ТГ чат: @Bishnevskii";

const tgBot = new Telegraf(TG_TOKEN);
let mcBot;
let adInterval = null;

// ФУНКЦИЯ УВЕДОМЛЕНИЙ
function notifyAdmins(text) {
    ALLOWED_IDS.forEach(id => tgBot.telegram.sendMessage(id, text).catch(() => {}));
}

// ТЕЛЕГРАМ
tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    const msg = ctx.message.text;

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("Реклама уже идет!");
        adInterval = setInterval(() => { if (mcBot) mcBot.chat(CLAN_AD_TEXT); }, 180000);
        ctx.reply("✅ Реклама запущена.");
    } else if (msg === '/stopad') {
        clearInterval(adInterval); adInterval = null;
        ctx.reply("⏹️ Реклама остановлена.");
    } else if (mcBot) {
        mcBot.chat(msg.startsWith('/') || msg.startsWith('!') ? msg : '!' + msg);
        ctx.reply(`💬 Отправлено в игру: ${msg}`);
    }
});

// MINECRAFT
function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("🔥 Бот на сервере. Ожидание авторизации...");
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        process.stdout.write("ЧАТ: " + text + "\n");

        if (text.toLowerCase().includes('http') || text.toLowerCase().includes('проверку')) {
            notifyAdmins(`⚠ **Внимание, проверка:** ${text}`);
        }

        if (text.toLowerCase().includes('fly') || text.toLowerCase().includes('money')) {
            const match = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
            if (match && match[1] !== mcBot.username) {
                if (match[2].toLowerCase() === 'fly') mcBot.chat(`/fly ${match[1]}`);
                else mcBot.chat(`/eco set ${match[1]} ${MONEY_AMOUNT}`);
            }
        }
    });

    mcBot.on('end', () => setTimeout(createMcBot, 60000));
    mcBot.on('error', (err) => console.log("Ошибка:", err.message));
}

createMcBot();
tgBot.launch().catch(console.error);
console.log("Бот инициализирован!");
