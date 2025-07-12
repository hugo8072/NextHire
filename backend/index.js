/**
 * Express Application Entry Point
 * ------------------------------
 * Sets up the Express server, applies security and CORS middleware,
 * loads environment variables, connects to the database, and registers route handlers.
 */

import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import './db.js'; // Import database configuration

import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8443;

// Middleware for parsing JSON requests
app.use(json());

// CORS middleware configuration for cross-origin requests
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], // Allowed headers
  credentials: true, // Allow cookies and credentials
}));

// Security middleware using Helmet
app.use(helmet());

// Register route handlers
app.use('/users', userRoutes); // User-related routes
app.use('/jobs', jobRoutes);   // Job-related routes

// Simple login route example
app.post('/login', (req, res) => {
  res.status(200).json({ message: 'Login successful' });
});

// Start HTTP server and listen on specified port
app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

// Export app instance for testing purposes
export default app;