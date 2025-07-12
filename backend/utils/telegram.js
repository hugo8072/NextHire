/**
 * Telegram Bot Utility
 * --------------------
 * Handles Telegram bot integration for user chat ID linking and sending verification codes.
 * - Listens for /start and /chatID commands from users.
 * - Links a Telegram chat ID to a user account by email.
 * - Exports a function to send verification codes to a user's Telegram chat.
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

// Initialize the Telegram bot with polling enabled
const bot = new TelegramBot(token, { polling: true });

// Listen for incoming messages from users
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    // Expect command: /start email@domain.com
    if (text && text.startsWith('/start ')) {
        const email = text.split(' ')[1]?.toLowerCase();
        console.log(`Received /start with email: ${email}. Chat ID: ${chatId}`);

        // Validate email format
        if (!email || !email.includes('@')) {
            bot.sendMessage(chatId, 'Please send: /start your@email.com');
            return;
        }

        try {
            // Try to find the user by email and update their chatId
            const user = await User.findOneAndUpdate(
                { email },
                { chatId },
                { new: true }
            );

            if (user) {
                console.log(`Chat ID ${chatId} linked to user: ${user.email}`);
                bot.sendMessage(
                    chatId,
                    `Your chat ID is: <b>${chatId}</b>\nLinked to your account: ${user.email}`,
                    { parse_mode: 'HTML' }
                );
            } else {
                console.log(`No user found with email: ${email}`);
                bot.sendMessage(
                    chatId,
                    'No user found with that email. Please register first.',
                    { parse_mode: 'HTML' }
                );
            }
        } catch (err) {
            console.error('Error updating user with chat ID:', err);
            bot.sendMessage(chatId, 'Error linking your chat ID. Please try again later.');
        }
    } else if (text === '/chatID') {
        // Respond with the user's chat ID
        bot.sendMessage(chatId, `Your chat ID is: <b>${chatId}</b>`, { parse_mode: 'HTML' });
    } else {
        // Default response for other messages
        bot.sendMessage(
            chatId,
            'Send /start your@email.com to link your Telegram to your account.',
            { parse_mode: 'HTML' }
        );
    }
});

// Function to send a verification code to a specific chat ID
export const sendVerificationCode = (chatId, code) => {
    bot.sendMessage(chatId, `Your verification code is: ${code}`);
};

console.log('Telegram bot is running...');