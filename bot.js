const mineflayer = require('mineflayer');

// НАСТРОЙКИ
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

// ТЕКСТ РЕКЛАМЫ
const CLAN_AD_TEXT = "!&5&lСейчас проходит набор в клан Eternia &f&lв нем вы получите 10Т,флай,крутых тимейтов, красивый кх,доступ в билд зону,лучший пвп кит,розыгрыши доната. &d&l&nЧтобы вступить пиши /warp Et или /c join Eternia ждём именно тебя.";
const ALLOWED_USERS = ['Dave_che', 'vexrezer'];
const REGION_NAME = "eternia_base"; 

let mcBot;
let adInterval = null;

function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        console.log("🔥 Бот на сервере.");
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => { 
            mcBot.chat('/s1'); 
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        const lowerText = text.toLowerCase();
        const cleanText = text.replace(/§[0-9a-fk-or]/g, ''); 
        console.log("ЧАТ: " + text);
        
        // 1. ПРИВЕТСТВИЕ НОВИЧКОВ
        if (lowerText.includes('вступил в клан') || lowerText.includes('joined the clan')) {
            const playerName = text.split(' ')[0].replace(/[^a-zA-Z0-9_]/g, '');
            if (playerName !== mcBot.username) {
                mcBot.chat(`/clanchat Добро пожаловать в Eternia, ${playerName}!`);
            }
        }

        // 2. УПРАВЛЕНИЕ РЕКЛАМОЙ
        const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));
        if (isAuthorized) {
            if (lowerText.includes('stopad')) {
                if (adInterval) {
                    clearInterval(adInterval);
                    adInterval = null;
                    mcBot.chat('/clanchat Реклама остановлена.');
                }
            } else if (lowerText.includes('startad')) {
                if (!adInterval) {
                    mcBot.chat(CLAN_AD_TEXT);
                    adInterval = setInterval(() => mcBot.chat(CLAN_AD_TEXT), 185000);
                    mcBot.chat('/clanchat Реклама запущена.');
                }
            } else if (lowerText.includes('ad')) {
                mcBot.chat(CLAN_AD_TEXT);
                mcBot.chat('/clanchat Реклама отправлена разово.');
            }
        }

        // 3. АВТО-КОМАНДЫ И ОБРАБОТКА КД
        if (cleanText.includes('будет доступна через')) {
            // Регулярное выражение ищет число в строке
            const timeMatch = cleanText.match(/(\d+)\s*(сек|мин)/i);
            const timeString = timeMatch ? timeMatch[0] : "неизвестно сколько";
            
            mcBot.chat(`/clanchat [КД] Эта команда будет доступна через ${timeString}.`);
        } 
        else {
            const cmdMatch = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
            if (cmdMatch && cmdMatch[1] !== mcBot.username) {
                const player = cmdMatch[1];
                const type = cmdMatch[2].toLowerCase();

                if (type === 'fly') {
                    mcBot.chat(`/fly ${player}`);
                } else if (type === 'money') {
                    mcBot.chat(`/eco set ${player} ${MONEY_AMOUNT}`);
                }
            }
        }

        // 4. ДОБАВЛЕНИЕ В БИЛД-ЗОНУ
        if (lowerText.includes('!addme')) {
            const playerName = text.split(' ')[0].replace(/[^a-zA-Z0-9_]/g, '');
            if (playerName && playerName !== mcBot.username) {
                mcBot.chat(`/rg addmember ${REGION_NAME} ${playerName}`);
            }
        }
    });

    mcBot.on('end', () => {
        clearInterval(adInterval);
        setTimeout(createMcBot, 60000);
    });
}

createMcBot();
