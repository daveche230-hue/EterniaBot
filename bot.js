const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// --- НАСТРОЙКИ ---
const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE';
const ALLOWED_IDS = [7549659947, 8229657533]; 
const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1'
};
const MONEY_AMOUNT = '10000000000000';
const AD_TEXT = "!Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай !fly и стартовый капитал 10Т !money. ТГ: @Bishnevskii. Для вступления: /warp Eternia";

const tgBot = new Telegraf(TG_TOKEN);
let mcBot;
let adInterval = null;

// --- ТЕЛЕГРАМ: УПРАВЛЕНИЕ (ТОЛЬКО НУЖНЫЕ КНОПКИ) ---
tgBot.command('start', (ctx) => {
    ctx.reply('Меню управления ботом:', {
        reply_markup: {
            keyboard: [
                ['/status', '/startad', '/stopad'],
                ['/clan', '/s1', '/welcome']
            ],
            resize_keyboard: true
        }
    });
});

tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    const msg = ctx.message.text;

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("Реклама уже идет!");
        mcBot.chat(AD_TEXT);
        adInterval = setInterval(() => { if (mcBot) mcBot.chat(AD_TEXT); }, 180000);
        ctx.reply("✅ Реклама запущена.");
    } else if (msg === '/stopad') {
        clearInterval(adInterval); adInterval = null;
        ctx.reply("⏹ Реклама остановлена.");
    } else if (msg.startsWith('/')) {
        // Прочие команды (можно добавить логику для /clan, /status и т.д.)
        ctx.reply("Команда принята: " + msg);
    } else if (mcBot) {
        // ГЛОБАЛЬНЫЙ ЧАТ: Добавляем ! перед сообщением
        mcBot.chat("!" + msg);
        ctx.reply("💬 В Глобал: " + msg);
    }
});

// --- MINECRAFT ЛОГИКА ---
function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);
    
    mcBot.once('spawn', () => {
        setTimeout(() => mcBot.chat(`/login Qwerty1234`), 3000);
        setTimeout(() => { mcBot.chat(`/s1`); mcBot.chat(`/c join Eternia`); }, 8000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        process.stdout.write("ЧАТ: " + text + "\n");
        if (text.includes(mcBot.username)) return;

        // Приветствие
        if (text.includes('присоединился к клану')) {
            const parts = text.split(' ');
            const newMember = parts[0];
            setTimeout(() => mcBot.chat(`/cc Добро пожаловать, ${newMember}! ТГ: @Bishnevskii. Команды: !fly, !money`), 2000);
        }

        // Парсинг команд
        if (text.toLowerCase().includes('fly') || text.toLowerCase().includes('money')) {
            const words = text.split(/[\s:→←]+/);
            const cmdIndex = words.findIndex(w => ['fly', 'money'].includes(w.toLowerCase()));
            if (cmdIndex > 0) {
                let target = words[cmdIndex - 1].replace(/[^a-zA-Z0-9_]/g, '');
                if (target && target.length > 2) {
                    if (text.toLowerCase().includes('fly')) mcBot.chat(`/fly ${target}`);
                    else mcBot.chat(`/eco set ${target} ${MONEY_AMOUNT}`);
                }
            }
        }
    });

    mcBot.on('end', () => setTimeout(createMcBot, 10000));
}

createMcBot();
tgBot.launch();