/**
 * User Routes
 * -----------
 * Handles user registration, login, 2FA validation, and profile retrieval.
 * - Registration: Validates and creates a new user.
 * - Login: Validates credentials, applies brute-force protection, and sends a 2FA code.
 * - 2FA Validation: Validates the 2FA code, applies brute-force protection, and issues a JWT.
 * - Profile: Returns user profile data (protected).
 */

import express from 'express';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import { sendVerificationCode as sendTelegramVerificationCode } from '../utils/telegram.js';
import { hashPassword, verifyPassword } from '../utils/argon.js';
import crypto from 'crypto';
import { auth, authorizeProfileAccess } from '../middlewares/auth.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import { login_Track_Attempts } from '../middlewares/login_Track_Attempts.js';
import twoFA_Track_Attempts from '../middlewares/twoFA_Track_Attempts.js';
import maliciousInput from '../middlewares/maliciousInput.js';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();

// Utility function to generate a random 6-character verification code
const generateVerificationCode = () => {
    return crypto.randomBytes(3).toString('hex');
};

// User registration route
router.post('/register',
    maliciousInput,
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password, phoneNumber } = req.body;

            // Check if the email is already registered
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).send({ error: 'User with this email already exists' });
            }

            // Hash the password
            const hashedPassword = await hashPassword(password);

            // Set chatId to null initially
            const chatId = null;

            // Set role based on master email
            const role = email === process.env.MASTER_EMAIL ? 'master' : 'user';

            // Create new user
            const user = new User({
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                chatId,
                role
            });

            await user.save();

            res.status(201).send({ user, message: "User created successfully!" });

        } catch (err) {
            console.error('Error during registration:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }
);

// User login route with brute-force protection
router.post('/login',
    maliciousInput,
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('captchaToken').notEmpty().withMessage('Captcha is required'),
    login_Track_Attempts,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ error: 'Wrong email or captcha missing' });
        }

        try {
            const { email, password, captchaToken } = req.body;

            // Validate captcha with Google reCAPTCHA
            const secret = process.env.RECAPTCHA_SECRET_KEY;
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`;
            const captchaRes = await axios.post(verifyUrl);

            if (!captchaRes.data.success) {
                return res.status(400).send({ error: 'Invalid captcha' });
            }

            // Find user by email
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).send({ error: 'Wrong email' });
            }

            // Verify password
            const isMatch = await verifyPassword(user.password, password);

            if (!isMatch) {
                return res.status(400).send({ error: 'Wrong password' });
            }

            // Generate and save verification code for 2FA
            const verificationCode = generateVerificationCode();
            const codeExpiration = new Date(Date.now() + 10 * 60 * 1000);

            user.verificationCode = verificationCode;
            user.codeExpiration = codeExpiration;
            await user.save();

            // Send verification code via Telegram
            await sendTelegramVerificationCode(user.chatId, verificationCode);

            res.status(200).send({ message: "Verification code sent to Telegram" });

        } catch (err) {
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }
);

// Use cookie parser for JWT token validation
router.use(cookieParser());

// 2FA code validation route with brute-force protection
router.post('/login-validation',
    maliciousInput,
    twoFA_Track_Attempts,
    async (req, res) => {
        try {
            const { email, verificationCode } = req.body;

            // Find user by email
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).send({ error: 'Invalid email or verification code' });
            }

            // Check if verification code matches
            if (user.verificationCode !== verificationCode) {
                return res.status(400).send({ error: 'Invalid verification code' });
            }

            // Check if verification code is expired
            if (new Date() > user.codeExpiration) {
                return res.status(400).send({ error: 'Verification code has expired' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '1h' }
            );

            const responseData = {
                message: 'Verification successful',
                token,
                userId: user._id,
                user: {
                    name: user.name,
                    email: user.email,
                    _id: user._id
                }
            };

            res.status(200).send(responseData);
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }
);

// Get user profile route (protected)
router.get('/:id/profile/', auth, authorizeProfileAccess, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }
        res.status(200).send({ user });
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

export default router;