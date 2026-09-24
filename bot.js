const { Telegraf, Markup, Scenes, session } = require('telegraf');

const TOKEN = '8620010761:AAF5_GqEWbrACy6AohHIhnrt0EzYQVY_6V8'; // Вставь свой токен сюда
const bot = new Telegraf(TOKEN);

// Ссылки
const CHANNEL_LINK = 'https://t.me/+oLfX-5MDiFg3ZjRh'; 
const CHAT_LINK = 'https://t.me/Eternia_MineBlaze';
const MY_PROFILE = 'https://t.me/vosducx';

// Сюда вставь числовой ID вашего чата (начинается с -100...)
const TARGET_CHAT_ID = '-1004419810026'; 

// --- НАСТРОЙКА АНКЕТЫ (СЦЕНА) ---
const modWizard = new Scenes.WizardScene(
    'mod_application_scene',
    // Шаг 1: Ник
    async (ctx) => {
        await ctx.reply('📝 **Анкета на модератора клана Eternia**\n\n1. Напишите ваш **Ник** в игре:', { parse_mode: 'Markdown' });
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    // Шаг 2: Возраст
    async (ctx) => {
        ctx.wizard.state.data.nickname = ctx.text;
        await ctx.reply('2. Укажите ваш **Возраст**:');
        return ctx.wizard.next();
    },
    // Шаг 3: Часовой пояс
    async (ctx) => {
        ctx.wizard.state.data.age = ctx.text;
        await ctx.reply('3. Укажите ваш **Часовой пояс** (например, МСК, UTC+2):');
        return ctx.wizard.next();
    },
    // Шаг 4: Опыт
    async (ctx) => {
        ctx.wizard.state.data.timezone = ctx.text;
        await ctx.reply('4. Был ли у вас **опыт** работы модератором? (Опишите кратко):');
        return ctx.wizard.next();
    },
    // Шаг 5: Время работы и отправка
    async (ctx) => {
        ctx.wizard.state.data.experience = ctx.text;
        await ctx.reply('5. Сколько **времени в день** вы готовы уделять работе?');
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.wizard.state.data.timePerDay = ctx.text;
        const d = ctx.wizard.state.data;
        const user = ctx.from;
        const usernameTag = user.username ? `@${user.username}` : `[${user.first_name}](tg://user?id=${user.id})`;

        // Текст заявки для отправки в ваш чат
        const reportText = 
            `📥 **Новая заявка на модерацию Eternia!**\n\n` +
            `👤 **Кандидат:** ${usernameTag} (ID: \`${user.id}\`)\n` +
            `1️⃣ **Ник:** ${d.nickname}\n` +
            `2️⃣ **Возраст:** ${d.age}\n` +
            `3️⃣ **Часовой пояс:** ${d.timezone}\n` +
            `4️⃣ **Опыт:** ${d.experience}\n` +
            `5️⃣ **Готов уделять времени:** ${d.timePerDay}`;

        try {
            // Отправляем в ваш чат
            await ctx.telegram.sendMessage(TARGET_CHAT_ID, reportText, { parse_mode: 'Markdown' });
        } catch (e) {
            console.error('Ошибка отправки заявки в чат:', e);
        }

        // Сообщение пользователю
        await ctx.reply('Благодарим за отклик, ожидайте. Если ваша заявка будет одобрена, мы с вами свяжемся.');
        return ctx.scene.leave();
    }
);

const stage = new Scenes.Stage([modWizard]);
bot.use(session());
bot.use(stage.middleware());

// --- КОМАНДЫ И МЕНЮ ---

bot.start((ctx) => {
    ctx.reply(
        'Приветствую бойца клана Eternia! 🛡\n\n' +
        'Здесь вы можете узнать всю необходимую информацию, связаться с администрацией и поддержать развитие клана.\n\n' +
        'Выберите нужный раздел ниже:',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('📢 Наш Telegram-канал', CHANNEL_LINK)],
                [Markup.button.url('💬 Наш Telegram-чат', CHAT_LINK)],
                [Markup.button.callback('📝 Заявка на модератора', 'start_mod_app')],
                [
                    Markup.button.callback('🛠 Поддержка', 'menu_support'),
                    Markup.button.callback('⭐ Донат / Звёзды', 'menu_donate')
                ]
            ])
        }
    );
});

bot.command('support', (ctx) => {
    ctx.reply(
        '🛠 **Связь с администрацией**\n\n' +
        'По всем вопросам и предложениям вы можете обратиться к создателю клана:',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('👤 Написать создателю', MY_PROFILE)]
            ])
        }
    );
});

bot.command('donate', (ctx) => {
    showDonateMenu(ctx);
});

// Кнопка запуска анкеты из меню
bot.action('start_mod_app', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
        'Чтобы стать модератором клана Eternia, вам нужно заполнить эту анкету и дождаться ответа администрации.\n\n' +
        '📌 **Что входит в обязанности модерации:**\n' +
        '1. Набор людей в клан\n' +
        '2. Помощь людям в клане\n' +
        '3. Поддержание порядка в клане\n\n' +
        'Всеми модераторами руководит @TyanochaHvH\n\n' +
        'Начнем заполнение!'
    );
    return ctx.scene.enter('mod_application_scene');
});

// Обработка кнопок меню
bot.action('menu_support', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        '🛠 **Связь с администрацией**\n\n' +
        'По всем вопросам и предложениям вы можете обратиться к создателю клана:',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('👤 Написать создателю', MY_PROFILE)],
                [Markup.button.callback('◀️ Назад в меню', 'menu_start')]
            ])
        }
    );
});

bot.action('menu_donate', async (ctx) => {
    await ctx.answerCbQuery();
    showDonateMenu(ctx, true);
});

bot.action('menu_start', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        'Приветствую бойца клана Eternia! 🛡\n\n' +
        'Выберите нужный раздел ниже:',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('📢 Наш Telegram-канал', CHANNEL_LINK)],
                [Markup.button.url('💬 Наш Telegram-чат', CHAT_LINK)],
                [Markup.button.callback('📝 Заявка на модератора', 'start_mod_app')],
                [
                    Markup.button.callback('🛠 Поддержка', 'menu_support'),
                    Markup.button.callback('⭐ Донат / Звёзды', 'menu_donate')
                ]
            ])
        }
    );
});

// Меню донатов
function showDonateMenu(ctx, isEdit = false) {
    const text = '⭐ **Поддержка клана Eternia**\n\n' +
        'Вы можете поддержать клан звёздами, подарками или NFT.\n' +
        'Выберите количество звёзд или перейдите к отправке подарка:';
    
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⭐ 10 звёзд', 'pay_10'), Markup.button.callback('⭐ 50 звёзд', 'pay_50')],
        [Markup.button.callback('⭐ 100 звёзд', 'pay_100'), Markup.button.callback('🎁 Подарок / NFT', 'pay_gift')],
        [Markup.button.callback('◀️ Главное меню', 'menu_start')]
    ]);

    if (isEdit) {
        ctx.editMessageText(text, { parse_mode: 'Markdown', ...keyboard });
    } else {
        ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
    }
}

bot.action(/pay_(\d+)/, async (ctx) => {
    const amount = ctx.match[1];
    await ctx.answerCbQuery();
    
    await ctx.editMessageText(
        `⭐ Вы выбрали поддержку на **${amount} звезд(ы)**!\n\n` +
        `Нажмите на кнопку ниже, чтобы перейти в личный профиль и отправить звёзды на свой баланс:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url(`⭐ Отправить ${amount} звёзд`, MY_PROFILE)],
                [Markup.button.callback('◀️ Назад к выбору', 'menu_donate')]
            ])
        }
    );
});

bot.action('pay_gift', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        '🎁 **Передача подарков и NFT**\n\n' +
        'Чтобы передать уникальный Telegram-подарок или NFT, перейдите в профиль создателя:',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.url('🎁 Отправить подарок', MY_PROFILE)],
                [Markup.button.callback('◀️ Назад к донатам', 'menu_donate')]
            ])
        }
    );
});

// Запуск бота
bot.launch().then(() => {
    console.log('Бот успешно запущен!');
}).catch((err) => {
    console.error('❌ Ошибка:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
