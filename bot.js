const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');

// НАСТРОЙКИ
const TG_TOKEN = '8251508330:AAEq8oIkn8mtH6YrI5KS1uZLr876hyXe4eE'; // Твой рабочий токен
const ALLOWED_IDS = [7549659947, 8229657533, 1930216279]; 

const MC_SETTINGS = {
    host: 'mc.mineblaze.net',
    port: 25565,
    username: '_GVEN_19',
    version: '1.20.1',
    hideErrors: true,
    storageProvider: null,
    viewDistance: 'tiny',
    physicsEnabled: false,
    checkTimeoutInterval: 60 * 1000, // Обход таймаута MineBlaze
    clientToken: 'd6f6e5a4b3c2a10f'
};

const MC_PASSWORD = '007007007'; // Твой верный пароль
const MONEY_AMOUNT = '10000000000000';

const CLAN_AD_TEXT = "!Набор в клан Eternia открыт. Мы предлагаем каждому участнику бесплатный флай fly и стартовый капитал в размере 10Т money (команды отправлять в клан чат). В клане вас ждут надежные тимейты, обустроенный средневековый город, розыгрыши доната и активный чат в Telegram. Для вступления используйте команды /warp Eternia или /clan join Eternia.";

const tgBot = new Telegraf(TG_TOKEN);
let mcBot;
let adInterval = null;
let afkInterval = null;

// Функция для уведомления в ТГ
function notifyAdmins(text) {
    ALLOWED_IDS.forEach(id => {
        tgBot.telegram.sendMessage(id, text).catch(err => console.error("Ошибка отправки в ТГ:", err.message));
    });
}

// --- ТЕЛЕГРАМ УПРАВЛЕНИЕ ---
tgBot.on('text', (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) return;
    let msg = ctx.message.text;

    if (msg === '/startad') {
        if (adInterval) return ctx.reply("Реклама уже идет!");
        
        if (mcBot && typeof mcBot.chat === 'function') mcBot.chat(CLAN_AD_TEXT);
        adInterval = setInterval(() => { 
            if (mcBot && typeof mcBot.chat === 'function') mcBot.chat(CLAN_AD_TEXT); 
        }, 180000); // Повтор каждые 3 минуты при ручном запуске
        ctx.reply("✅ Твоя новая реклама запущена.");
    } else if (msg === '/stopad') {
        if (adInterval) {
            clearInterval(adInterval); 
            adInterval = null;
        }
        ctx.reply("⏹️ Реклама остановлена.");
    } else if (mcBot && typeof mcBot.chat === 'function') {
        // Автоматический пересыл сообщений: добавляем "!", если отправляется обычный текст
        if (!msg.startsWith('!') && !msg.startsWith('/')) {
            msg = '!' + msg;
        }
        mcBot.chat(msg);
        ctx.reply(`💬 Отправлено в игру: ${msg}`);
    }
});

// --- MINECRAFT ЛОГИКА ---
function createMcBot() {
    if (mcBot) {
        mcBot.removeAllListeners();
        if (afkInterval) clearInterval(afkInterval);
        try { mcBot.quit(); } catch (e) {}
    }

    mcBot = mineflayer.createBot(MC_SETTINGS);

    // Оптимизация памяти
    mcBot.on('chunkColumnLoad', (point) => {
        if (mcBot && mcBot.world && mcBot.world.unloadChunk) {
            mcBot.world.unloadChunk(point.x, point.z);
        }
    });

    mcBot.once('spawn', () => {
        console.log("🔥 Бот на месте! Авторизация...");
        
        // Авторизация
        setTimeout(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat(`/login ${MC_PASSWORD}`);
                console.log("Команда /login отправлена");
            }
        }, 4000);

        // Переход на анархию s1 и вход в клан-чат
        setTimeout(() => { 
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/s1'); // ИЗМЕНЕНО НА /s1 БЭК
                console.log("Переход на /s1...");
                setTimeout(() => {
                    if (mcBot && typeof mcBot.chat === 'function') {
                        mcBot.chat('/c join Eternia');
                        console.log("Бот вошел в клан чат!");
                    }
                }, 4000);
            }
        }, 10000);

        // Анти-AFK
        afkInterval = setInterval(() => {
            if (mcBot && typeof mcBot.chat === 'function') {
                mcBot.chat('/afk_check_stay'); 
            }
        }, 40000);
    });

    mcBot.on('message', (jsonMsg) => {
        const text = jsonMsg.toString();
        process.stdout.write("ЧАТ: " + text + "\n");

        // ПЕРЕСЫЛКА ССЫЛКИ НА ПРОВЕРКУ В ТГ
        if (text.includes('http://') || text.includes('https://') || text.toLowerCase().includes('проверку') || text.toLowerCase().includes('капчу')) {
            if (!text.includes('/warp Eternia') && !text.includes('@Bishnevskii')) {
                console.log("⚠ Найдена ссылка на проверку! Отправляю админам...");
                notifyAdmins(`⚠ **MineBlaze просит проверку:**\n\n${text}`);
            }
        }

        if (text.includes(mcBot.username)) return;

        // Приветствие новичка клана
        if (text.includes('присоединился к клану')) {
            const parts = text.split(' ');
            const newMember = parts[0];
            setTimeout(() => {
                if (mcBot && typeof mcBot.chat === 'function') {
                    mcBot.chat(`/cc Добро пожаловать, ${newMember}! ТГ: @Bishnevskii. Команды: !fly, !money`);
                }
            }, 2000);
        }

        // Умный парсинг ников из чата для команд fly/money
        if (text.toLowerCase().includes('fly') || text.toLowerCase().includes('money')) {
            const words = text.split(/[\s:→←]+/); 
            const cmdIndex = words.findIndex(w => ['fly', 'money'].includes(w.toLowerCase()));
            
            if (cmdIndex > 0) {
                let target = words[cmdIndex - 1];
                target = target.replace(/[^a-zA-Z0-9_]/g, '');

                if (target && target.length > 2 && target !== mcBot.username) {
                    if (mcBot && typeof mcBot.chat === 'function') {
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
        }
    });

    mcBot.on('kicked', (reason) => {
        const kickReason = reason.toString();
        console.log("(!) Кикнут. Причина:", kickReason);
        if (kickReason.toLowerCase().includes('bot') || kickReason.toLowerCase().includes('check') || kickReason.toLowerCase().includes('капч')) {
            notifyAdmins(`❌ Бот кикнут защитой!\nПричина: ${kickReason}`);
        }
    });
    
    mcBot.on('error', (err) => {
        if (err.message.includes('bounds of the managed data') || err.message.includes('Chunk')) return;
        console.error("(!) Ошибка сети:", err.message);
    });

    mcBot.on('end', () => {
        console.log("Переподключение через 15 секунд...");
        if (afkInterval) clearInterval(afkInterval);
        setTimeout(createMcBot, 15000);
    });
}

// Автоматический спам рекламы раз в 3 минуты (180 000 мс) в глобальный чат
setInterval(() => {
    if (mcBot && typeof mcBot.chat === 'function') {
        mcBot.chat(CLAN_AD_TEXT);
        console.log("📢 Авто-реклама отправлена на /s1");
    }
}, 180000); 

// Запуск бота
createMcBot();
tgBot.launch({ dropPendingUpdates: true }).catch(err => console.error("Ошибка TG:", err));