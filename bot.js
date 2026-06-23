const mineflayer = require('mineflayer');
const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');

const TG_TOKEN = '8578905918:AAHcRx23RfToUQlHniU74Tu9GQg7HRDJ_FQ';
const CHANNEL_ID = '8229657533'; // <-- ВСТАВЬТЕ СЮДА ID ВАШЕГО КАНАЛА
const REGION_NAME = 'eterniamoy';

const tgBot = new Telegraf(8578905918:AAHcRx23RfToUQlHniU74Tu9GQg7HRDJ_FQ);
const app = express();

app.get('/check', async (req, res) => {
    const nick = req.query.nick;
    try {
        const member = await tgBot.telegram.getChatMember(CHANNEL_ID, `@${nick}`);
        const isSubbed = ['member', 'administrator', 'creator'].includes(member.status);
        res.json({ status: isSubbed ? 'ok' : 'no' });
    } catch (e) { res.json({ status: 'no' }); }
});
app.listen(3000);

const bot = mineflayer.createBot({ host: 'mc.mineblaze.net', port: 25565, username: '_GVEN_19', version: '1.20.1' });

bot.once('spawn', () => {
    setTimeout(() => bot.chat('/login 12345678'), 6000);
    setTimeout(() => { bot.chat('/s1'); setTimeout(() => bot.chat('/c join Eternia'), 3000); }, 12000);
});

bot.on('chat', async (username, message) => {
    if (message.toLowerCase() === 'bild') {
        const res = await axios.get(`http://localhost:3000/check?nick=${username}`);
        if (res.data.status === 'ok') {
            bot.chat(`/rg addmember ${REGION_NAME} ${username}`);
            bot.chat(`/cc ${username}, вы добавлены в регион ${REGION_NAME}!`);
        } else {
            bot.chat(`/cc ${username}, сначала подпишитесь на ТГК.`);
        }
    }
});
