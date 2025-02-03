import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    chatId: { type: String, required: true, trim: true }, // Adicionando o campo chatId
    verificationCode: { type: String },
    codeExpiration: { type: Date }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await argon2.hash(this.password);
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;