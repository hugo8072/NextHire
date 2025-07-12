/**
 * Database Connection Configuration
 * ---------------------------------
 * Connects to MongoDB using Mongoose.
 * Loads environment variables from .env for connection details.
 * Exits the process if required variables are missing or connection fails.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get MongoDB connection details from environment variables
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

// Validate required environment variables
if (!MONGO_URL || !DB_NAME) {
  console.error('MONGO_URL or DB_NAME not defined in .env file');
  process.exit(1); // Exit process with error code
}

// Establish connection to MongoDB database
mongoose.connect(MONGO_URL, { dbName: DB_NAME })
  .then(() => {
    console.log('Successfully connected to database!');
  })
  .catch((err) => {
    console.log('Error connecting to database: ' + err);
    process.exit(1);
  });