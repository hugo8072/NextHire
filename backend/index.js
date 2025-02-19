import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;  // Destructuring 'json' from body-parser. necessary as we imported with import instead of require
import dotenv from 'dotenv';
import cors from 'cors';  // Importing cors middleware
import './db.js';

// Load environment variables from the .env file
dotenv.config();

// Creating the express instance
const app = express();

// Using the 'PORT' environment variable from the .env file (or 8000 as default)
const PORT = 8000; //CHANGE THIS TO ENV IN THE FUTURE.

// Middleware for JSON parsing
app.use(json());

// Middleware for CORS
app.use(cors({
  origin: 'http://localhost:3000', // Specify the allowed origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permite os métodos necessários
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true, // Permite o envio de cookies e autenticação
}));

// Using the user routes
import userRoutes from './routes/userRoutes.js'; // Correct path
import jobRoutes from './routes/jobRoutes.js'; // Correct path

app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);
// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Job application API is working!' });
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});