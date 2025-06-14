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


const router = express.Router();

// Utility function to generate a random 6-character verification code
const generateVerificationCode = () => {
    return crypto.randomBytes(3).toString('hex');
};

// Registration route
// Assumindo que você tem dotenv configurado para ler o .env
import dotenv from 'dotenv';
dotenv.config();


dotenv.config();

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

        // Verifica se o email já está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User with this email already exists');
            return res.status(400).send({ error: 'User with this email already exists' });
        }

        // Criptografando a senha
        const hashedPassword = await hashPassword(password);
        console.log('Hashed password:', hashedPassword);

        const chatId = 6483852354; // Exemplo de chatId

        // Defina o role com base no seu e-mail configurado na variável de ambiente
        const role = email === process.env.MASTER_EMAIL ? 'master' : 'user';

        // Criação do novo usuário
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            chatId,
            role  // Definindo o role dinamicamente
        });

        console.log('User object before saving:', user);

        // Salvando o usuário no banco de dados
        await user.save();
        console.log('User saved to database');

        // Resposta de sucesso
        res.status(201).send({ user, message: "User created successfully!" });

    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});





router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('captchaToken').notEmpty().withMessage('Captcha is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ error: 'Wrong email or captcha missing' });
    }

    try {
        const { email, password, captchaToken } = req.body;

        // Validação do captcha
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`;
        const captchaRes = await axios.post(verifyUrl);

        if (!captchaRes.data.success) {
            return res.status(400).send({ error: 'Captcha inválido' });
        }

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


// Route to validate the verification code and generate JWT token
router.use(cookieParser());

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

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Log the token
        console.log('Generated JWT token:', token);

        // Return the token in the response body
        res.status(200).send({ message: 'Verification successful', token, userId: user._id });
    } catch (err) {
        console.error('Error during login validation:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.get('/:id/profile/', auth, authorizeProfileAccess, async (req, res) => {
    try {
        console.log("esta a entrar aqui 199 user routes")
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