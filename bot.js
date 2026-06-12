const mineflayer = require('mineflayer');

// ... (ваши настройки те же самые) ...
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
const CLAN_AD_TEXT = "!&5&lСейчас проходит набор в клан Eternia &f&lв нем вы получите 10Т,флай,крутых тимейтов, красивый кх,доступ в билд зону,лучший пвп кит,розыгрыши доната. &d&l&nЧтобы вступить пиши /warp Et или /c join Eternia ждём именно тебя.";
const ALLOWED_USERS = ['Dave_che', 'vexrezer'];

let mcBot;
let adInterval = null;
let lastRequest = { player: null, time: 0 }; 

function createMcBot() {
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.once('spawn', () => {
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => { mcBot.chat('/s1'); setTimeout(() => mcBot.chat('/c join Eternia'), 3000); }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        
        // 1. ПЕРЕХВАТ: Если прошло меньше 5 секунд с нашего запроса, и сервер пишет про время
        // Ищем в тексте цифры и слово "сек"
        if (Date.now() - lastRequest.time < 5000 && (text.includes('доступна через') || text.includes('секунд'))) {
            mcBot.chat(`/cc ${lastRequest.player}, ${text}`);
            lastRequest.time = 0; // Сбрасываем, чтобы не дублировать
            return;
        }

        // 2. ОБРАБОТКА ЗАПРОСОВ
        const cmdMatch = text.match(/([a-zA-Z0-9_]+)[\s:!]+(fly|money)/i);
        if (cmdMatch && cmdMatch[1] !== mcBot.username) {
            const playerName = cmdMatch[1];
            const cmdType = cmdMatch[2].toLowerCase();
            
            lastRequest = { player: playerName, time: Date.now() };

            if (cmdType === 'fly') {
                mcBot.chat(`/fly ${playerName}`);
            } else if (cmdType === 'money') {
                mcBot.chat(`/eco set ${playerName} ${MONEY_AMOUNT}`);
            }
        }
        
        // ... (остальной ваш код с рекламой и приветствиями) ...
    });

    mcBot.on('end', () => setTimeout(createMcBot, 60000));
}
createMcBot();
