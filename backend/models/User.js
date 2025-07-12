/**
 * Mongoose schema and model for storing user accounts.
 *
 * - Each user document contains name, email, hashed password, phone number, and optional chatId for Telegram.
 * - Includes fields for 2FA verification code and its expiration.
 * - The 'role' field determines user permissions ('user' or 'master').
 * - Email is unique, required, and stored in lowercase.
 */

import mongoose from 'mongoose';

// Define the schema for a user account
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // User's full name
    email: { type: String, required: true, unique: true, trim: true, lowercase: true }, // Unique email address
    password: { type: String, required: true, trim: true }, // Hashed password
    phoneNumber: { type: String, required: true, trim: true }, // User's phone number
    chatId: { type: String, trim: true }, // Optional Telegram chat ID
    verificationCode: { type: String }, // 2FA verification code
    codeExpiration: { type: Date }, // Expiration date for the verification code
    role: { type: String, required: true, enum: ['user', 'master'], default: 'user' } // User role
});

// Create and export the User model from the schema
const User = mongoose.model('User', userSchema);

export default User;