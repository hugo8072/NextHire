import mongoose from 'mongoose';  
import dotenv from 'dotenv';  

// Load environment variables from .env file
dotenv.config();

// Get the MongoDB connection URL and database name from the environment variables
//obs: getting error with 'process' even working. CHECK ASAP
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

// Check if the MONGO_URL and DB_NAME are available, otherwise log an error
if (!MONGO_URL) {
  console.error('MONGO_URL is not defined in the .env file');
  process.exit(1);  
}

if (!DB_NAME) {
  console.error('DB_NAME is not defined in the .env file');
  process.exit(1);  
}


mongoose.connect(MONGO_URL, {
  dbName: DB_NAME
}).then(() => {
  console.log('Connected to the database. Oléeeee!');
}).catch((err) => {
  console.log('Error connecting to the database: ' + err);
});