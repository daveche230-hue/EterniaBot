const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

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

const tgBot = new Telegraf(TG_TOKEN);
let mcBot;
let playerCooldowns = {};

// --- ТЕЛЕГРАМ (Команды от админов) ---
tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    if (mcBot && mcBot.entity) {
        const msg = ctx.message.text;
        mcBot.chat(msg); // Админ может отправить любую команду
        ctx.reply("✅ Отправлено в игру: " + msg);
    }
});

// --- MINECRAFT (Логика для ВСЕХ игроков) ---
function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 5000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString().toLowerCase();
        
        // 1. Отвечаем "На месте", если кто-то пишет слово "бот"
        if (text.includes('бот') && !text.includes(mcBot.username.toLowerCase())) {
            mcBot.chat("!Я на месте.");
        }

        // 2. Логика для fly/money (для всех игроков)
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
