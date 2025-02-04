import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    chatId: { type: String, required: true, trim: true },
    verificationCode: { type: String },
    codeExpiration: { type: Date }
});

const User = mongoose.model('User', userSchema);

export default User;