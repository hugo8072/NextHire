import express from 'express';
import User from '../models/User.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { sendVerificationCode as sendEmailVerificationCode } from '../utils/mailer.js'; // Import Email function
import { sendVerificationCode as sendTelegramVerificationCode } from '../utils/telegram.js'; // Import Telegram function
import crypto from 'crypto';
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
const router = express.Router();

const generateVerificationCode = () => {
    return crypto.randomBytes(3).toString('hex'); // Generates a 6-character code
};

router.post('/register', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('chatId').notEmpty().withMessage('Telegram chat ID is required') // Add chatId validation
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, phoneNumber, chatId } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ error: 'User with this email already exists' });
        }

        const hashedPassword = await argon2.hash(password);
        const verificationCode = generateVerificationCode();
        const codeExpiration = new Date(Date.now() + 10 * 60 * 1000); // Code valid for 10 minutes

        const user = new User({ name, email, password: hashedPassword, phoneNumber, chatId, verificationCode, codeExpiration });
        await user.save();

        await sendEmailVerificationCode(email, verificationCode);
        await sendTelegramVerificationCode(chatId, verificationCode); // Send Telegram verification code

        res.status(201).send({ user, message: "User created successfully! Verification code sent to email and Telegram." });

    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ error: 'Invalid email or password' });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        const verificationCode = generateVerificationCode();
        const codeExpiration = new Date(Date.now() + 10 * 60 * 1000); // Code valid for 10 minutes

        user.verificationCode = verificationCode;
        user.codeExpiration = codeExpiration;
        await user.save();

        await sendEmailVerificationCode(user.email, verificationCode);
        await sendTelegramVerificationCode(user.chatId, verificationCode); // Send Telegram verification code

        res.status(200).send({ message: "Verification code sent to email and Telegram." });

    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.post('/verify-code', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('code').notEmpty().withMessage('Verification code is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.verificationCode !== code || user.codeExpiration < new Date()) {
            return res.status(400).send({ error: 'Invalid or expired verification code' });
        }

        const token = jwt.sign(
            { _id: user._id.toString() },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).send({ user, token, message: "Logged in successfully!" });

    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;