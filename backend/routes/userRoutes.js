import express from 'express';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import { sendVerificationCode as sendTelegramVerificationCode } from '../utils/telegram.js';
import { hashPassword, verifyPassword } from '../utils/argon.js';
import crypto from 'crypto';

const router = express.Router();

// Utility function to generate a random 6-character verification code
const generateVerificationCode = () => {
    return crypto.randomBytes(3).toString('hex');
};

// Registration route
router.post('/register', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, phoneNumber } = req.body;
        console.log('Received data:', { name, email, password, phoneNumber });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User with this email already exists');
            return res.status(400).send({ error: 'User with this email already exists' });
        }

        const hashedPassword = await hashPassword(password);
        console.log('Hashed password:', hashedPassword);

        const chatId = 6483852354;
        const user = new User({ name, email, password: hashedPassword, phoneNumber, chatId});
        console.log('User object before saving:', user);

        await user.save();
        console.log('User saved to database');


        res.status(201).send({ user, message: "User created successfully!" });

    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Route to get user information by ID
router.get('/1', async (req, res) => {
    return res.status(410).send({ error: 'User not found' });
});



router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ error: 'Wrong email' });
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'Wrong email' });
        }

        const isMatch = await verifyPassword(user.password, password);

        if (!isMatch) {
            return res.status(400).send({ error: 'Wrong password' });
        }

        const verificationCode = generateVerificationCode();
        const codeExpiration = new Date(Date.now() + 10 * 60 * 1000);

        user.verificationCode = verificationCode;
        user.codeExpiration = codeExpiration;
        await user.save();

        await sendTelegramVerificationCode(user.chatId, verificationCode);

        res.status(200).send({ message: "Verification code sent to Telegram" });

    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Route to validate the verification code
router.post('/login-validation', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('verificationCode').notEmpty().withMessage('Verification code is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, verificationCode } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'Invalid email or verification code' });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).send({ error: 'Invalid verification code' });
        }

        if (new Date() > user.codeExpiration) {
            return res.status(400).send({ error: 'Verification code has expired' });
        }

        // Verification successful
        res.status(200).send({ message: 'Verification successful' });

    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;