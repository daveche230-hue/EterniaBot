const mineflayer = require('mineflayer');

const botName = '_GVEN_19';
const serverHost = 'mc.mineblaze.net';
const serverPort = 25565;
const minecraftVersion = '1.19.4';
const pass = '007007007';

console.log("\x1b[2;36m" + time() + "\x1b[1;2m Script loading...\x1b[0m");

const bot = mineflayer.createBot({
    host: serverHost,
    port: serverPort,
    version: minecraftVersion,
    username: botName
});

    bot.on('message', (message) => {
        console.log(`${message.toAnsi()}`);

        const messagestr = message.toString();

        if (messagestr.includes('| Зарегистрируйтесь » /reg [пароль]')) {
            register();
        }

        if (messagestr.includes('| Авторизируйтесь » /login [пароль]')) {
            login();
        }

        if (messagestr.includes('Важно для вашей безопасности!!!')) {
            setTimeout(() => {
                bot.chat('/s1');
            }, 1000);
        }
    });

    function register() {
        bot.chat(`/reg ${pass}`);
    }

    function login() {
        bot.chat(`/login ${pass}`);
    }

function time() {
    var date = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    var time = "[" + date + "] ";
    return time;
}
