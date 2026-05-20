const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// --- КОНФИГУРАЦИЯ ---
const CONFIG = {
    TG_TOKEN: '8251508330:AAH99Cwa8u-rPn9RUVf3Q2ktrddWy6syrAE', // ПРИМЕЧАНИЕ: Смени токен в BotFather!
    ALLOWED_IDS: [7549659947, 8229657533],
    MC_SETTINGS: {
        host: 'mc.mineblaze.net',
        port: 25565,
        username: '_GVEN_19',
        version: '1.20.1'
    },
    MONEY_AMOUNT: '10000000000000'
};

const tgBot = new Telegraf(CONFIG.TG_TOKEN);
let mcBot = null;
let adInterval = null;

// --- ТЕЛЕГРАМ ЛОГИКА ---
tgBot.on('text', (ctx) => {
    if (!CONFIG.ALLOWED_IDS.includes(ctx.from.id)) return;
    const msg = ctx.message.text;

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("Реклама уже запущена.");
        const adText = "!Набор в клан Eternia открыт. Бесплатный флай !fly и стартовый капитал 10Т !money. ТГ: @Bishnevskii";
        if (mcBot) {
            mcBot.chat(adText);
            adInterval = setInterval(() => { if (mcBot) mcBot.chat(adText); }, 180000);
            ctx.reply("✅ Реклама запущена.");
        }
    } else if (msg === '/stopad') {
        clearInterval(adInterval);
        adInterval = null;
        ctx.reply("⏹️ Реклама остановлена.");
    } else if (mcBot) {
        mcBot.chat(msg);
        ctx.reply("💬 Отправлено в Minecraft.");
    }
});

// --- MINECRAFT ЛОГИКА ---
function createMcBot() {
    if (mcBot) {
        mcBot.removeAllListeners();
        try { mcBot.quit(); } catch (e) {}
    }

    mcBot = mineflayer.createBot(CONFIG.MC_SETTINGS);

    mcBot.once('spawn', () => {
        setTimeout(() => {
            mcBot.chat('/login 12345678');
            setTimeout(() => {
                mcBot.chat('/s1');
                mcBot.chat('/c join Eternia');
            }, 2000);
        }, 3000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        
        // Авто-приветствие
        if (text.includes('присоединился к клану')) {
            const newMember = text.split(' ')[0];
            setTimeout(() => mcBot.chat(`/cc Добро пожаловать, ${newMember}! ТГ: @Bishnevskii. Команды: !fly, !money`), 2000);
        }

        // Авто-выдача
        if (text.toLowerCase().includes('fly') || text.toLowerCase().includes('money')) {
            const words = text.split(/[\s:→←]+/);
            const cmdIndex = words.findIndex(w => ['fly', 'money'].includes(w.toLowerCase()));
            if (cmdIndex > 0) {
                let target = words[cmdIndex - 1].replace(/[^a-zA-Z0-9_]/g, '');
                if (target && target !== mcBot.username) {
                    if (text.toLowerCase().includes('fly')) {
                        mcBot.chat(`/fly ${target}`);
                    } else {
                        mcBot.chat(`/eco set ${target} ${CONFIG.MONEY_AMOUNT}`);
                    }
                }
            }
        }
    });

    mcBot.on('end', () => setTimeout(createMcBot, 30000)); // Перезапуск при дисконнекте
    mcBot.on('error', (err) => console.log('MC Error:', err.message));
}

createMcBot();
tgBot.launch();
