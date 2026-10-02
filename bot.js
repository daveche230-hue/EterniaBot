const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

console.log('▶ Запуск бота...');

// ---------- НАСТРОЙКИ ----------
const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    physicsEnabled: false
    // hideErrors убран специально: чтобы ошибки были видны в логах
};
const MC_PASSWORD = '12345678';

// Кто может управлять рекламой
const ALLOWED_USERS = ['Dave_che', 'vexrezer', 'TyanochaHvH'];

// Интервал авто-рекламы (мс)
const AD_INTERVAL_MS = 5 * 60 * 1000;
// Кулдаун на money (мс)
const MONEY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// ---------- ФАЙЛЫ ----------
const cooldownsPath = path.join(__dirname, 'cooldowns.json');
const statsPath = path.join(__dirname, 'bot_stats.json');

let moneyCooldowns = {};
if (fs.existsSync(cooldownsPath)) {
    try {
        moneyCooldowns = JSON.parse(fs.readFileSync(cooldownsPath, 'utf8'));
    } catch (e) {
        moneyCooldowns = {};
    }
}
function saveCooldowns() {
    fs.writeFileSync(cooldownsPath, JSON.stringify(moneyCooldowns, null, 2));
}

// ---------- РЕКЛАМА ----------
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

// ---------- СТАТИСТИКА ----------
let stats = { adSent: {}, welcomeCount: 0, totalAds: 0 };

function ensureStatsShape() {
    stats.adSent = stats.adSent || {};
    CLAN_ADS.forEach((_, i) => {
        stats.adSent[i] = stats.adSent[i] || 0;
    });
    stats.welcomeCount = stats.welcomeCount || 0;
    stats.totalAds = stats.totalAds || 0;
}

function saveStats() {
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}

function loadStats() {
    try {
        if (fs.existsSync(statsPath)) {
            stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        }
    } catch (e) {
        console.log('Не удалось загрузить статистику, начинаем с нуля');
    }
    ensureStatsShape();
}

let mcBot = null;
let adInterval = null;
let lastAdIndex = -1;

function getRandomAd() {
    let idx;
    do {
        idx = Math.floor(Math.random() * CLAN_ADS.length);
    } while (idx === lastAdIndex && CLAN_ADS.length > 1);
    lastAdIndex = idx;
    stats.adSent[idx] = (stats.adSent[idx] || 0) + 1;
    stats.totalAds++;
    saveStats();
    return { ad: CLAN_ADS[idx], name: AD_NAMES[idx] || `Реклама №${idx + 1}` };
}

function addNewAd(adText) {
    CLAN_ADS.push(adText);
    AD_NAMES.push(`Реклама №${CLAN_ADS.length}`);
    stats.adSent[CLAN_ADS.length - 1] = 0;
    saveStats();
    return CLAN_ADS.length;
}

// ---------- ОТПРАВКА И ЗАЩИТА ОТ ЭХА ----------
// Бот не должен реагировать на свои же сообщения
const recentSent = [];

function say(msg) {
    if (!mcBot) return;
    recentSent.push({ body: msg.replace(/^\/cc\s+/i, ''), t: Date.now() });
    mcBot.chat(msg);
}

function isOwnEcho(text) {
    const now = Date.now();
    while (recentSent.length && now - recentSent[0].t > 15000) recentSent.shift();
    if (text.includes('Команды для меня')) return true;
    return recentSent.some(s => s.body.length > 5 && text.includes(s.body));
}

// ---------- РАЗБОР ИМЁН ----------
const IGNORE_WORDS = new Set(['clan', 'join', 'joined', 'has', 'the', 'eternia', 'money', 'fly']);

function isIgnoredWord(w) {
    const lw = w.toLowerCase();
    return IGNORE_WORDS.has(lw) || (mcBot && lw === mcBot.username.toLowerCase());
}

// Ник игрока из строки о вступлении: первое «ник-подобное» слово
function extractJoinedName(text) {
    return (text.match(/[A-Za-z0-9_]{3,16}/g) || []).find(w => !isIgnoredWord(w)) || null;
}

// Ник автора сообщения: последнее слово перед разделителем (: » > →), иначе первое
function extractSender(text) {
    const sepIdx = text.search(/[:»>→]/);
    const head = sepIdx > 0 ? text.slice(0, sepIdx) : text;
    const words = (head.match(/[A-Za-z0-9_]{3,16}/g) || []).filter(w => !isIgnoredWord(w));
    if (!words.length) return null;
    return sepIdx > 0 ? words[words.length - 1] : words[0];
}

// ---------- ПРИВЕТСТВИЕ ----------
const JOIN_REGEX = /(вступил[а-я]* в клан|присоедини[а-я]* к (?:вашему )?клану|принят[а-я]* в клан|joined the clan)/i;
const recentWelcomes = {};

function handleJoin(text) {
    const playerName = extractJoinedName(text);
    console.log('JOIN-ДЕТЕКТ:', JSON.stringify(text), '->', playerName);
    if (!playerName) return;

    // не приветствуем одного и того же дважды за 30 секунд
    const now = Date.now();
    if (recentWelcomes[playerName] && now - recentWelcomes[playerName] < 30000) return;
    recentWelcomes[playerName] = now;

    stats.welcomeCount++;
    saveStats();
    setTimeout(() => {
        say(`/cc Добро пожаловать в клан Eternia, ${playerName}! Команды для меня: money, fly`);
    }, 1500);
}

// ---------- КОМАНДЫ АДМИНОВ ----------
function startAdLoop() {
    adInterval = setInterval(() => {
        const d = getRandomAd();
        mcBot.chat(d.ad);
        setTimeout(() => say(`/cc ${d.name} отправлена.`), 1500);
    }, AD_INTERVAL_MS);
}

// Возвращает true, если команда распознана
function handleAdminCommand(text, lower) {
    if (/\bstopad\b/.test(lower)) {
        if (adInterval) {
            clearInterval(adInterval);
            adInterval = null;
            say('/cc Реклама остановлена.');
        }
        return true;
    }

    if (/\bstartad\b/.test(lower)) {
        if (!adInterval) {
            const d = getRandomAd();
            mcBot.chat(d.ad);
            setTimeout(() => say(`/cc Реклама запущена. Отправлена: ${d.name}`), 1500);
            startAdLoop();
        }
        return true;
    }

    if (/\bstat\b/.test(lower)) {
        say(`/cc 📊 СТАТИСТИКА: Приветствий: ${stats.welcomeCount} | Реклам отправлено: ${stats.totalAds}`);
        CLAN_ADS.forEach((_, i) => {
            // небольшая пауза между сообщениями, чтобы сервер не заглушил бота за спам
            setTimeout(() => say(`/cc ${AD_NAMES[i]}: ${stats.adSent[i] || 0} раз`), 1200 * (i + 1));
        });
        return true;
    }

    if (/\binfo\b/.test(lower)) {
        say(adInterval ? '/cc Реклама включена.' : '/cc Реклама выключена.');
        return true;
    }

    const num = lower.match(/\bad(\d+)\b/);
    if (num) {
        const idx = parseInt(num[1], 10) - 1;
        if (idx >= 0 && idx < CLAN_ADS.length) {
            stats.adSent[idx] = (stats.adSent[idx] || 0) + 1;
            stats.totalAds++;
            saveStats();
            mcBot.chat(CLAN_ADS[idx]);
            setTimeout(() => say(`/cc ${AD_NAMES[idx]} отправлена разово.`), 1500);
        }
        return true;
    }

    const add = text.match(/\baddad\s+(.+)/i);
    if (add) {
        const newText = add[1].trim();
        if (newText.length > 10) {
            const n = addNewAd(newText);
            say(`/cc ✅ Реклама №${n} добавлена!`);
        } else {
            say('/cc ❌ Реклама слишком короткая (мин 10 символов)');
        }
        return true;
    }

    if (/\bad\b/.test(lower)) {
        const d = getRandomAd();
        mcBot.chat(d.ad);
        setTimeout(() => say(`/cc ${d.name} отправлена разово.`), 1500);
        return true;
    }

    return false;
}

// ---------- КЛАН-ЧАТ: money / fly ----------
function formatTimeLeft(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    let out = '';
    if (h > 0) out += `${h} ч. `;
    if (m > 0 || h > 0) out += `${m} мин. `;
    out += `${s} сек.`;
    return out;
}

function giveMoney(playerName) {
    const now = Date.now();
    if (moneyCooldowns[playerName] && now < moneyCooldowns[playerName]) {
        say(`/cc ${playerName}, вы сможете получить 1m через ${formatTimeLeft(moneyCooldowns[playerName] - now)}`);
        return;
    }
    moneyCooldowns[playerName] = now + MONEY_COOLDOWN_MS;
    saveCooldowns();

    // Сначала бот выдаёт деньги себе, через секунду переводит игроку
    mcBot.chat(`/eco give ${mcBot.username} 1m`);
    setTimeout(() => mcBot.chat(`/pay ${playerName} 1000000`), 1000);
}

function handleClanChat(text, lower) {
    const isClanChat = lower.includes('[клан]') || lower.includes('клан') || lower.includes('[c]') || text.startsWith('C ');
    if (!isClanChat) return;

    const wantsFly = /\bfly\b/.test(lower);
    const wantsMoney = /\bmoney\b/.test(lower);
    if (!wantsFly && !wantsMoney) return;

    const playerName = extractSender(text);
    console.log('КЛАН-КОМАНДА:', JSON.stringify(text), '->', playerName);
    if (!playerName || playerName.toLowerCase() === mcBot.username.toLowerCase()) return;

    if (wantsFly) mcBot.chat(`/fly ${playerName}`);
    if (wantsMoney) giveMoney(playerName);
}

// ---------- ЗАПУСК БОТА ----------
function createMcBot() {
    loadStats();
    mcBot = mineflayer.createBot(MC_SETTINGS);

    mcBot.on('login', () => console.log('✅ Вошёл на сервер'));
    mcBot.on('kicked', (r) => console.log('⛔ Кик:', typeof r === 'string' ? r : JSON.stringify(r)));
    mcBot.on('error', (e) => console.log('❌ Ошибка:', e.message));

    mcBot.once('spawn', () => {
        console.log('🔥 Бот на сервере.');
        setTimeout(() => mcBot.chat(`/login ${MC_PASSWORD}`), 6000);
        setTimeout(() => {
            mcBot.chat('/s1');
            setTimeout(() => mcBot.chat('/c join Eternia'), 3000);
        }, 12000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        if (!text.trim()) return;
        console.log('ЧАТ: ' + text);

        if (isOwnEcho(text)) return;
        const lower = text.toLowerCase();

        // 1. Вступление в клан
        if (JOIN_REGEX.test(text)) {
            handleJoin(text);
            return;
        }

        // 2. Команды админов
        if (ALLOWED_USERS.some(u => text.includes(u))) {
            if (handleAdminCommand(text, lower)) return;
        }

        // 3. Клан-чат: money / fly
        handleClanChat(text, lower);
    });

    mcBot.on('end', (reason) => {
        console.log('🔌 Отключён:', reason, '— переподключение через 60 сек.');
        clearInterval(adInterval);
        adInterval = null; // иначе после реконнекта startad не запустится
        setTimeout(createMcBot, 60000);
    });
}

process.on('uncaughtException', (e) => console.log('uncaughtException:', e));
process.on('unhandledRejection', (e) => console.log('unhandledRejection:', e));

createMcBot();
