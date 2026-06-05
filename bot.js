const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// --- НАСТРОЙКИ ---
const TG_TOKEN = '8251508330:AAEq8oIkn8mtH6YrI5KS1uZLr876hyXe4eE';
const ALLOWED_IDS = [7549659947, 8229657533, 1930216279];
const COOLDOWN_MS = 60000; 

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
let playerCooldowns = {}; // Хранилище КД игроков

// --- ТЕЛЕГРАМ ---
tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    const msg = ctx.message.text;

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("⚠️ Реклама уже запущена!");
        adInterval = setInterval(() => { if (mcBot && mcBot.entity) mcBot.chat(CLAN_AD_TEXT); }, 180000);
        return ctx.reply("✅ Реклама запущена.");
    } 
    
    if (msg === '/stopad') {
        clearInterval(adInterval);
        adInterval = null;
        return ctx.reply("⏹️ Реклама остановлена.");
    }

    if (mcBot && mcBot.entity) {
        const command = (msg.startsWith('/') || msg.startsWith('!')) ? msg : '!' + msg;
        mcBot.chat(command);
        ctx.reply(`💬 Отправлено: ${command}`);
    }
});

// --- MINECRAFT ---
function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 5000);
        setTimeout(() => { mcBot.chat('/s1'); setTimeout(() => mcBot.chat('/c join Eternia'), 3000); }, 10000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        console.log("ЧАТ: " + text);

        // 1. ОТВЕТ "НА МЕСТЕ" (Любой игрок)
        if (text.toLowerCase().includes('бот')) {
            mcBot.chat("!Я на месте.");
        }

        // 2. ЛОГИКА FLY/MONEY (Игроки с КД)
        const match = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
        if (match && match[1] !== mcBot.username) {
            const player = match[1];
            const type = match[2].toLowerCase();
            const now = Date.now();
            
            const lastTime = playerCooldowns[player] || 0;
            const timePassed = now - lastTime;

            if (timePassed < COOLDOWN_MS) {
                const timeLeft = Math.ceil((COOLDOWN_MS - timePassed) / 1000);
                mcBot.chat(`!${player}, подождите еще ${timeLeft} сек.`);
            } else {
                if (type === 'fly') mcBot.chat(`/fly ${player}`);
                else mcBot.chat(`/eco set ${player} ${MONEY_AMOUNT}`);
                playerCooldowns[player] = now;
            }
        }
    });

    mcBot.on('end', () => setTimeout(createMcBot, 60000));
}

createMcBot();
tgBot.telegram.deleteWebhook().then(() => tgBot.launch());
