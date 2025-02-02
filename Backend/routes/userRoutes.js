import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router(); 

// Test route to check if user routes are working
router.get('/', (req, res) => {
    res.send("User routes are working");
});

// Register route to create a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body; // Destructuring user data from the request body

        // Create a new User instance and save to database
        const user = new User({ name, email, password });
        await user.save();  // Save the user to the database

        // Send success response with the created user
        res.status(201).send({ user, message: "User created successfully!" });
    } catch (err) {
        // If an error occurs, send a 400 response with the error message
        res.status(400).send({ error: err.message }); 
    }
});

// Login route for user authentication
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;  // Destructuring email and password from the request body
        const user = await User.findOne({ email }); // Find user by email
    
        // If the user is not found, throw an error
        if (!user) {
            throw new Error('Unable to login. User not found');
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
    
        // If password doesn't match, throw an error
        if (!isMatch) {
            throw new Error('Unable to login. Invalid credentials');
        }

        // Generate a JWT token for the user
        const token = jwt.sign(
            { _id: user._id.toString() }, // Include user ID in the token payload
            process.env.JWT_SECRET_KEY  // Ensure this environment variable is set
        );
        
        // Log the generated token and the user ID for debugging purposes
        console.log('Generated Token:', token);
        console.log("_id:", user._id.toString());  // Print the user ID

        // Send the success response with user and token
        res.status(200).send({ user, token, message: "Logged in successfully!" });

    } catch (err) {
        // If an error occurs, send a 400 response with the error message
        res.status(400).send({ error: err.message });
    }
});

export default router;
