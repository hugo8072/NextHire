/**
 * Argon2 Utility Functions
 * ------------------------
 * Provides functions for securely hashing and verifying passwords using Argon2id.
 * - hashPassword: Hashes a plain password with recommended Argon2id options.
 * - verifyPassword: Verifies a plain password against a stored hash.
 */

import argon2 from 'argon2';

// Hash a password using Argon2id
export const hashPassword = async (plainPassword) => {
    const hashOptions = {
        type: argon2.argon2id, // Use Argon2id for better security
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4
    };
    return await argon2.hash(plainPassword, hashOptions);
};

// Verify a password against its hash
export const verifyPassword = async (hashedPassword, plainPassword) => {
    return await argon2.verify(hashedPassword, plainPassword);
};