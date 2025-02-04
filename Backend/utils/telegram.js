import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// Handle incoming messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Recebi sua mensagem!');
});

export const sendVerificationCode = (chatId, code) => {
    bot.sendMessage(chatId, `Seu código de verificação é: ${code}`);
};

console.log('Bot está rodando...');