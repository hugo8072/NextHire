import argon2 from 'argon2';

// Hashing a password
export const hashPassword = async (plainPassword) => {
    const hashOptions = {
        type: argon2.argon2id, // Changed to argon2i
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4
    };
    return await argon2.hash(plainPassword, hashOptions);
};

// Verifying a password
export const verifyPassword = async (hashedPassword, plainPassword) => {
    return await argon2.verify(hashedPassword, plainPassword);
};