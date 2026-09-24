const mineflayer = require('mineflayer');
const fs = require('fs');

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    hideErrors: true,
    physicsEnabled: false
};
const MC_PASSWORD = '12345678';

let CLAN_ADS = [
    "!&5&lСейчас проходит набор в клан Eternia &f&lв нем вы получите 1кк,флай,крутых тимейтов, красивый кх,доступ в билд зону,лучший пвп кит,розыгрыши доната. &d&l&nЧтобы вступить пиши /warp Et или /c join Eternia ждём именно тебя",
    "!&6&lEternia &f&lнабирает новых членов! &5&lПолучи 1кк, флай, лучший пвп кит и участвуй в розыгрышах доната. Крутая команда и красивый кланхом ждут тебя.&6&l&n /c join Eternia или /warp et",
    "!&d&lВступай в &5&lEternia &d&lи получай привилегии! 1кк + флай + пвп кит + розыгрыши. Красивый клан хом, билд зона, крутые тимейты. &6&f&n/warp Et или /c join Eternia",
    "!&5&lEternia &f&lсейчас ищет людей! Тебя ждут: 1кк, флай, лучший кит, розыгрыши доната и крутая команда.&6&l&n /c join Eternia или /warp Et - заходи!",
    "!&f&lПрисоединись к клану &5&lEternia&f&l Флай, 1кк, красивый клан хом, лучший пвп кит, розыгрыши доната и крутые тимейты.&6&l&n /c join Eternia или /warp et"
];

let AD_NAMES = [
    "Первая реклама",
    "Вторая реклама",
    "Третья реклама",
    "Четвёртая реклама",
    "Пятая реклама"
];

const ALLOWED_USERS = ['Dave_che', 'vexrezer', 'TyanochaHvH'];

// СТАТИСТИКА
let stats = {
    adSent: {},
    welcomeCount: 0,
    totalAds: 0
};

CLAN_ADS.forEach((_, i) => {
    stats.adSent[i] = 0;
});

let mcBot;
let adInterval = null;
let lastAdIndex = -1;

function saveStats() {
    fs.writeFileSync('bot_stats.json', JSON.stringify(stats, null, 2));
}

function loadStats() {
    try {
        if (fs.existsSync('bot_stats.json')) {
            const data = fs.readFileSync('bot_stats.json', 'utf8');
            stats = JSON.parse(data);
        }
    } catch (e) {
        console.log("Не удалось загрузить статистику, начинаем с нуля");
    }
}

function getRandomAd() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * CLAN_ADS.length);
    } while (randomIndex === lastAdIndex && CLAN_ADS.length > 1);
    lastAdIndex = randomIndex;
    stats.adSent[randomIndex]++;
    stats.totalAds++;
    saveStats();
    return { ad: CLAN_ADS[randomIndex], name: AD_NAMES[randomIndex], index: randomIndex + 1 };
}

function addNewAd(adText) {
    CLAN_ADS.push(adText);
    const newName = `Реклама №${CLAN_ADS.length}`;
    AD_NAMES.push(newName);
    stats.adSent[CLAN_ADS.length - 1] = 0;
    saveStats();
    return CLAN_ADS.length;
}

function createMcBot() {
    loadStats();
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
        console.log("ЧАТ: " + text);
        
        const lowerText = text.toLowerCase();
        const isAuthorized = ALLOWED_USERS.some(user => text.includes(user));

        const joinPhrases = ['вступил в клан', 'joined the clan', 'присоединился к клану', 'has joined the clan'];
        
        if (joinPhrases.some(phrase => lowerText.includes(phrase))) {
            const playerName = text.split(' ')[0].replace(/[^a-zA-Z0-9_]/g, ''); 
            
            if (playerName && playerName !== mcBot.username) {
                stats.welcomeCount++;
                saveStats();
                setTimeout(() => {
                    mcBot.chat(`/cc Добро пожаловать в Eternia, ${playerName}!`);
                }, 1500);
            }
        }

        if (isAuthorized) {
            if (lowerText.includes('stopad')) {
                if (adInterval) {
                    clearInterval(adInterval);
                    adInterval = null;
                    mcBot.chat('/cc Реклама остановлена.');
                }
            } else if (lowerText.includes('startad')) {
                if (!adInterval) {
                    const adData = getRandomAd();
                    mcBot.chat(adData.ad);
                    setTimeout(() => {
                        mcBot.chat(`/cc Реклама запущена. Отправлена: ${adData.name}`);
                    }, 1500);
                    
                    adInterval = setInterval(() => {
                        const randomAdData = getRandomAd();
                        mcBot.chat(randomAdData.ad);
                        setTimeout(() => {
                            mcBot.chat(`/cc ${randomAdData.name} отправлена.`);
                        }, 1500);
                    }, 300000);
                }
            } else if (lowerText.includes('stat')) {
                let statMessage = `/cc 📊 СТАТИСТИКА: Приветствено: ${stats.welcomeCount} | Реклам отправлено: ${stats.totalAds}`;
                mcBot.chat(statMessage);
                setTimeout(() => {
                    for (let i = 0; i < CLAN_ADS.length; i++) {
                        mcBot.chat(`/cc ${AD_NAMES[i]}: ${stats.adSent[i]} раз`);
                    }
                }, 1000);
            } else if (lowerText.includes('info')) {
                mcBot.chat(adInterval ? '/cc Реклама включена.' : '/cc Реклама выключена.');
            } else if (lowerText.match(/\bad([1-5])\b/)) {
                const match = lowerText.match(/\bad([1-5])\b/);
                const adNumber = parseInt(match[1]) - 1;
                if (adNumber < CLAN_ADS.length) {
                    stats.adSent[adNumber]++;
                    stats.totalAds++;
                    saveStats();
                    mcBot.chat(CLAN_ADS[adNumber]);
                    setTimeout(() => {
                        mcBot.chat(`/cc ${AD_NAMES[adNumber]} отправлена разово.`);
                    }, 1500);
                }
            } else if (lowerText.startsWith('addad ')) {
                const newAdText = text.substring(6).trim();
                if (newAdText.length > 10) {
                    const newNumber = addNewAd(newAdText);
                    mcBot.chat(`/cc ✅ Реклама №${newNumber} добавлена!`);
                } else {
                    mcBot.chat('/cc ❌ Реклама слишком короткая (мин 10 символов)');
                }
            } else if (lowerText.includes('ad')) {
                const adData = getRandomAd();
                mcBot.chat(adData.ad);
                setTimeout(() => {
                    mcBot.chat(`/cc ${adData.name} отправлена разово.`);
                }, 1500);
            }
        }

        // Проверяем кланчат
        const isClanChat = lowerText.includes('[клан]') || lowerText.includes('клан') || lowerText.includes('[c]') || text.startsWith('C ');

        if (isClanChat && (lowerText.includes('fly') || lowerText.includes('money'))) {
            let playerName = text.split(/[\s:<>\[\]]+/)[0];
            if (!playerName || playerName === mcBot.username || playerName.toLowerCase() === 'клан' || playerName.startsWith('!')) {
                const parts = text.split(/[\s:<>\[\]]+/);
                playerName = parts.find(p => p.length > 2 && p !== mcBot.username && p.toLowerCase() !== 'клан');
            }

            if (playerName && playerName !== mcBot.username) {
                if (lowerText.includes('fly')) {
                    mcBot.chat(`/fly ${playerName}`);
                }
                if (lowerText.includes('money')) {
                    // Сначала бот выдает деньги себе, а через 1 секунду переводит игроку
                    mcBot.chat(`/eco give _GVEN_19 1m`);
                    setTimeout(() => {
                        mcBot.chat(`/pay ${playerName} 1000000`);
                    }, 1000);
                }
            }
        }
    });

    mcBot.on('end', () => {
        clearInterval(adInterval);
        setTimeout(createMcBot, 60000);
    });
}

createMcBot();
