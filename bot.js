const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// Твои настройки
const TG_TOKEN = '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE';
const ALLOWED_IDS = [7549659947, 8229657533]; 
const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1'
};
const MONEY_AMOUNT = '10000000000000';

const tgBot = new Telegraf(TG_TOKEN);
let mcBot;
let adInterval = null;

// --- ТЕЛЕГРАМ УПРАВЛЕНИЕ ---
tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    const msg = ctx.message.text;

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("Реклама уже идет!");
        const adText = "!Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай !fly и стартовый капитал 10Т !money. ТГ чат: @Bishnevskii";
        mcBot.chat(adText);
        adInterval = setInterval(() => { if (mcBot) mcBot.chat(adText); }, 180000);
        ctx.reply("✅ Реклама запущена.");
    } else if (msg === '/stopad') {
        clearInterval(adInterval); adInterval = null;
        ctx.reply("⏹️ Реклама остановлена.");
    } else if (mcBot) {
        mcBot.chat(msg);
        ctx.reply("💬 Отправлено.");
    }
});

// --- MINECRAFT ЛОГИКА ---
function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        // Отправка пароля
        setTimeout(() => mcBot.chat('/login 12345678'), 3000);
        // Дополнительные команды сервера
        setTimeout(() => { mcBot.chat('/s1'); mcBot.chat('/c join Eternia'); }, 8000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        process.stdout.write("ЧАТ: " + text + "\n");

        if (text.includes(mcBot.username)) return;

        // 1. Приветствие новичка
        if (text.includes('присоединился к клану')) {
            const parts = text.split(' ');
            const newMember = parts[0];
            setTimeout(() => mcBot.chat(`/cc Добро пожаловать, ${newMember}! ТГ: @Bishnevskii. Команды: !fly, !money`), 2000);
        }

        // 2. УМНЫЙ ПАРСИНГ НИКА
        if (text.toLowerCase().includes('fly') || text.toLowerCase().includes('money')) {
            const words = text.split(/[\s:→←]+/); 
            const cmdIndex = words.findIndex(w => ['fly', 'money'].includes(w.toLowerCase()));
            
            if (cmdIndex > 0) {
                let target = words[cmdIndex - 1].replace(/[^a-zA-Z0-9_]/g, '');
                if (target && target.length > 2 && target !== mcBot.username) {
                    if (text.toLowerCase().includes('fly')) {
                        mcBot.chat(`/fly ${target}`);
                        console.log(`✅ Выдаю fly: ${target}`);
                    } else {
                        mcBot.chat(`/eco set ${target} ${MONEY_AMOUNT}`);
                        console.log(`✅ Выдаю деньги: ${target}`);
                    }
                }
            }
        }
    });

    mcBot.on('end', () => setTimeout(createMcBot, 10000));
}

createMcBot();
tgBot.launch();
