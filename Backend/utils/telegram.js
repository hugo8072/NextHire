// telegram.js
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Responder à mensagem recebida
    bot.sendMessage(chatId, `Você disse: ${text}`);
});

console.log('Bot está rodando...');

export const sendVerificationCode = (chatId, code) => {
    bot.sendMessage(chatId, `Seu código de verificação é: ${code}`);
};