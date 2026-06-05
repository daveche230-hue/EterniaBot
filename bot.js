const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

const TG_TOKEN = '8251508330:AAF7uoxAZfU-QOqdWgqDCMRwaSFygMov1Ys';
const ALLOWED_IDS = [7549659947, 8229657533, 1930216279];

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1'
};

const tgBot = new Telegraf(TG_TOKEN);
let mcBot;
let adInterval = null;

function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("🔥 Бот зашел! Ждем 6 секунд до логина...");
        setTimeout(() => mcBot.chat('/login 12345678'), 6000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        console.log("ЧАТ ИГРЫ:", jsonMsg.toString());
    });
}

tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    const msg = ctx.message.text;

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("Реклама уже идет!");
        adInterval = setInterval(() => { 
            if (mcBot) mcBot.chat("!Набор в клан Eternia! Команды: !fly, !money"); 
        }, 180000);
        ctx.reply("✅ Реклама запущена.");
    } else if (msg === '/stopad') {
        clearInterval(adInterval); adInterval = null;
        ctx.reply("⏹️ Реклама остановлена.");
    } else if (mcBot) {
        // Добавляем ! принудительно, если это обычный текст
        const command = msg.startsWith('/') || msg.startsWith('!') ? msg : '!' + msg;
        mcBot.chat(command);
        ctx.reply("✅ Команда отправлена в чат: " + command);
    }
});

createMcBot();
tgBot.launch();
console.log("Бот запущен и ждет команд!");
