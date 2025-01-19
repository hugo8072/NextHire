import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router(); // Corrected here

router.get('/', (req, res) => {
    res.send("User routes are working");
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = new User({ name, email, password });
        await user.save();
        res.status(201).send({ user, message: "User created successfully!" });
    } catch (err) {
        res.status(400).send({ error: err.message }); // Use err.message to get a clean error message
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; 
        const user = await User.findOne({ email });
    
        // Check if user exists and if the password matches
        if (!user) {
            throw new Error('Unable to login. User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch) {
            throw new Error('Unable to login. Invalid credentials');
        }

        const token = jwt.sign(
            { _id: user._id.toString() },
            process.env.JWT_SECRET_KEY, // Make sure this environment variable is set
            { expiresIn: '1h' } // Optionally set expiration for the token
        );

        res.status(200).send({ user, token }); // Added status code for successful response

    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Register a user
// Login a user

export default router;
